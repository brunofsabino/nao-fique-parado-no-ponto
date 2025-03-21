// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const { rows } = await pool.query(
          "SELECT * FROM users WHERE username = $1",
          [credentials.username]
        );
        const user = rows[0];

        if (
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          return { id: user.id, name: user.username, email: user.email };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login", // Página de login personalizada
  },
  secret: process.env.NEXTAUTH_SECRET, // Adicione isso no .env.local
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
