// import { NextRequest, NextResponse } from "next/server";
// import { Pool, PoolClient } from "pg";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]/route";
// import { Readable } from "stream"; // Para criar um stream a partir do texto

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT || "5432", 10),
// });

// interface ExtendedSession {
//   user: {
//     id: string;
//     name?: string | null;
//     email?: string | null;
//   };
// }

// export async function POST(req: NextRequest) {
//   const session: ExtendedSession | null = await getServerSession(authOptions);

//   if (!session) {
//     return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
//   }

//   const formData = await req.formData();
//   const file = formData.get("csv") as File | null;

//   if (!file) {
//     return NextResponse.json(
//       { error: "Nenhum arquivo enviado" },
//       { status: 400 }
//     );
//   }
//   if (file.type !== "text/csv") {
//     return NextResponse.json(
//       { error: "Apenas arquivos CSV são permitidos" },
//       { status: 400 }
//     );
//   }
//   if (file.size > 10 * 1024 * 1024) {
//     return NextResponse.json(
//       { error: "Arquivo muito grande" },
//       { status: 400 }
//     );
//   }

//   const text = await file.text();
//   let client: PoolClient | null = null;

//   try {
//     client = await pool.connect();
//     await client.query("BEGIN");

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

//     // Usar COPY com stream
//     const copyQuery = `COPY temp_gtfs FROM STDIN WITH (FORMAT csv, HEADER true)`;
//     const stream = client.query(copyQuery); // Inicia o comando COPY
//     const readableStream = Readable.from(text); // Cria um stream a partir do texto do CSV

//     // Pipe do texto do CSV para o COPY
//     await new Promise((resolve, reject) => {
//       readableStream
//         .pipe(stream as any)
//         .on("finish", resolve)
//         .on("error", reject);
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

//     await client.query("COMMIT");
//     return NextResponse.json({ message: "Banco atualizado com sucesso" });
//   } catch (error) {
//     if (client) await client.query("ROLLBACK");
//     console.error("Erro ao atualizar o banco:", error);
//     return NextResponse.json(
//       { error: "Erro ao atualizar o banco" },
//       { status: 500 }
//     );
//   } finally {
//     if (client) client.release();
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { Pool, PoolClient } from "pg";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]/route";

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT || "5432", 10),
// });

// interface ExtendedSession {
//   user: {
//     id: string;
//     name?: string | null;
//     email?: string | null;
//   };
// }

// export async function POST(req: NextRequest) {
//   const session: ExtendedSession | null = await getServerSession(authOptions);

//   if (!session) {
//     return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
//   }

//   const formData = await req.formData();
//   const file = formData.get("csv") as File | null;

//   if (!file) {
//     return NextResponse.json(
//       { error: "Nenhum arquivo enviado" },
//       { status: 400 }
//     );
//   }
//   if (file.type !== "text/csv") {
//     return NextResponse.json(
//       { error: "Apenas arquivos CSV são permitidos" },
//       { status: 400 }
//     );
//   }
//   // Limite aumentado para 50 MB, mas o stream reduz o impacto na memória
//   if (file.size > 50 * 1024 * 1024) {
//     return NextResponse.json(
//       { error: "Arquivo muito grande (máximo 50 MB)" },
//       { status: 400 }
//     );
//   }

//   // Usar stream diretamente do arquivo
//   const fileStream = file.stream();
//   let client: PoolClient | null = null;

//   try {
//     client = await pool.connect();
//     await client.query("BEGIN");

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

//     const copyQuery = `COPY temp_gtfs FROM STDIN WITH (FORMAT csv, HEADER true)`;
//     const copyStream = client.query(copyQuery);

//     await new Promise((resolve, reject) => {
//       fileStream
//         .pipe(copyStream as any)
//         .on("finish", resolve)
//         .on("error", reject);
//     });

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

//     await client.query("COMMIT");
//     return NextResponse.json({ message: "Banco atualizado com sucesso" });
//   } catch (error) {
//     if (client) await client.query("ROLLBACK");
//     console.error("Erro ao atualizar o banco:", error);
//     return NextResponse.json(
//       { error: "Erro ao atualizar o banco" },
//       { status: 500 }
//     );
//   } finally {
//     if (client) client.release();
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { Pool, PoolClient } from "pg";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { Readable } from "stream";
//import * as copyFrom from "pg-copy-streams/from"; // Biblioteca para COPY
import { from as copyFrom } from "pg-copy-streams"; // Biblioteca para COPY

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
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Arquivo muito grande (máximo 50 MB)" },
      { status: 400 }
    );
  }

  // Converter Web ReadableStream para Node Readable
  const fileStream = Readable.fromWeb(file.stream() as any); // Usamos 'as any' temporariamente para simplicidade
  let client: PoolClient | null = null;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

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

    // Usar pg-copy-streams para COPY FROM STDIN
    const copyQuery = `COPY temp_gtfs FROM STDIN WITH (FORMAT csv, HEADER true)`;
    const copyStream = client.query(copyFrom(copyQuery));

    await new Promise((resolve, reject) => {
      fileStream.pipe(copyStream).on("finish", resolve).on("error", reject);
    });

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
