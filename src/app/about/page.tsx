import { seo, jsonLd } from "@/lib/seo";
export const metadata = seo(
  "Giới thiệu | Tuần 8",
  "Tìm hiểu xác thực, phân quyền và SEO trong ứng dụng Next.js.",
  "/about",
);
export default function About() {
  return (
    <main>
      <h1>Giới thiệu dự án</h1>
      <p>
        Bài thực hành Next.js: đăng nhập GitHub hoặc email, phân quyền
        admin/user và tối ưu SEO.
      </p>
      <h2>Bảo vệ nhiều lớp</h2>
      <p>
        Middleware sàng lọc yêu cầu. Trang và Server Action kiểm tra lại phiên
        đăng nhập trên máy chủ.
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd("Giới thiệu dự án", "/about"),
        }}
      />
    </main>
  );
}
