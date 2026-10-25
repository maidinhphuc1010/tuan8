import type { Metadata } from "next";
export const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
export function seo(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      locale: "vi_VN",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Tuần 8 — Next.js",
        },
      ],
    },
  };
}
export function jsonLd(title: string, path: string) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: new URL(path, siteUrl).href,
    inLanguage: "vi",
  }).replace(/</g, "\\u003c");
}
