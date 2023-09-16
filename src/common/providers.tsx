"use client";

import "~/styles/globals.css";
import Layout from "~/layout/Layout";
import { Toaster } from "react-hot-toast";
import { DefaultSeo } from "next-seo";
import { api } from "~/utils/api";

// This should be more dynamic
const SITE_URL = "https://robavo.net";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DefaultSeo
        defaultTitle="ImageGen"
        titleTemplate="ImageGen | %s"
        description="An AI image generator gallery"
        openGraph={{
          type: "website",
          title: "ImageGen",
          description: "An AI image generator gallery",
          url: SITE_URL,
          images: [
            {
              url: `${SITE_URL}/icons/icon-512x512.png`,
              width: 512,
              height: 512,
              alt: "ImageGen",
            },
            {
              url: `${SITE_URL}/icons/icon-128x128.png`,
              width: 128,
              height: 128,
              alt: "ImageGen",
            },
          ],
        }}
        twitter={{
          cardType: "summary_large_image",
          site: SITE_URL,
        }}
        additionalLinkTags={[
          {
            rel: "manifest",
            href: "/manifest.json",
          },
        ]}
      />
      <Layout>{children}</Layout>
      <Toaster />
    </>
  );
};

export default api.withTRPC(Providers);
