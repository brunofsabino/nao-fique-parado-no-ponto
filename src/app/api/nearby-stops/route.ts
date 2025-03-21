import { Pool } from "pg";
import { NextRequest, NextResponse } from "next/server";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "1000";

  const query = `
    SELECT stop_id, stop_name, stop_lat, stop_lon,
           ST_Distance(geom, ST_SetSRID(ST_MakePoint($1::double precision, $2::double precision), 4326)::geography) AS distance
    FROM stops
    WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1::double precision, $2::double precision), 4326)::geography, $3::integer)
    ORDER BY distance
    LIMIT 10;
  `;

  try {
    const { rows } = await pool.query(query, [lng, lat, radius]);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar pontos" },
      { status: 500 }
    );
  }
}
