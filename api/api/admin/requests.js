import { query } from "../../lib/db.js";
import { verifyJWT } from "../../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const auth = req.headers.authorization?.split(" ")[1];
    if (!auth || !verifyJWT(auth)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requests = await query(
      `SELECT lr.id, lr.order_number, o.customer_name, o.email, 
              lr.status, lr.is_seen, lr.created_at, lr.updated_at
       FROM license_requests lr
       JOIN orders o ON lr.order_number = o.order_number
       ORDER BY lr.created_at DESC`
    );

    const pending = await query("SELECT COUNT(*) as count FROM license_requests WHERE status = 'pending'");

    return res.status(200).json({
      requests,
      pending_count: pending[0]?.count || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kesalahan server" });
  }
}
