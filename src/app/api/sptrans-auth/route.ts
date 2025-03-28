// import { NextRequest, NextResponse } from "next/server";

// let sptransCookie: string | null = null;

// export async function POST(req: NextRequest) {
//   try {
//     const token = process.env.SPTRANS_API_TOKEN;
//     if (!token) throw new Error("Token da SPTrans não configurado");

//     const response = await fetch(
//       `https://api.olhovivo.sptrans.com.br/v2.1/Login/Autenticar?token=${encodeURIComponent(
//         token
//       )}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) throw new Error("Falha na autenticação SPTrans");

//     // Extrair o cookie da resposta
//     const setCookieHeader = response.headers.get("set-cookie");
//     if (setCookieHeader) {
//       sptransCookie = setCookieHeader;
//     }

//     const success = await response.json();
//     return NextResponse.json({ success, cookieStored: !!sptransCookie });
//   } catch (error) {
//     console.error("Erro ao autenticar SPTrans:", error);
//     return NextResponse.json(
//       { success: false, error: "Erro ao autenticar" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//   return NextResponse.json({ isAuthenticated: !!sptransCookie });
// }
import { setSptransCookie } from "@/lib/sptrans";
import { NextRequest, NextResponse } from "next/server";
//import { setSptransCookie } from "@/app/lib/sptrans";

export async function POST(req: NextRequest) {
  try {
    const token = process.env.NEXT_PUBLIC_SPTRANS_API_TOKEN;
    if (!token) throw new Error("Token da SPTrans não configurado");

    const response = await fetch(
      `https://api.olhovivo.sptrans.com.br/v2.1/Login/Autenticar?token=${encodeURIComponent(
        token
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Falha na autenticação SPTrans");
    //console.log(response);
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      setSptransCookie(setCookieHeader);
    }

    const success = await response.json();
    return NextResponse.json({ success, cookieStored: !!setCookieHeader });
  } catch (error) {
    console.error("Erro ao autenticar SPTrans:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao autenticar" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { getSptransCookie } = await import("@/lib/sptrans");
  return NextResponse.json({ isAuthenticated: !!getSptransCookie() });
}
