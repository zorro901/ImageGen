import { type SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";
import { env } from "~/env.mjs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";

export default {
  config(_input) {
    return {
      name: "ImageGen",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const certificate = acm.Certificate.fromCertificateArn(
        stack,
        "Certificate",
        process.env.AWS_CERTIFICATE_ARN ?? ""
      );
      const site = new NextjsSite(stack, "ImageGenSite", {
        timeout: "1 minute",
        environment: {
          ...env,
        },
        customDomain: {
          isExternalDomain: true,
          domainName: "www.robavo.net",
          alternateNames: ["robavo.net"],
          cdk: {
            certificate,
          },
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });

    app.setDefaultFunctionProps({
      logRetention: "one_week",
    });
  },
} satisfies SSTConfig;
