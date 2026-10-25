import Link from "next/link";
import { requireRole } from "@/lib/auth";
export const metadata = {
  title: "Tài khoản",
  robots: { index: false, follow: false },
};
export default async function Dashboard() {
  const session = await requireRole();
  return (
    <main>
      <h1>Tài khoản</h1>
      <p>
        {session.user.email} — {session.user.role}
      </p>
      <Link prefetch={false} href="/api/auth/signout">
        Đăng xuất
      </Link>
    </main>
  );
}
