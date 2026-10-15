import { queryOne } from "../../lib/db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { order_number } = req.query;

    if (!order_number) {
      return res.status(400).json({ message: "order_number diperlukan" });
    }

    const request = await queryOne("SELECT * FROM license_requests WHERE order_number = ?", [order_number]);
    if (!request) {
      return res.status(404).json({ message: "Permintaan tidak ditemukan" });
    }

    return res.status(200).json({
      request_id: request.id,
      status: request.status,
      license_code: request.status === "approved" ? request.license_code : null,
      created_at: request.created_at,
      updated_at: request.updated_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kesalahan server" });
  }
}
