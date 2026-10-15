import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function query(sql, params = []) {
  const result = await client.execute({
    sql,
    args: params,
  });
  return result.rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function exec(sql, params = []) {
  await client.execute({
    sql,
    args: params,
  });
}
