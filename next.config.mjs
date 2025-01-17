/* eslint-disable @typescript-eslint/ban-ts-comment */
import {env} from "./src/env.mjs";
import nextPWA from "next-pwa";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

if (process.env.NEXT_OUTPUT) {
  console.log(`Build output: ${process.env.NEXT_OUTPUT}`);
}

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  output: process.env.NEXT_OUTPUT ? process.env.NEXT_OUTPUT : undefined,
  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        hostname: "placehold.co",
      },
      {
        hostname: `${env.MY_AWS_BUCKET_NAME}.s3.amazonaws.com`,
      },
      {
        hostname: "gen-image-test-9xa.s3.amazonaws.com",
      },
      {
        hostname: "img.clerk.com",
      },
    ],
  },
};

// @ts-ignore
export default withPWA(config);
