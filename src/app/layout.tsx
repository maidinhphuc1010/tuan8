import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/seo";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tuần 8",
  description: "Thực hành NextAuth và SEO",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <header>
          <nav aria-label="Điều hướng chính">
            <Link href="/">Trang chủ</Link> ·{" "}
            <Link href="/about">Giới thiệu</Link> ·{" "}
            <Link prefetch={false} href="/dashboard">
              Tài khoản
            </Link>{" "}
            ·{" "}
            <Link prefetch={false} href="/admin">
              Quản trị
            </Link>{" "}
            ·{" "}
            <Link prefetch={false} href="/api/auth/signin">
              Đăng nhập
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
