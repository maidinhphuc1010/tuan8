import { scryptSync, timingSafeEqual } from "node:crypto";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { redirect } from "next/navigation";

// Demo accounts are provisioned by the operator, never by client input.
function verify(password: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  if (!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  const expected = Buffer.from(hash, "hex");
  return timingSafeEqual(scryptSync(password, salt, 64), expected);
}
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 3600 },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    Credentials({
      name: "Email và mật khẩu",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || credentials.password.length > 128) return null;
        for (const role of ["admin", "user"] as const) {
          const prefix = role.toUpperCase();
          const email = process.env[`${prefix}_EMAIL`];
          const hash = process.env[`${prefix}_PASSWORD_HASH`];
          if (
            email &&
            hash &&
            credentials.email.toLowerCase() === email.toLowerCase() &&
            verify(credentials.password, hash)
          ) {
            return { id: `local:${role}`, email, name: role, role };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = account?.provider === "credentials" ? user.role : "user";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
export async function requireRole(role?: "admin" | "user") {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  if (role && session.user.role !== role) redirect("/forbidden");
  return session;
}
