import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const routeShortName = searchParams.get("routeShortName");

  if (!routeShortName) {
    console.log("Erro: routeShortName não fornecido");
    return NextResponse.json(
      { error: "routeShortName é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    console.log(
      `Buscando traçado aproximado para routeShortName: ${routeShortName}`
    );

    const result = await client.query(
      `
      SELECT DISTINCT ON (s.stop_id) s.stop_lat AS shape_pt_lat, s.stop_lon AS shape_pt_lon
      FROM stops s
      JOIN stop_times st ON s.stop_id = st.stop_id
      JOIN trips t ON st.trip_id = t.trip_id
      JOIN routes r ON t.route_id = r.route_id
      WHERE r.route_short_name = $1
      ORDER BY s.stop_id, st.stop_sequence
      `,
      [routeShortName]
    );

    const path = result.rows;
    console.log(
      `Resultado da consulta: ${path.length} pontos encontrados`,
      path
    );
    client.release();

    if (path.length === 0) {
      console.log(`Nenhuma parada encontrada para ${routeShortName}`);
      return NextResponse.json(
        { error: "Nenhum traçado encontrado para a linha" },
        { status: 404 }
      );
    }

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Erro ao buscar traçado da linha:", error);
    return NextResponse.json(
      { error: "Erro ao buscar traçado" },
      { status: 500 }
    );
  }
}
