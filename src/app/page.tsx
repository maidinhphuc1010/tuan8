import { seo, jsonLd } from "@/lib/seo";
export const metadata = seo(
  "Trang chủ | Tuần 8",
  "Ứng dụng thực hành đăng nhập an toàn, phân quyền và SEO với Next.js.",
  "/",
);

export default function Home() {
  return (
    <main>
      <h1>Next.js: xác thực và SEO</h1>
      <p>Đăng nhập bằng GitHub hoặc email và mật khẩu để truy cập tài khoản.</p>
      <h2>Phân quyền rõ ràng</h2>
      <p>
        Người dùng có trang tài khoản riêng; quản trị viên được truy cập khu vực
        quản trị có bảo vệ nhiều lớp.
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd("Trang chủ Tuần 8", "/") }}
      />
    </main>
  );
}
