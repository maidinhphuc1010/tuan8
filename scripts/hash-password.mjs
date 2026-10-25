import { randomBytes, scryptSync } from "node:crypto";
const password = process.env.PASSWORD_TO_HASH;
if (!password || password.length < 12 || password.length > 128)
  throw new Error("Set PASSWORD_TO_HASH to a password of 12–128 characters.");
const salt = randomBytes(16).toString("hex");
console.log(`${salt}:${scryptSync(password, salt, 64).toString("hex")}`);
