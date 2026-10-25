import { requireRole } from "@/lib/auth";
import { verifyAdmin } from "./actions";
export const metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  await requireRole("admin");
  const params = await searchParams;
  return (
    <main>
      <h1>Quản trị</h1>
      <p>Chỉ admin được truy cập.</p>
      <form action={verifyAdmin}>
        <button>Xác minh quyền bằng Server Action</button>
      </form>
      {params.verified === "1" && <p>Server Action đã xác minh quyền admin.</p>}
    </main>
  );
}
