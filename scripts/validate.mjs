import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { spawn } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const phase = process.argv[2] ?? "before";
if (!["before", "after"].includes(phase))
  throw new Error("Expected before or after");
const base = "http://localhost:3100";
const password = randomBytes(24).toString("hex");
const salt = randomBytes(16).toString("hex");
const hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const env = {
  ...process.env,
  NEXTAUTH_URL: base,
  NEXTAUTH_SECRET: randomBytes(32).toString("hex"),
  ADMIN_EMAIL: "admin@e2e.test",
  USER_EMAIL: "user@e2e.test",
  ADMIN_PASSWORD_HASH: hash,
  USER_PASSWORD_HASH: hash,
};
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", "3100"],
  { env, stdio: "ignore" },
);
const output = `reports/${phase}`;
await mkdir(output, { recursive: true });
let browser;
const results = [];
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert(ready, "Server failed to start");
  browser = await chromium.launch();
  async function check(name, fn) {
    await fn();
    results.push({ name, status: "passed" });
    console.log("PASS", name);
  }
  async function login(page, role, pass = password) {
    await page.goto(
      `${base}/api/auth/signin?callbackUrl=${encodeURIComponent(base + "/dashboard")}`,
    );
    await page.getByLabel("Email", { exact: true }).fill(`${role}@e2e.test`);
    await page.getByLabel("Mật khẩu", { exact: true }).fill(pass);
    await page
      .getByRole("button", { name: "Sign in with Email và mật khẩu" })
      .click();
  }
  const guest = await browser.newContext();
  const page = await guest.newPage();
  await check("Guest blocked from protected pages", async () => {
    for (const path of ["/admin", "/dashboard"]) {
      await page.goto(base + path);
      assert(page.url().includes("/api/auth/signin"));
    }
  });
  await check("Wrong password rejected", async () => {
    await login(page, "user", "incorrect-password");
    await page.waitForURL(/error=CredentialsSignin/);
    assert.deepEqual(
      await (await guest.request.get(base + "/api/auth/session")).json(),
      {},
    );
  });
  await check("User login/session and admin denied", async () => {
    await login(page, "user");
    await page.waitForURL("**/dashboard");
    const session = await (
      await guest.request.get(base + "/api/auth/session")
    ).json();
    assert.equal(session.user.role, "user");
    assert.equal(session.user.id, "local:user");
    await page.goto(base + "/admin");
    assert(page.url().endsWith("/forbidden"));
  });
  const admin = await browser.newContext();
  const adminPage = await admin.newPage();
  await check("Admin login and Server Action", async () => {
    await login(adminPage, "admin");
    await adminPage.waitForURL("**/dashboard");
    await adminPage.goto(base + "/admin");
    await adminPage
      .getByRole("button", { name: "Xác minh quyền bằng Server Action" })
      .click();
    await adminPage.waitForURL("**/admin?verified=1");
    await adminPage
      .getByText("Server Action đã xác minh quyền admin.")
      .waitFor({ state: "visible" });
  });
  await check(
    "Replay Server Action as user on admin route is blocked by middleware",
    async () => {
      const html = await (await admin.request.get(base + "/admin")).text();
      const action = html.match(/name="(\$ACTION_ID_[^"]+)"/);
      assert(action, "Server action ID missing");
      const response = await guest.request.post(base + "/admin", {
        data: "[]",
        headers: {
          origin: base,
          "Next-Action": action[1].replace("$ACTION_ID_", ""),
          "Content-Type": "text/plain;charset=UTF-8",
        },
        maxRedirects: 0,
      });
      assert.equal(response.status(), 307, await response.text());
      assert(response.headers().location?.includes("/forbidden"));
    },
  );
  await check("Logout invalidates browser session", async () => {
    await page.goto(base + "/api/auth/signout");
    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/api/auth/signout") &&
          r.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Sign out" }).click(),
    ]);
    await page.waitForLoadState("networkidle");
    assert.deepEqual(
      await (await guest.request.get(base + "/api/auth/session")).json(),
      {},
    );
    await page.goto(base + "/dashboard");
    assert(page.url().includes("/api/auth/signin"));
  });
  await writeFile(
    `${output}/e2e.json`,
    JSON.stringify(
      {
        date: new Date().toISOString(),
        results,
        oauth: "Not tested: requires interactive GitHub authorization",
      },
      null,
      2,
    ),
  );
  await browser.close();
  browser = undefined;
  const scores = [];
  for (const path of ["/", "/about"])
    for (let run = 1; run <= 3; run++) {
      const auditBrowser = await chromium.launch({
        args: ["--remote-debugging-port=9222"],
      });
      try {
        const report = await lighthouse(base + path, {
          port: 9222,
          output: ["html", "json"],
          onlyCategories: [
            "performance",
            "accessibility",
            "best-practices",
            "seo",
          ],
        });
        assert(report && !report.lhr.runtimeError, "Lighthouse runtime error");
        const name = `${path === "/" ? "home" : "about"}-${run}`;
        await writeFile(`${output}/${name}.html`, report.report[0]);
        await writeFile(`${output}/${name}.json`, report.report[1]);
        const row = {
          path,
          run,
          scores: Object.fromEntries(
            Object.entries(report.lhr.categories).map(([k, v]) => [
              k,
              Math.round(v.score * 100),
            ]),
          ),
        };
        scores.push(row);
        console.log(JSON.stringify(row));
      } finally {
        await auditBrowser.close();
      }
    }
  await writeFile(`${output}/scores.json`, JSON.stringify(scores, null, 2));
} finally {
  if (browser) await browser.close();
  server.kill();
}
