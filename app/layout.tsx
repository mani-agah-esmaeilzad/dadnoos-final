import "@/app/globals.css";

import type { Metadata, Viewport } from "next";

import * as texts from "@/app/_text/common.js";

import { vazirmatn } from "./fonts";

import { cn } from "@/app/_lib/utils";

import RootLayoutClient from "@/app/layoutClient";
import PullToRefreshLayout from "@/app/_ui/Pull-to-Refresh";

import { ThemeProvider } from "@/context/ThemeProvider";

export const metadata: Metadata = {
  keywords: texts.keywords,
  title: texts.websiteTitle,
  description: texts.websiteDescription,
};

export const viewport: Viewport = {
  initialScale: 1,
  userScalable: false,
  viewportFit: "cover",
  width: "device-width",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="auto">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="Dadnoos" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={cn(
          "tracking-wide leading-relaxed antialiased",
          vazirmatn.variable,
        )}
      >
        <ThemeProvider>
          <PullToRefreshLayout>
            <RootLayoutClient>{children}</RootLayoutClient>
          </PullToRefreshLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
