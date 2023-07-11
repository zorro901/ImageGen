import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { generateImages, moderateContent } from '~/server/services/ai';
import { deleteFile, getImageUrl, uploadFiles } from '~/server/services/fileHandler';
import { GeneratedImages, UserAccounts } from '~/server/db/repositories';
import { MAX_IMAGE_COUNT, MAX_PROMPT_LENGTH } from '~/common/constants';

const getImagesResultScheme = z.object({
  images: z.array(z.object({ id: z.number(), url: z.string(), prompt: z.string(), createdAt: z.date() })),
  nextCursor: z.number().nullish()
})

export const imagesRouter = createTRPCRouter({
  // Get all images
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().trim().nullish(),
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish()
    }))
    .output(getImagesResultScheme)
    .query(async ({ ctx, input }) => {
      const { search, cursor } = input;
      const limit = input.limit ?? 100;

      const result = await GeneratedImages.getAllImages(ctx.user.id, { search, limit, page: cursor });
      const images = result.images.map(x => ({ ...x, url: getImageUrl(x.key) }));
      return { images, nextCursor: result.nextPage }
    }),

  // Generate a new image
  generateImage: protectedProcedure.input(z.object({
    prompt: z.string().trim().min(3).max(MAX_PROMPT_LENGTH)
  })).mutation(async ({ input: { prompt }, ctx }) => {

    try {
      const userAccount = await UserAccounts.getOrCreateUserAccount(ctx.user.id);

      if (!userAccount.isUnlimited && userAccount.imageGenerationTokens <= 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "You don't have enough tokens to generate images"
        })
      }

      const moderation = await moderateContent(prompt);

      if (moderation.isFlagged) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "The given prompt had been flagged as invalid"
        });
      }

      const images = await generateImages({ prompt, count: MAX_IMAGE_COUNT, userId: ctx.user.id });
      const blobs = images.map(img => img.blob);
      const imageResult = await uploadFiles(blobs, {
        metadata: {
          userId: ctx.user.id,
          prompt
        }
      });

      // Add generated images to the user
      const input = imageResult.map(x => ({ key: x.key, prompt }));
      await GeneratedImages.saveGeneratedImages(ctx.user.id, input)

      if (!userAccount.isUnlimited) {
        // Decrement tokens count
        await UserAccounts.decrementTokenCount(ctx.user.id, MAX_IMAGE_COUNT);
      }

      return imageResult.map(x => x.url);
    }
    catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : err?.toString() ?? "Something went wrong";
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        cause: err,
        message
      })
    }
  }),

  // Delete image
  deleteImage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const result = await GeneratedImages.deleteImage(ctx.user.id, id);

      if (result == null) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      await deleteFile(result.key);

      return result;
    })
});

