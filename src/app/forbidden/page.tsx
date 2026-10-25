export const metadata = {
  title: "Không đủ quyền",
  robots: { index: false, follow: false },
};
import Link from "next/link";
export default function Forbidden() {
  return (
    <main>
      <h1>Không đủ quyền truy cập</h1>
      <p>Tài khoản của bạn không có quyền thực hiện thao tác này.</p>
      <Link href="/">Về trang chủ</Link>
    </main>
  );
}
