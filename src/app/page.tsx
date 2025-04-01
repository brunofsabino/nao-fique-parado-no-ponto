// 'use client';

// import { useState, useEffect } from 'react';
// import { Loader } from '@googlemaps/js-api-loader';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';

// // Tipagem para a localização do usuário
// interface Location {
//   lat: number;
//   lng: number;
// }

// // Tipagem para os pontos de ônibus do banco (GTFS)
// interface Stop {
//   stop_id: string;
//   stop_name: string;
//   stop_lat: number;
//   stop_lon: number;
//   distance: number;
// }

// // Tipagem para o ponto selecionado
// interface SelectedStop extends Stop {
//   geometry?: { location: google.maps.LatLng };
// }

// export default function Home() {
//   const [userLocation, setUserLocation] = useState<Location | null>(null);
//   const [busStops, setBusStops] = useState<Stop[]>([]);
//   const [selectedStop, setSelectedStop] = useState<SelectedStop | null>(null);
//   const [busArrivalTime, setBusArrivalTime] = useState<string | null>(null);
//   const [walkingTime, setWalkingTime] = useState<string | null>(null);
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

//   // Configuração do Google Maps Loader
//   const loader = new Loader({
//     apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
//     version: 'weekly',
//     libraries: ['places', 'geometry'],
//   });

//   // Função para converter "10 mins" em número (ex.: 10)
//   const parseTime = (time: string): number => {
//     const match = time.match(/(\d+)/);
//     return match ? parseInt(match[0], 10) : 0;
//   };

//   // Carregar a API do Google Maps e inicializar o mapa
//   useEffect(() => {
//     loader
//       .load()
//       .then(() => {
//         setIsGoogleLoaded(true);
//         const mapElement = document.getElementById('map');
//         if (mapElement && userLocation) {
//           const googleMap = new google.maps.Map(mapElement, {
//             center: userLocation,
//             zoom: 15,
//           });
//           setMap(googleMap);
//         }
//       })
//       .catch((error) => console.error('Erro ao carregar Google Maps:', error));
//   }, [userLocation]);

//   // Obter localização do usuário
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position: GeolocationPosition) => {
//           const { latitude, longitude } = position.coords;
//           setUserLocation({ lat: latitude, lng: longitude });
//         },
//         (error: GeolocationPositionError) =>
//           console.error('Erro ao obter localização:', error),
//         { enableHighAccuracy: true }
//       );
//     }
//   }, []);

//   // Carregar pontos de ônibus próximos
//   useEffect(() => {
//     if (userLocation) {
//       fetchNearbyBusStops(userLocation);
//     }
//   }, [userLocation]);

//   // Adicionar marcadores ao mapa com InfoWindow
//   useEffect(() => {
//     if (map && busStops.length > 0 && isGoogleLoaded) {
//       const infoWindow = new google.maps.InfoWindow();
//       busStops.forEach((stop) => {
//         const marker = new google.maps.Marker({
//           position: { lat: stop.stop_lat, lng: stop.stop_lon },
//           map,
//           title: stop.stop_name,
//           icon: {
//             url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Pino azul
//             scaledSize: new google.maps.Size(32, 32), // Tamanho do ícone
//           },
//         });

//         marker.addListener('click', () => {
//           fetchLinesForStop(stop.stop_id).then((lines) => {
//             const content = `
//               <div>
//                 <h3>${stop.stop_name}</h3>
//                 <p>Linhas: ${lines.length > 0 ? lines.join(', ') : 'Nenhuma linha encontrada'}</p>
//               </div>
//             `;
//             infoWindow.setContent(content);
//             infoWindow.open(map, marker);
//           });
//         });
//       });
//     }
//   }, [map, busStops, isGoogleLoaded]);

//   // Função para buscar pontos de ônibus próximos via API local
//   const fetchNearbyBusStops = async (location: Location) => {
//     try {
//       const response = await fetch(
//         `/api/nearby-stops?lat=${location.lat}&lng=${location.lng}&radius=1000`
//       );
//       if (!response.ok) throw new Error('Erro na resposta da API');
//       const stops: Stop[] = await response.json();
//       setBusStops(stops);
//     } catch (error) {
//       console.error('Erro ao buscar pontos próximos:', error);
//     }
//   };

//   // Função para buscar linhas que atendem um ponto (exemplo com API local)
//   const fetchLinesForStop = async (stopId: string): Promise<string[]> => {
//     try {
//       const response = await fetch(`/api/lines-for-stop?stopId=${stopId}`);
//       if (!response.ok) throw new Error('Erro ao buscar linhas');
//       const data = await response.json();
//       return data.lines || []; // Ajustar conforme a resposta da API
//     } catch (error) {
//       console.error('Erro ao buscar linhas para o ponto:', error);
//       return [];
//     }
//   };

//   // Selecionar um ponto e calcular tempos
//   const handleStopSelection = async (stop: Stop) => {
//     if (!isGoogleLoaded || !google) return;

//     const stopWithGeometry: SelectedStop = {
//       ...stop,
//       geometry: {
//         location: new google.maps.LatLng(stop.stop_lat, stop.stop_lon),
//       },
//     };
//     setSelectedStop(stopWithGeometry);
//     await fetchBusArrivalTime(stopWithGeometry);
//     if (userLocation && stopWithGeometry.geometry) {
//       await fetchWalkingTime(userLocation, stopWithGeometry.geometry.location);
//     }
//   };

//   // Buscar previsão de chegada do ônibus (SPTrans)
//   const fetchBusArrivalTime = async (stop: SelectedStop) => {
//     try {
//       // Exemplo: buscar linhas do ponto e simular tempo
//       const response = await fetch(
//         'http://api.olhovivo.sptrans.com.br/v2.1/Linha/Buscar', // Endpoint correto para linhas
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${process.env.SPTRANS_API_TOKEN}`,
//           },
//           body: JSON.stringify({ termosBusca: stop.stop_id }),
//         }
//       );
//       if (!response.ok) throw new Error('Erro na API SPTrans');
//       const data = await response.json();
//       // Simulação por enquanto
//       setBusArrivalTime('10');
//     } catch (error) {
//       console.error('Erro ao buscar previsão de chegada:', error);
//       setBusArrivalTime('Indisponível');
//     }
//   };

//   // Calcular tempo de caminhada (Google Maps Directions)
//   // const fetchWalkingTime = async (origin: Location, destination: google.maps.LatLng) => {
//   //   if (!isGoogleLoaded || !google) return;

//   //   try {
//   //     const directionsService = new google.maps.DirectionsService();
//   //     const request: google.maps.DirectionsRequest = {
//   //       origin: new google.maps.LatLng(origin.lat, origin.lng),
//   //       destination,
//   //       travelMode: google.maps.TravelMode.WALKING,
//   //     };

//   //     directionsService.route(
//   //       (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
//   //         if (
//   //           status === google.maps.DirectionsStatus.OK &&
//   //           result &&
//   //           result.routes &&
//   //           result.routes[0].legs &&
//   //           result.routes[0].legs[0].duration
//   //         ) {
//   //           const duration = result.routes[0].legs[0].duration.text;
//   //           setWalkingTime(duration);
//   //         } else {
//   //           console.error('Erro ao calcular tempo de caminhada:', status);
//   //           setWalkingTime('Indisponível');
//   //         }
//   //       }
//   //     );
//   //   } catch (error) {
//   //     console.error('Erro ao executar Directions API:', error);
//   //     setWalkingTime('Indisponível');
//   //   }
//   // };
//   // Dentro da função fetchWalkingTime
//   const fetchWalkingTime = async (origin: Location, destination: google.maps.LatLng) => {
//     if (!isGoogleLoaded || !google) return;

//     try {
//       const directionsService = new google.maps.DirectionsService();
//       const request: google.maps.DirectionsRequest = {
//         origin: new google.maps.LatLng(origin.lat, origin.lng),
//         destination,
//         travelMode: google.maps.TravelMode.WALKING,
//       };

//       directionsService.route(
//         request, // Primeiro argumento: o objeto DirectionsRequest
//         (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
//           // Segundo argumento: o callback
//           if (
//             status === google.maps.DirectionsStatus.OK &&
//             result &&
//             result.routes &&
//             result.routes[0].legs &&
//             result.routes[0].legs[0].duration
//           ) {
//             const duration = result.routes[0].legs[0].duration.text;
//             setWalkingTime(duration);
//           } else {
//             console.error('Erro ao calcular tempo de caminhada:', status);
//             setWalkingTime('Indisponível');
//           }
//         }
//       );
//     } catch (error) {
//       console.error('Erro ao executar Directions API:', error);
//       setWalkingTime('Indisponível');
//     }
//   };
//   return (
//     // <div className="p-4">
//     //   <h1 className="text-2xl font-bold">Não fique parado no ponto</h1>
//     //   {!userLocation ? (
//     //     <p>Carregando sua localização...</p>
//     //   ) : (
//     //     <>
//     //       <div id="map" style={{ height: '400px', width: '100%', marginBottom: '20px' }}></div>
//     //       <h2>Pontos de ônibus próximos:</h2>
//     //       <ul>
//     //         {busStops.map((stop) => (
//     //           <li
//     //             key={stop.stop_id}
//     //             className="cursor-pointer hover:underline"
//     //             onClick={() => handleStopSelection(stop)}
//     //           >
//     //             {stop.stop_name} - {Math.round(stop.distance)}m
//     //           </li>
//     //         ))}
//     //       </ul>
//     //       {selectedStop && (
//     //         <div>
//     //           <h3>Ponto selecionado: {selectedStop.stop_name}</h3>
//     //           <p>Tempo até o ônibus chegar: {busArrivalTime || 'Calculando...'}</p>
//     //           <p>Tempo de caminhada: {walkingTime || 'Calculando...'}</p>
//     //           {busArrivalTime && walkingTime && (
//     //             <p>
//     //               Saia em{' '}
//     //               {Math.max(0, parseTime(busArrivalTime) - parseTime(walkingTime))}{' '}
//     //               minutos para chegar no horário!
//     //             </p>
//     //           )}
//     //         </div>
//     //       )}
//     //     </>
//     //   )}
//     // </div>
//     <div className="p-4">
//       <h1 className="text-2xl font-bold">Não fique parado no ponto</h1>
//       {!userLocation ? (
//         <p>Carregando sua localização...</p>
//       ) : (
//         <>
//           <div id="map" style={{ height: '400px', width: '100%', marginBottom: '20px' }}></div>
//           <Card>
//             <CardHeader>
//               <CardTitle>Pontos de ônibus próximos</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-2">
//                 {busStops.map((stop) => (
//                   <li key={stop.stop_id}>
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button variant="outline" onClick={() => handleStopSelection(stop)}>
//                           {stop.stop_name} - {Math.round(stop.distance)}m
//                         </Button>
//                       </DialogTrigger>
//                       {selectedStop?.stop_id === stop.stop_id && (
//                         <DialogContent>
//                           <DialogHeader>
//                             <DialogTitle>{selectedStop.stop_name}</DialogTitle>
//                           </DialogHeader>
//                           <div>
//                             <p>Tempo até o ônibus: {busArrivalTime || 'Calculando...'}</p>
//                             <p>Tempo de caminhada: {walkingTime || 'Calculando...'}</p>
//                             {busArrivalTime && walkingTime && (
//                               <p>
//                                 Saia em{' '}
//                                 {Math.max(0, parseTime(busArrivalTime) - parseTime(walkingTime))}{' '}
//                                 minutos!
//                               </p>
//                             )}
//                           </div>
//                         </DialogContent>
//                       )}
//                     </Dialog>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import { Loader } from '@googlemaps/js-api-loader';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// interface Location {
//   lat: number;
//   lng: number;
// }

// interface Stop {
//   stop_id: string;
//   stop_name: string;
//   stop_lat: number;
//   stop_lon: number;
//   distance: number;
// }

// interface SelectedStop extends Stop {
//   geometry?: { location: google.maps.LatLng };
// }

// export default function Home() {
//   const [userLocation, setUserLocation] = useState<Location | null>(null);
//   const [busStops, setBusStops] = useState<Stop[]>([]);
//   const [selectedStop, setSelectedStop] = useState<SelectedStop | null>(null);
//   const [busArrivalTime, setBusArrivalTime] = useState<string | null>(null);
//   const [walkingTime, setWalkingTime] = useState<string | null>(null);
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
//   const [lines, setLines] = useState<string[]>([]);

//   const loader = new Loader({
//     apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
//     version: 'weekly',
//     libraries: ['places', 'geometry'],
//   });

//   const parseTime = (time: string): number => {
//     const match = time.match(/(\d+)/);
//     return match ? parseInt(match[0], 10) : 0;
//   };

//   useEffect(() => {
//     loader
//       .load()
//       .then(() => {
//         setIsGoogleLoaded(true);
//         const mapElement = document.getElementById('map');
//         if (mapElement && userLocation) {
//           const googleMap = new google.maps.Map(mapElement, {
//             center: userLocation,
//             zoom: 15,
//           });
//           setMap(googleMap);
//         }
//       })
//       .catch((error) => console.error('Erro ao carregar Google Maps:', error));
//   }, [userLocation]);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position: GeolocationPosition) => {
//           const { latitude, longitude } = position.coords;
//           setUserLocation({ lat: latitude, lng: longitude });
//         },
//         (error: GeolocationPositionError) => console.error('Erro ao obter localização:', error),
//         { enableHighAccuracy: true }
//       );
//     }
//   }, []);

//   useEffect(() => {
//     if (userLocation) {
//       fetchNearbyBusStops(userLocation);
//     }
//   }, [userLocation]);

//   useEffect(() => {
//     if (map && busStops.length > 0 && isGoogleLoaded) {
//       const infoWindow = new google.maps.InfoWindow();
//       busStops.forEach((stop) => {
//         const marker = new google.maps.Marker({
//           position: { lat: stop.stop_lat, lng: stop.stop_lon },
//           map,
//           title: stop.stop_name,
//           icon: {
//             //url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
//             url: '/images/icon-maps.png',
//             scaledSize: new google.maps.Size(32, 32),
//           },
//         });

//         marker.addListener('click', () => {
//           fetchLinesForStop(stop.stop_id).then((lines) => {
//             const content = `
//               <div>
//                 <h3>${stop.stop_name}</h3>
//                 <p>Linhas: ${lines.length > 0 ? lines.join(', ') : 'Nenhuma linha encontrada'}</p>
//               </div>
//             `;
//             infoWindow.setContent(content);
//             infoWindow.open(map, marker);
//           });
//         });
//       });
//     }
//   }, [map, busStops, isGoogleLoaded]);

//   const fetchNearbyBusStops = async (location: Location) => {
//     try {
//       const response = await fetch(
//         `/api/nearby-stops?lat=${location.lat}&lng=${location.lng}&radius=1000`
//       );
//       if (!response.ok) throw new Error('Erro na resposta da API');
//       const stops: Stop[] = await response.json();
//       setBusStops(stops);
//     } catch (error) {
//       console.error('Erro ao buscar pontos próximos:', error);
//     }
//   };

//   const fetchLinesForStop = async (stopId: string): Promise<string[]> => {
//     try {
//       const response = await fetch(`/api/lines-for-stop?stopId=${stopId}`);
//       if (!response.ok) throw new Error('Erro ao buscar linhas');
//       const data = await response.json();
//       return data.lines || [];
//     } catch (error) {
//       console.error('Erro ao buscar linhas para o ponto:', error);
//       return [];
//     }
//   };

//   // const authenticateSPTrans = async () => {
//   //   try {
//   //     const response = await fetch('http://api.olhovivo.sptrans.com.br/v2.1/Login/Autenticar', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({ token: process.env.SPTRANS_API_TOKEN }),
//   //     });
//   //     if (!response.ok) throw new Error('Falha na autenticação SPTrans');
//   //     return true;
//   //   } catch (error) {
//   //     console.error('Erro ao autenticar SPTrans:', error);
//   //     return false;
//   //   }
//   // };

//   const authenticateSPTrans = async () => {
//     try {
//       const response = await fetch('/api/sptrans-auth', {
//         method: 'POST',
//       });
//       if (!response.ok) throw new Error('Falha na autenticação SPTrans');
//       const { success } = await response.json();
//       return success;
//     } catch (error) {
//       console.error('Erro ao autenticar SPTrans:', error);
//       return false;
//     }
//   };

//   // const fetchBusArrivalTime = async (stop: SelectedStop) => {
//   //   try {
//   //     const isAuthenticated = await authenticateSPTrans();
//   //     if (!isAuthenticated) throw new Error('Autenticação falhou');

//   //     const response = await fetch(`/api/sptrans-arrival?stopId=${stop.stop_id}`, {
//   //       method: 'GET',
//   //     });
//   //     if (!response.ok) throw new Error('Erro na API SPTrans');
//   //     const { arrivalTime } = await response.json();
//   //     setBusArrivalTime(arrivalTime);
//   //   } catch (error) {
//   //     console.error('Erro ao buscar previsão de chegada:', error);
//   //     setBusArrivalTime('Indisponível');
//   //   }
//   // };
//   const fetchBusArrivalTime = async (stop: SelectedStop) => {
//     try {
//       // Verificar se já está autenticado
//       const authCheck = await fetch('/api/sptrans-auth', { method: 'GET' });
//       let isAuthenticated = (await authCheck.json()).isAuthenticated;

//       if (!isAuthenticated) {
//         isAuthenticated = await authenticateSPTrans();
//       }
//       if (!isAuthenticated) throw new Error('Autenticação falhou');

//       const response = await fetch(`/api/sptrans-arrival?stopId=${stop.stop_id}`, {
//         method: 'GET',
//       });
//       if (!response.ok) throw new Error('Erro na API SPTrans');
//       const { arrivalTime } = await response.json();
//       setBusArrivalTime(arrivalTime);
//     } catch (error) {
//       console.error('Erro ao buscar previsão de chegada:', error);
//       setBusArrivalTime('Indisponível');
//     }
//   };
//   const handleStopSelection = async (stop: Stop) => {
//     if (!isGoogleLoaded || !google) return;

//     const stopWithGeometry: SelectedStop = {
//       ...stop,
//       geometry: {
//         location: new google.maps.LatLng(stop.stop_lat, stop.stop_lon),
//       },
//     };
//     setSelectedStop(stopWithGeometry);
//     const linesForStop = await fetchLinesForStop(stop.stop_id);
//     setLines(linesForStop);
//     await fetchBusArrivalTime(stopWithGeometry);
//     if (userLocation && stopWithGeometry.geometry) {
//       await fetchWalkingTime(userLocation, stopWithGeometry.geometry.location);
//     }
//   };

//   // const fetchBusArrivalTime = async (stop: SelectedStop) => {
//   //   try {
//   //     const isAuthenticated = await authenticateSPTrans();
//   //     if (!isAuthenticated) throw new Error('Autenticação falhou');

//   //     const response = await fetch(
//   //       `http://api.olhovivo.sptrans.com.br/v2.1/Previsao/Parada?codigoParada=${stop.stop_id}`,
//   //       {
//   //         method: 'GET',
//   //         headers: {
//   //           'Content-Type': 'application/json',
//   //         },
//   //       }
//   //     );
//   //     if (!response.ok) throw new Error('Erro na API SPTrans');
//   //     const data = await response.json();
//   //     const arrivalTime = data?.p?.l[0]?.vs[0]?.t || '10'; // Ajustar conforme estrutura
//   //     setBusArrivalTime(arrivalTime);
//   //   } catch (error) {
//   //     console.error('Erro ao buscar previsão de chegada:', error);
//   //     setBusArrivalTime('Indisponível');
//   //   }
//   // };

//   const fetchWalkingTime = async (origin: Location, destination: google.maps.LatLng) => {
//     if (!isGoogleLoaded || !google) return;

//     try {
//       const directionsService = new google.maps.DirectionsService();
//       const request: google.maps.DirectionsRequest = {
//         origin: new google.maps.LatLng(origin.lat, origin.lng),
//         destination,
//         travelMode: google.maps.TravelMode.WALKING,
//       };

//       directionsService.route(
//         request,
//         (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
//           if (
//             status === google.maps.DirectionsStatus.OK &&
//             result &&
//             result.routes &&
//             result.routes[0].legs &&
//             result.routes[0].legs[0].duration
//           ) {
//             const duration = result.routes[0].legs[0].duration.text;
//             setWalkingTime(duration);
//           } else {
//             console.error('Erro ao calcular tempo de caminhada:', status);
//             setWalkingTime('Indisponível');
//           }
//         }
//       );
//     } catch (error) {
//       console.error('Erro ao executar Directions API:', error);
//       setWalkingTime('Indisponível');
//     }
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold">Não fique parado no ponto</h1>
//       {!userLocation ? (
//         <p>Carregando sua localização...</p>
//       ) : (
//         <>
//           <div id="map" style={{ height: '400px', width: '100%', marginBottom: '20px' }}></div>
//           <Card>
//             <CardHeader>
//               <CardTitle>Pontos de ônibus próximos</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-2">
//                 {busStops.map((stop) => (
//                   <li key={stop.stop_id}>
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button variant="outline" onClick={() => handleStopSelection(stop)}>
//                           {stop.stop_name} - {Math.round(stop.distance)}m
//                         </Button>
//                       </DialogTrigger>
//                       {selectedStop?.stop_id === stop.stop_id && (
//                         <DialogContent>
//                           <DialogHeader>
//                             <DialogTitle>{selectedStop.stop_name}</DialogTitle>
//                           </DialogHeader>
//                           <div>
//                             <p>Linhas: {lines.length > 0 ? lines.join(', ') : 'Nenhuma linha encontrada'}</p>
//                             <p>Tempo até o ônibus: {busArrivalTime || 'Calculando...'}</p>
//                             <p>Tempo de caminhada: {walkingTime || 'Calculando...'}</p>
//                             {busArrivalTime && walkingTime && (
//                               <p>
//                                 Saia em{' '}
//                                 {Math.max(0, parseTime(busArrivalTime) - parseTime(walkingTime))}{' '}
//                                 minutos!
//                               </p>
//                             )}
//                           </div>
//                         </DialogContent>
//                       )}
//                     </Dialog>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Location {
  lat: number;
  lng: number;
}

interface Stop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  distance: number;
  lines: { name: string; routeId: string }[]; // Ajustado para objetos
}

interface SelectedStop extends Stop {
  geometry?: { location: google.maps.LatLng };
}

interface BusPosition {
  py: number;
  px: number;
}

export default function Home() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [busStops, setBusStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<SelectedStop | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [busArrivalTime, setBusArrivalTime] = useState<string | null>(null);
  const [walkingTime, setWalkingTime] = useState<string | null>(null);
  const [busPositions, setBusPositions] = useState<BusPosition[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    version: 'weekly',
    libraries: ['places', 'geometry'],
  });

  const parseTime = (time: string): number => {
    const match = time.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  };

  useEffect(() => {
    loader
      .load()
      .then(() => {
        setIsGoogleLoaded(true);
        if (userLocation) {
          const mapElement = document.getElementById('map');
          if (mapElement) {
            const googleMap = new google.maps.Map(mapElement, {
              center: userLocation,
              zoom: 15,
            });
            setMap(googleMap);
          }
        }
      })
      .catch((error) => console.error('Erro ao carregar Google Maps:', error));
  }, [userLocation]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error: GeolocationPositionError) => console.error('Erro ao obter localização:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyBusStops(userLocation);
    }
  }, [userLocation]);

  const fetchNearbyBusStops = async (location: Location) => {
    try {
      const response = await fetch(
        `/api/nearby-stops?lat=${location.lat}&lng=${location.lng}&radius=1000`
      );
      if (!response.ok) throw new Error('Erro na resposta da API');
      const stops: Stop[] = await response.json();

      const stopsWithLines = await Promise.all(
        stops.map(async (stop) => {
          const lines = await fetchLinesForStop(stop.stop_id);
          return { ...stop, lines };
        })
      );
      setBusStops(stopsWithLines);
    } catch (error) {
      console.error('Erro ao buscar pontos próximos:', error);
    }
  };

  const fetchLinesForStop = async (stopId: string): Promise<{ name: string; routeId: string }[]> => {
    try {
      const response = await fetch(`/api/lines-for-stop?stopId=${stopId}`);
      if (!response.ok) throw new Error('Erro ao buscar linhas');
      const data = await response.json();
      return data.lines || [];
    } catch (error) {
      console.error('Erro ao buscar linhas para o ponto:', error);
      return [];
    }
  };

  const authenticateSPTrans = async () => {
    try {
      const response = await fetch('/api/sptrans-auth', { method: 'POST' });
      if (!response.ok) throw new Error('Falha na autenticação SPTrans');
      const { success } = await response.json();
      return success;
    } catch (error) {
      console.error('Erro ao autenticar SPTrans:', error);
      return false;
    }
  };

  const fetchBusArrivalTime = async (stopId: string, lineName: string) => {
    try {
      const authCheck = await fetch('/api/sptrans-auth', { method: 'GET' });
      let isAuthenticated = (await authCheck.json()).isAuthenticated;

      if (!isAuthenticated) {
        isAuthenticated = await authenticateSPTrans();
      }
      if (!isAuthenticated) throw new Error('Autenticação falhou');

      const response = await fetch(`/api/sptrans-arrival?stopId=${stopId}&routeId=${encodeURIComponent(lineName)}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Erro na API SPTrans');
      const { arrivalTime, busPositions } = await response.json();
      setBusArrivalTime(arrivalTime);
      setBusPositions(busPositions);
      if (arrivalTime === "Indisponível" && busPositions.length > 0 && selectedStop) {
        await calculateNearestBusTime(selectedStop, busPositions);
      }
    } catch (error) {
      console.error('Erro ao buscar previsão de chegada:', error);
      setBusArrivalTime('Indisponível');
    }
  };

  const fetchRoutePath = async (lineName: string) => {
    try {
      const response = await fetch(`/api/route-path?routeShortName=${encodeURIComponent(lineName)}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro na resposta de /api/route-path:', errorData);
        return [];
      }
      const { path } = await response.json();
      return path.map((point: any) => ({ lat: point.shape_pt_lat, lng: point.shape_pt_lon }));
    } catch (error) {
      console.error('Erro ao buscar traçado da linha:', error);
      return [];
    }
  };

  const fetchWalkingTime = async (origin: Location, destination: google.maps.LatLng) => {
    if (!isGoogleLoaded || !google) return;

    try {
      const directionsService = new google.maps.DirectionsService();
      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination,
        travelMode: google.maps.TravelMode.WALKING,
      };

      directionsService.route(
        request,
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === google.maps.DirectionsStatus.OK && result?.routes?.[0]?.legs?.[0]?.duration) {
            setWalkingTime(result.routes[0].legs[0].duration.text);
          } else {
            console.error('Erro ao calcular tempo de caminhada:', status);
            setWalkingTime('Indisponível');
          }
        }
      );
    } catch (error) {
      console.error('Erro ao executar Directions API:', error);
      setWalkingTime('Indisponível');
    }
  };

  const calculateNearestBusTime = async (stop: SelectedStop, positions: BusPosition[]) => {
    if (!isGoogleLoaded || !google || !stop.geometry) return;

    const directionsService = new google.maps.DirectionsService();
    const stopLocation = stop.geometry.location;

    let minDuration = Infinity;
    let nearestTime = "Indisponível";

    for (const pos of positions) {
      const busLocation = new google.maps.LatLng(pos.py, pos.px);
      const request: google.maps.DirectionsRequest = {
        origin: busLocation,
        destination: stopLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      try {
        const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          directionsService.route(request, (res, status) => {
            if (status === google.maps.DirectionsStatus.OK && res) resolve(res);
            else reject(status);
          });
        });

        const route = result.routes[0];
        if (route && route.legs && route.legs[0] && route.legs[0].duration) {
          const duration = route.legs[0].duration.value; // Agora seguro com verificação
          if (duration < minDuration) {
            minDuration = duration;
            nearestTime = `${Math.ceil(duration / 60)} min`;
          }
        }
      } catch (error) {
        console.error('Erro ao calcular tempo do ônibus:', error);
      }
    }

    setBusArrivalTime(nearestTime);
  };

  const handleLineSelection = async (stop: Stop, line: { name: string; routeId: string }) => {
    if (!isGoogleLoaded || !google || !map) return;

    const stopWithGeometry: SelectedStop = {
      ...stop,
      geometry: { location: new google.maps.LatLng(stop.stop_lat, stop.stop_lon) },
    };
    setSelectedStop(stopWithGeometry);
    setSelectedLine(line.name);

    await fetchBusArrivalTime(stop.stop_id, line.name);

    const path = await fetchRoutePath(line.name);
    if (path.length > 0) {
      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      polyline.setMap(map);
    } else {
      console.log(`Nenhum traçado disponível para ${line.name}`);
    }

    busPositions.forEach((pos) => {
      new google.maps.Marker({
        position: { lat: pos.py, lng: pos.px },
        map,
        icon: {
          url: 'http://maps.google.com/mapfiles/kml/shapes/bus.png',
          scaledSize: new google.maps.Size(32, 32),
        },
      });
    });

    if (userLocation && stopWithGeometry.geometry) {
      await fetchWalkingTime(userLocation, stopWithGeometry.geometry.location);
    }
  };

  useEffect(() => {
    if (map && busStops.length > 0 && isGoogleLoaded) {
      const infoWindow = new google.maps.InfoWindow();
      busStops.forEach((stop) => {
        const marker = new google.maps.Marker({
          position: { lat: stop.stop_lat, lng: stop.stop_lon },
          map,
          title: stop.stop_name,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(32, 32),
          },
        });

        marker.addListener('click', () => {
          const content = `
            <div>
              <h3>${stop.stop_name}</h3>
              <p>Linhas: ${stop.lines.length > 0 ? stop.lines.join(', ') : 'Nenhuma linha encontrada'}</p>
            </div>
          `;
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        });
      });
    }
  }, [map, busStops, isGoogleLoaded]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Não fique parado no ponto</h1>
      {!userLocation ? (
        <p>Carregando sua localização...</p>
      ) : (
        <>
          <div id="map" style={{ height: '400px', width: '100%', marginBottom: '20px' }}></div>
          <Card>
            <CardHeader>
              <CardTitle>Pontos de ônibus próximos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {busStops.map((stop) => (
                  <li key={stop.stop_id}>
                    <div>
                      <strong>{stop.stop_name} - {Math.round(stop.distance)}m</strong>
                      <ul className="ml-4 space-y-1">
                        {stop.lines.map((line) => (
                          <li key={line.routeId}> {/* Usa routeId como chave única */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto"
                                  onClick={() => handleLineSelection(stop, line)}
                                >
                                  {line.name} {/* Renderiza apenas o nome */}
                                </Button>
                              </DialogTrigger>
                              {selectedStop?.stop_id === stop.stop_id && selectedLine === line.name && (
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      {selectedStop.stop_name} - Linha {line.name}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div>
                                    <p>Tempo até o ônibus: {busArrivalTime || 'Calculando...'}</p>
                                    <p>Tempo de caminhada: {walkingTime || 'Calculando...'}</p>
                                    {busArrivalTime && walkingTime && busArrivalTime !== 'Indisponível' && (
                                      <p>
                                        Saia em{' '}
                                        {Math.max(0, parseTime(busArrivalTime) - parseTime(walkingTime))}{' '}
                                        minutos!
                                      </p>
                                    )}
                                  </div>
                                </DialogContent>
                              )}
                            </Dialog>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}