// import { NextRequest, NextResponse } from "next/server";
// import { Pool } from "pg";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/route";

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT || "5432", 10),
// });

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session)
//     return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

//   const formData = await req.formData();
//   const file = formData.get("csv") as File;
//   const text = await file.text();

//   const client = await pool.connect(); // Usar um client para transação

//   try {
//     await client.query("BEGIN"); // Iniciar transação

//     // Criar tabela temporária
//     await client.query(`
//       DROP TABLE IF EXISTS temp_gtfs;
//       CREATE TABLE temp_gtfs (
//           route_short_name VARCHAR(50), route_long_name VARCHAR(255), route_color VARCHAR(6),
//           route_text_color VARCHAR(6), route_type INTEGER, stop_id VARCHAR(50),
//           stop_name VARCHAR(255), stop_desc TEXT, stop_lat DOUBLE PRECISION,
//           stop_lon DOUBLE PRECISION, route_id VARCHAR(50), trip_id VARCHAR(100),
//           service_id VARCHAR(50), stop_sequence INTEGER
//       );
//     `);

//     // Usar COPY com Buffer
//     const copyQuery = `COPY temp_gtfs FROM STDIN WITH (FORMAT csv, HEADER true)`;
//     await client.query({
//       text: copyQuery,
//       values: [],
//       // Passar o texto como buffer
//       // @ts-ignore: O pg não tem tipagem perfeita para COPY FROM STDIN com buffer
//       binary: Buffer.from(text),
//     });

//     // Atualizar tabelas principais
//     await client.query(`
//       INSERT INTO stops (stop_id, stop_name, stop_desc, stop_lat, stop_lon, geom)
//       SELECT DISTINCT stop_id, stop_name, stop_desc, stop_lat, stop_lon,
//              ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326)
//       FROM temp_gtfs
//       ON CONFLICT (stop_id) DO UPDATE SET
//           stop_name = EXCLUDED.stop_name, stop_desc = EXCLUDED.stop_desc,
//           stop_lat = EXCLUDED.stop_lat, stop_lon = EXCLUDED.stop_lon,
//           geom = EXCLUDED.geom;

//       INSERT INTO routes (route_id, route_short_name, route_long_name, route_color, route_text_color, route_type)
//       SELECT DISTINCT route_id, route_short_name, route_long_name, route_color, route_text_color, route_type
//       FROM temp_gtfs
//       ON CONFLICT (route_id) DO UPDATE SET
//           route_short_name = EXCLUDED.route_short_name, route_long_name = EXCLUDED.route_long_name,
//           route_color = EXCLUDED.route_color, route_text_color = EXCLUDED.route_text_color,
//           route_type = EXCLUDED.route_type;

//       INSERT INTO trips (trip_id, route_id, service_id)
//       SELECT DISTINCT trip_id, route_id, service_id
//       FROM temp_gtfs
//       ON CONFLICT (trip_id) DO NOTHING;

//       INSERT INTO stop_times (trip_id, stop_id, stop_sequence)
//       SELECT trip_id, stop_id, stop_sequence
//       FROM temp_gtfs
//       ON CONFLICT (trip_id, stop_id) DO NOTHING;

//       DROP TABLE temp_gtfs;
//     `);

//     await client.query("COMMIT"); // Confirmar transação
//     return NextResponse.json({ message: "Banco atualizado com sucesso" });
//   } catch (error) {
//     await client.query("ROLLBACK"); // Reverter em caso de erro
//     console.error("Erro ao atualizar o banco:", error);
//     return NextResponse.json(
//       { error: "Erro ao atualizar o banco" },
//       { status: 500 }
//     );
//   } finally {
//     client.release(); // Liberar o client
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { Pool, PoolClient } from "pg";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { Readable } from "stream"; // Para criar um stream a partir do texto

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

interface ExtendedSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export async function POST(req: NextRequest) {
  const session: ExtendedSession | null = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("csv") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado" },
      { status: 400 }
    );
  }
  if (file.type !== "text/csv") {
    return NextResponse.json(
      { error: "Apenas arquivos CSV são permitidos" },
      { status: 400 }
    );
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Arquivo muito grande" },
      { status: 400 }
    );
  }

  const text = await file.text();
  let client: PoolClient | null = null;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Criar tabela temporária
    await client.query(`
      DROP TABLE IF EXISTS temp_gtfs;
      CREATE TABLE temp_gtfs (
          route_short_name VARCHAR(50), route_long_name VARCHAR(255), route_color VARCHAR(6),
          route_text_color VARCHAR(6), route_type INTEGER, stop_id VARCHAR(50),
          stop_name VARCHAR(255), stop_desc TEXT, stop_lat DOUBLE PRECISION,
          stop_lon DOUBLE PRECISION, route_id VARCHAR(50), trip_id VARCHAR(100),
          service_id VARCHAR(50), stop_sequence INTEGER
      );
    `);

    // Usar COPY com stream
    const copyQuery = `COPY temp_gtfs FROM STDIN WITH (FORMAT csv, HEADER true)`;
    const stream = client.query(copyQuery); // Inicia o comando COPY
    const readableStream = Readable.from(text); // Cria um stream a partir do texto do CSV

    // Pipe do texto do CSV para o COPY
    await new Promise((resolve, reject) => {
      readableStream
        .pipe(stream as any)
        .on("finish", resolve)
        .on("error", reject);
    });

    // Atualizar tabelas principais
    await client.query(`
      INSERT INTO stops (stop_id, stop_name, stop_desc, stop_lat, stop_lon, geom)
      SELECT DISTINCT stop_id, stop_name, stop_desc, stop_lat, stop_lon,
             ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326)
      FROM temp_gtfs
      ON CONFLICT (stop_id) DO UPDATE SET
          stop_name = EXCLUDED.stop_name, stop_desc = EXCLUDED.stop_desc,
          stop_lat = EXCLUDED.stop_lat, stop_lon = EXCLUDED.stop_lon,
          geom = EXCLUDED.geom;

      INSERT INTO routes (route_id, route_short_name, route_long_name, route_color, route_text_color, route_type)
      SELECT DISTINCT route_id, route_short_name, route_long_name, route_color, route_text_color, route_type
      FROM temp_gtfs
      ON CONFLICT (route_id) DO UPDATE SET
          route_short_name = EXCLUDED.route_short_name, route_long_name = EXCLUDED.route_long_name,
          route_color = EXCLUDED.route_color, route_text_color = EXCLUDED.route_text_color,
          route_type = EXCLUDED.route_type;

      INSERT INTO trips (trip_id, route_id, service_id)
      SELECT DISTINCT trip_id, route_id, service_id
      FROM temp_gtfs
      ON CONFLICT (trip_id) DO NOTHING;

      INSERT INTO stop_times (trip_id, stop_id, stop_sequence)
      SELECT trip_id, stop_id, stop_sequence
      FROM temp_gtfs
      ON CONFLICT (trip_id, stop_id) DO NOTHING;

      DROP TABLE temp_gtfs;
    `);

    await client.query("COMMIT");
    return NextResponse.json({ message: "Banco atualizado com sucesso" });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Erro ao atualizar o banco:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar o banco" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
