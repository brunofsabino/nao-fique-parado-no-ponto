// import { NextRequest, NextResponse } from 'next/server';

// extern let sptransCookie: string | null;

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const stopId = searchParams.get('stopId');

//   if (!stopId) {
//     return NextResponse.json({ error: 'stopId é obrigatório' }, { status: 400 });
//   }

//   if (!sptransCookie) {
//     return NextResponse.json({ error: 'Não autenticado na SPTrans' }, { status: 401 });
//   }

//   try {
//     const response = await fetch(
//       `https://api.olhovivo.sptrans.com.br/v2.1/Previsao/Parada?codigoParada=${stopId}`,
//       {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Cookie: sptransCookie,
//         },
//       }
//     );

//     if (!response.ok) throw new Error('Erro ao buscar previsão');

//     const data = await response.json();
//     const arrivalTime = data?.p?.l[0]?.vs[0]?.t || 'Indisponível';
//     return NextResponse.json({ arrivalTime });
//   } catch (error) {
//     console.error('Erro ao buscar previsão:', error);
//     return NextResponse.json({ error: 'Erro ao buscar previsão' }, { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { getSptransCookie } from "@/lib/sptrans";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const stopId = searchParams.get("stopId");

//   if (!stopId) {
//     return NextResponse.json(
//       { error: "stopId é obrigatório" },
//       { status: 400 }
//     );
//   }

//   const sptransCookie = getSptransCookie();
//   if (!sptransCookie) {
//     return NextResponse.json(
//       { error: "Não autenticado na SPTrans" },
//       { status: 401 }
//     );
//   }

//   try {
//     const response = await fetch(
//       `https://api.olhovivo.sptrans.com.br/v2.1/Previsao/Parada?codigoParada=${stopId}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Cookie: sptransCookie,
//         },
//       }
//     );
//     console.log(sptransCookie);
//     if (!response.ok) throw new Error("Erro ao buscar previsão");

//     const data = await response.json();
//     //console.log(data);
//     const arrivalTime = data?.p?.l[0]?.vs[0]?.t || "Indisponível";
//     return NextResponse.json({ arrivalTime });
//   } catch (error) {
//     console.error("Erro ao buscar previsão:", error);
//     return NextResponse.json(
//       { error: "Erro ao buscar previsão" },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { getSptransCookie } from "@/lib/sptrans";

// async function getLineCode(
//   lineName: string,
//   cookie: string
// ): Promise<string | null> {
//   try {
//     const response = await fetch(
//       `https://api.olhovivo.sptrans.com.br/v2.1/Linha/Buscar?termosBusca=${encodeURIComponent(
//         lineName
//       )}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Cookie: cookie,
//         },
//       }
//     );

//     if (!response.ok) throw new Error("Erro ao buscar código da linha");
//     const data = await response.json();
//     console.log(`Resposta de /Linha/Buscar para ${lineName}:`, data);

//     const baseLineName = lineName.split("-")[0];
//     const line = data.find((l: any) => l.lt === baseLineName); // Pega o primeiro por padrão
//     if (!line) {
//       console.log(
//         `Nenhuma correspondência encontrada para ${baseLineName} em lt`
//       );
//     }
//     return line ? line.cl.toString() : null;
//   } catch (error) {
//     console.error("Erro ao buscar código da linha:", error);
//     return null;
//   }
// }

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const stopId = searchParams.get("stopId");
//   const routeId = searchParams.get("routeId");

//   if (!stopId || !routeId) {
//     return NextResponse.json(
//       { error: "stopId e routeId são obrigatórios" },
//       { status: 400 }
//     );
//   }

//   const sptransCookie = getSptransCookie();
//   if (!sptransCookie) {
//     return NextResponse.json(
//       { error: "Não autenticado na SPTrans" },
//       { status: 401 }
//     );
//   }

//   const cookieValue = sptransCookie.split(";")[0];

//   try {
//     const lineCode = await getLineCode(routeId, cookieValue);
//     if (!lineCode) {
//       throw new Error(`Código da linha não encontrado para ${routeId}`);
//     }

//     const response = await fetch(
//       // `https://api.olhovivo.sptrans.com.br/v2.1/Previsao?codigoParada=${stopId}&codigoLinha=${lineCode}`,
//       `https://api.olhovivo.sptrans.com.br/v2.1/Previsao/Linha?codigoLinha={lineCode}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Cookie: cookieValue,
//         },
//       }
//     );

//     if (!response.ok)
//       throw new Error(`Erro ao buscar previsão: ${response.statusText}`);

//     const data = await response.json();
//     console.log("Resposta completa de /Previsao:", data);

//     // Ajuste para lidar com diferentes formatos de resposta
//     let arrivalTime = "Indisponível";
//     if (
//       data?.l &&
//       data.l.length > 0 &&
//       data.l[0]?.vs &&
//       data.l[0].vs.length > 0
//     ) {
//       arrivalTime = data.l[0].vs[0].t;
//     } else if (
//       data?.p?.l &&
//       data.p.l.length > 0 &&
//       data.p.l[0]?.vs &&
//       data.p.l[0].vs.length > 0
//     ) {
//       arrivalTime = data.p.l[0].vs[0].t; // Caso o formato seja { "p": { "l": [...] } }
//     }

//     console.log("Dados da SPTrans:", data);
//     return NextResponse.json({ arrivalTime });
//   } catch (error) {
//     console.error("Erro ao buscar previsão:", error);
//     return NextResponse.json(
//       { error: "Erro ao buscar previsão" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { getSptransCookie } from "@/lib/sptrans";

async function getLineCode(
  lineName: string,
  cookie: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.olhovivo.sptrans.com.br/v2.1/Linha/Buscar?termosBusca=${encodeURIComponent(
        lineName
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
      }
    );

    if (!response.ok) throw new Error("Erro ao buscar código da linha");
    const data = await response.json();
    const baseLineName = lineName.split("-")[0];
    const line = data.find((l: any) => l.lt === baseLineName);
    return line ? line.cl.toString() : null;
  } catch (error) {
    console.error("Erro ao buscar código da linha:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stopId = searchParams.get("stopId");
  const routeId = searchParams.get("routeId");

  if (!stopId || !routeId) {
    return NextResponse.json(
      { error: "stopId e routeId são obrigatórios" },
      { status: 400 }
    );
  }

  const sptransCookie = getSptransCookie();
  if (!sptransCookie) {
    return NextResponse.json(
      { error: "Não autenticado na SPTrans" },
      { status: 401 }
    );
  }

  const cookieValue = sptransCookie.split(";")[0];

  try {
    const lineCode = await getLineCode(routeId, cookieValue);
    if (!lineCode) {
      throw new Error(`Código da linha não encontrado para ${routeId}`);
    }

    // Primeira tentativa: /Previsao/Linha
    let response = await fetch(
      `https://api.olhovivo.sptrans.com.br/v2.1/Previsao/Linha?codigoLinha=${lineCode}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieValue,
        },
      }
    );

    if (!response.ok)
      throw new Error(`Erro ao buscar previsão: ${response.statusText}`);
    const data = await response.json();
    console.log("Resposta de /Previsao/Linha:", data);

    let arrivalTime = "Indisponível";
    let busPositions: { py: number; px: number }[] = [];

    if (data.ps && data.ps.length > 0) {
      // Busca o tempo de chegada para o stopId específico
      data.ps.forEach((stop: any) => {
        if (stop.cp.toString() === stopId) {
          if (stop.vs && stop.vs.length > 0) {
            arrivalTime = stop.vs[0].t; // Pega o primeiro tempo previsto
          }
        }
        // Coleta posições dos ônibus
        stop.vs.forEach((vehicle: any) => {
          busPositions.push({ py: vehicle.py, px: vehicle.px });
        });
      });
    } else {
      // Fallback para /Posicao/Linha se ps estiver vazio
      response = await fetch(
        `https://api.olhovivo.sptrans.com.br/v2.1/Posicao/Linha?codigoLinha=${lineCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieValue,
          },
        }
      );

      if (!response.ok)
        throw new Error(`Erro ao buscar posição: ${response.statusText}`);
      const positionData = await response.json();
      console.log("Resposta de /Posicao/Linha:", positionData);

      if (positionData.vs && positionData.vs.length > 0) {
        busPositions = positionData.vs.map((vehicle: any) => ({
          py: vehicle.py,
          px: vehicle.px,
        }));
      }
    }

    return NextResponse.json({ arrivalTime, busPositions });
  } catch (error) {
    console.error("Erro ao buscar previsão:", error);
    return NextResponse.json(
      { error: "Erro ao buscar previsão" },
      { status: 500 }
    );
  }
}
