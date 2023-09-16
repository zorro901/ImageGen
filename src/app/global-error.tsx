"use client";

import ErrorPage from "~/app/error";

export default function GlobalError() {
  return (
    <html>
      <body>
        <ErrorPage statusCode={404} />
      </body>
    </html>
  );
}
