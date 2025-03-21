// import { Pool } from "pg";
// import fs from "fs";
// import path from "path";

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT || "5432", 10),
// });

// async function setupDatabase() {
//   try {
//     const schemaPath = path.join(__dirname, "schema.sql");
//     const schemaSql = fs.readFileSync(schemaPath, "utf8");
//     await pool.query(schemaSql);
//     console.log("Banco de dados configurado com sucesso!");
//   } catch (error) {
//     console.error("Erro ao configurar o banco:", error);
//   } finally {
//     await pool.end();
//   }
// }

// setupDatabase();
// src/db/setup.ts
import { Pool } from "pg";
import * as fs from "fs"; // Corrigido para CommonJS
import * as path from "path"; // Corrigido para CommonJS
import * as dotenv from "dotenv"; // Importar dotenv

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

console.log(
  "user: " + process.env.DB_USER,
  "host:" + process.env.DB_HOST,
  "database:" + process.env.DB_NAME,
  "password:" + process.env.DB_PASSWORD,
  "port:" + parseInt(process.env.DB_PORT || "5432", 10)
);

async function setupDatabase() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schemaSql);
    console.log("Banco de dados configurado com sucesso!");
  } catch (error) {
    console.error("Erro ao configurar o banco:", error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
