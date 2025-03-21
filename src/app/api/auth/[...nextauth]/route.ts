// // app/api/auth/[...nextauth]/route.ts
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { Pool } from "pg";
// import bcrypt from "bcrypt";

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: parseInt(process.env.DB_PORT || "5432", 10),
// });

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) return null;

//         const { rows } = await pool.query(
//           "SELECT * FROM users WHERE username = $1",
//           [credentials.username]
//         );
//         const user = rows[0];

//         if (
//           user &&
//           (await bcrypt.compare(credentials.password, user.password))
//         ) {
//           return { id: user.id, name: user.username, email: user.email };
//         }
//         return null;
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/login", // Página de login personalizada
//   },
//   secret: process.env.NEXTAUTH_SECRET, // Adicione isso no .env.local
//   session: {
//     strategy: "jwt", // Define que a sessão será gerenciada por JWT
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       // Quando o usuário faz login, adiciona informações ao token
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // Passa as informações do token para a sessão
//       session.user.id = token.id;
//       session.user.email = token.email;
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

// app/api/auth/[...nextauth]/route.ts
import NextAuth, {
  AuthOptions,
  Session,
  User as NextAuthUser,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";

// Estender o tipo Session para incluir id
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Adicionamos id como obrigatório
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Estender o tipo JWT para incluir id
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
  }
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

// Usamos o tipo User do NextAuth diretamente
type User = NextAuthUser;

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
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
  session: {
    strategy: "jwt" as const, // Define explicitamente como "jwt"
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User; // Usamos o tipo User do NextAuth
      account?: any;
      profile?: any;
      trigger?: "signIn" | "signUp" | "update";
      isNewUser?: boolean;
      session?: any;
    }): Promise<JWT> {
      if (user) {
        token.id = user.id; // id é string
        token.email = user.email; // email pode ser string | null
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id!; // id está garantido pelo JWT
        session.user.email = token.email; // email pode ser string | null
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
