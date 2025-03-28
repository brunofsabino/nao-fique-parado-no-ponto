// import { NextRequest, NextResponse } from "next/server";
// import { Pool } from "pg";

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT || "5432", 10),
// });

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const stopId = searchParams.get("stopId");

//   if (!stopId) {
//     return NextResponse.json(
//       { error: "stopId é obrigatório" },
//       { status: 400 }
//     );
//   }

//   try {
//     const client = await pool.connect();
//     const result = await client.query(
//       `
//       SELECT DISTINCT r.route_short_name
//       FROM stop_times st
//       JOIN trips t ON st.trip_id = t.trip_id
//       JOIN routes r ON t.route_id = r.route_id
//       WHERE st.stop_id = $1
//       `,
//       [stopId]
//     );
//     const lines = result.rows.map((row) => row.route_short_name);
//     client.release();
//     return NextResponse.json({ lines });
//   } catch (error) {
//     console.error("Erro ao buscar linhas:", error);
//     return NextResponse.json(
//       { error: "Erro ao buscar linhas" },
//       { status: 500 }
//     );
//   }
// }
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
  const stopId = searchParams.get("stopId");

  if (!stopId) {
    return NextResponse.json(
      { error: "stopId é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT DISTINCT r.route_short_name, r.route_id
      FROM stop_times st
      JOIN trips t ON st.trip_id = t.trip_id
      JOIN routes r ON t.route_id = r.route_id
      WHERE st.stop_id = $1
      `,
      [stopId]
    );
    const lines = result.rows.map((row) => ({
      name: row.route_short_name,
      routeId: row.route_id,
    }));
    client.release();
    return NextResponse.json({ lines });
  } catch (error) {
    console.error("Erro ao buscar linhas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar linhas" },
      { status: 500 }
    );
  }
}
