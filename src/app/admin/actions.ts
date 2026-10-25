"use server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
export async function verifyAdmin() {
  await requireRole("admin");
  redirect("/admin?verified=1");
}
