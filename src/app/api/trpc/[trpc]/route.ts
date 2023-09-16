import {
  type FetchCreateContextFnOptions,
  fetchRequestHandler,
} from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/api/root";
import { clerkClient, getAuth, type User } from "@clerk/nextjs/server";
import { type RequestLike } from "@clerk/nextjs/dist/types/server/types";

const createTRPCContext = async ({ req }: FetchCreateContextFnOptions) => {
  const { userId } = getAuth(req as RequestLike);
  let user: User | null | undefined = null;

  if (userId) {
    user = await clerkClient.users.getUser(userId);
  }
  return {
    user,
  };
};
const handler = (request: Request) => {
  console.log(`incoming request ${request.url}`);
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: createTRPCContext,
  });
};

export { handler as GET, handler as POST };
