import { query, queryOne, exec } from "../../lib/db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { order_number } = req.body;

    if (!order_number || typeof order_number !== "string") {
      return res.status(400).json({ message: "order_number diperlukan" });
    }

    const order = await queryOne("SELECT * FROM orders WHERE order_number = ?", [order_number]);
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    let request = await queryOne("SELECT * FROM license_requests WHERE order_number = ?", [order_number]);
    if (request) {
      return res.status(200).json({
        request_id: request.id,
        status: request.status,
        license_code: request.status === "approved" ? request.license_code : null,
        created_at: request.created_at,
      });
    }

    const requestId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    await exec(
      "INSERT INTO license_requests (id, order_number, status, is_seen) VALUES (?, ?, ?, ?)",
      [requestId, order_number, "pending", 0]
    );

    return res.status(201).json({
      request_id: requestId,
      status: "pending",
      license_code: null,
      message: "Permintaan lisensi dikirim, tunggu persetujuan admin",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Kesalahan server" });
  }
}
