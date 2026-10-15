import crypto from "crypto";

export function generateJWT(payload) {
  const secret = process.env.JWT_SECRET;
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyJWT(token) {
  try {
    const secret = process.env.JWT_SECRET;
    const [header, body, sig] = token.split(".");
    const computed = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
    if (sig !== computed) throw new Error("Invalid signature");
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
}

export function generateLicenseCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const gen = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${gen()}-${gen()}-${gen()}`;
}
