import { queryOne, exec } from "../../lib/db.js";
import { verifyJWT } from "../../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const auth = req.headers.authorization?.split(" ")[1];
    if (!auth || !verifyJWT(auth)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { request_id } = req.body;
    if (!request_id) {
      return res.status(400).json({ message: "request_id diperlukan" });
    }

    const request = await queryOne("SELECT * FROM license_requests WHERE id = ?", [request_id]);
    if (!request) {
      return res.status(404).json({ message: "Request tidak ditemukan" });
    }

    await exec("UPDATE license_requests SET is_seen = 1 WHERE id = ?", [request_id]);

    return res.status(200).json({ message: "Request ditandai sudah dilihat" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kesalahan server" });
  }
}
