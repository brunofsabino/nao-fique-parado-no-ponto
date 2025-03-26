// // import { useState, useEffect } from 'react';
// // import { Loader } from '@googlemaps/js-api-loader';

// // export default function Home() {
// //   const [userLocation, setUserLocation] = useState(null);
// //   const [busStops, setBusStops] = useState([]);
// //   const [selectedStop, setSelectedStop] = useState(null);
// //   const [busArrivalTime, setBusArrivalTime] = useState(null);
// //   const [walkingTime, setWalkingTime] = useState(null);

// //   // Configuração do Google Maps Loader
// //   const loader = new Loader({
// //     apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
// //     version: 'weekly',
// //     libraries: ['places', 'geometry'],
// //   });

// //   // Obter localização do usuário
// //   useEffect(() => {
// //     if (navigator.geolocation) {
// //       navigator.geolocation.getCurrentPosition(
// //         (position) => {
// //           const { latitude, longitude } = position.coords;
// //           setUserLocation({ lat: latitude, lng: longitude });
// //         },
// //         (error) => console.error('Erro ao obter localização:', error),
// //         { enableHighAccuracy: true }
// //       );
// //     }
// //   }, []);

// //   // Carregar pontos de ônibus próximos quando a localização estiver disponível
// //   useEffect(() => {
// //     if (userLocation) {
// //       fetchNearbyBusStops(userLocation);
// //     }
// //   }, [userLocation]);

// //   // Função para buscar pontos de ônibus próximos
// //   // const fetchNearbyBusStops = async (location) => {
// //   //   const map = await loader.load();
// //   //   const service = new google.maps.places.PlacesService(
// //   //     document.createElement('div')
// //   //   );

// //   //   const request = {
// //   //     location: new google.maps.LatLng(location.lat, location.lng),
// //   //     radius: 1000, // 1km de raio
// //   //     type: 'bus_station',
// //   //   };

// //   //   service.nearbySearch(request, (results, status) => {
// //   //     if (status === google.maps.places.PlacesServiceStatus.OK) {
// //   //       setBusStops(results);
// //   //     }
// //   //   });
// //   // };
// //   const fetchNearbyBusStops = async (location) => {
// //     const response = await fetch(
// //       `/api/nearby-stops?lat=${location.lat}&lng=${location.lng}&radius=1000`
// //     );
// //     const stops = await response.json();
// //     setBusStops(stops);
// //   };

// //   // Selecionar um ponto e calcular tempos
// //   const handleStopSelection = async (stop) => {
// //     setSelectedStop(stop);
// //     await fetchBusArrivalTime(stop); // SPTrans API
// //     await fetchWalkingTime(userLocation, stop.geometry.location); // Google Maps Directions
// //   };

// //   // Buscar previsão de chegada do ônibus (SPTrans)
// //   const fetchBusArrivalTime = async (stop) => {
// //     const response = await fetch(
// //       'http://api.olhovivo.sptrans.com.br/v2.1/Posicao', // Exemplo, ajustar para o endpoint correto
// //       {
// //         headers: { Authorization: `Bearer ${process.env.SPTRANS_API_TOKEN}` },
// //       }
// //     );
// //     const data = await response.json();
// //     // Lógica para calcular o tempo de chegada com base na posição do ônibus
// //     setBusArrivalTime(/* tempo estimado em minutos */);
// //   };

// //   // Calcular tempo de caminhada (Google Maps Directions)
// //   const fetchWalkingTime = async (origin, destination) => {
// //     const directionsService = new google.maps.DirectionsService();
// //     const request = {
// //       origin: new google.maps.LatLng(origin.lat, origin.lng),
// //       destination: new google.maps.LatLng(destination.lat(), destination.lng()),
// //       travelMode: 'WALKING',
// //     };

// //     directionsService.route(request, (result, status) => {
// //       if (status === 'OK') {
// //         const duration = result.routes[0].legs[0].duration.text; // ex.: "10 mins"
// //         setWalkingTime(duration);
// //       }
// //     });
// //   };

// //   return (
// //     <div className="p-4">
// //       <h1 className="text-2xl font-bold">Não fique parado no ponto</h1>
// //       {!userLocation ? (
// //         <p>Carregando sua localização...</p>
// //       ) : (
// //         <>
// //           <h2>Pontos de ônibus próximos:</h2>
// //           <ul>
// //             {busStops.map((stop) => (
// //               <li key={stop.place_id} onClick={() => handleStopSelection(stop)}>
// //                 {stop.name} - {stop.vicinity}
// //               </li>
// //             ))}
// //           </ul>
// //           {selectedStop && (
// //             <div>
// //               <h3>Ponto selecionado: {selectedStop.name}</h3>
// //               <p>Tempo até o ônibus chegar: {busArrivalTime || 'Calculando...'}</p>
// //               <p>Tempo de caminhada: {walkingTime || 'Calculando...'}</p>
// //               {busArrivalTime && walkingTime && (
// //                 <p>
// //                   Saia em{' '}
// //                   {Math.max(
// //                     0,
// //                     parseInt(busArrivalTime) - parseInt(walkingTime)
// //                   )}{' '}
// //                   minutos para chegar no horário!
// //                 </p>
// //               )}
// //             </div>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // }


// // 'use client';

// // import { useState, useEffect } from 'react';
// // import { Loader } from '@googlemaps/js-api-loader';

// // // Tipagem para a localização do usuário
// // interface Location {
// //   lat: number;
// //   lng: number;
// // }

// // // Tipagem para os pontos de ônibus do banco (GTFS)
// // interface BusStop {
// //   stop_id: string;
// //   stop_name: string;
// //   stop_lat: number;
// //   stop_lon: number;
// //   distance: number;
// // }

// // // Tipagem para o ponto selecionado (ajustada para o GTFS)
// // interface SelectedStop extends BusStop {
// //   geometry?: { location: google.maps.LatLng };
// // }

// // export default function Home() {
// //   const [userLocation, setUserLocation] = useState<Location | null>(null);
// //   const [busStops, setBusStops] = useState<BusStop[]>([]);
// //   const [selectedStop, setSelectedStop] = useState<SelectedStop | null>(null);
// //   const [busArrivalTime, setBusArrivalTime] = useState<string | null>(null);
// //   const [walkingTime, setWalkingTime] = useState<string | null>(null);

// //   // Configuração do Google Maps Loader
// //   const loader = new Loader({
// //     apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
// //     version: 'weekly',
// //     libraries: ['places', 'geometry'],
// //   });

// //   // Obter localização do usuário
// //   useEffect(() => {
// //     if (navigator.geolocation) {
// //       navigator.geolocation.getCurrentPosition(
// //         (position: GeolocationPosition) => {
// //           const { latitude, longitude } = position.coords;
// //           setUserLocation({ lat: latitude, lng: longitude });
// //         },
// //         (error: GeolocationPositionError) =>
// //           console.error('Erro ao obter localização:', error),
// //         { enableHighAccuracy: true }
// //       );
// //     }
// //   }, []);

// //   // Carregar pontos de ônibus próximos quando a localização estiver disponível
// //   useEffect(() => {
// //     if (userLocation) {
// //       fetchNearbyBusStops(userLocation);
// //     }
// //   }, [userLocation]);

// //   // Função para buscar pontos de ônibus próximos via API local
// //   const fetchNearbyBusStops = async (location: Location) => {
// //     try {
// //       const response = await fetch(
// //         `/api/nearby-stops?lat=${location.lat}&lng=${location.lng}&radius=1000`
// //       );
// //       if (!response.ok) throw new Error('Erro na resposta da API');
// //       const stops: BusStop[] = await response.json();
// //       setBusStops(stops);
// //     } catch (error) {
// //       console.error('Erro ao buscar pontos próximos:', error);
// //     }
// //   };

// //   // Selecionar um ponto e calcular tempos
// //   const handleStopSelection = async (stop: BusStop) => {
// //     const stopWithGeometry: SelectedStop = {
// //       ...stop,
// //       geometry: {
// //         location: new google.maps.LatLng(stop.stop_lat, stop.stop_lon),
// //       },
// //     };
// //     setSelectedStop(stopWithGeometry);
// //     await fetchBusArrivalTime(stopWithGeometry);
// //     if (userLocation) {
// //       await fetchWalkingTime(userLocation, stopWithGeometry.geometry.location);
// //     }
// //   };

// //   // Buscar previsão de chegada do ônibus (SPTrans)
// //   const fetchBusArrivalTime = async (stop: SelectedStop) => {
// //     try {
// //       const response = await fetch(
// //         'http://api.olhovivo.sptrans.com.br/v2.1/Posicao', // Ajustar endpoint conforme necessário
// //         {
// //           headers: { Authorization: `Bearer ${process.env.SPTRANS_API_TOKEN}` },
// //         }
// //       );
// //       if (!response.ok) throw new Error('Erro na API SPTrans');
// //       const data = await response.json();
// //       // Aqui você deve implementar a lógica real para calcular o tempo de chegada
// //       setBusArrivalTime('10'); // Exemplo fixo, substituir por cálculo real
// //     } catch (error) {
// //       console.error('Erro ao buscar previsão de chegada:', error);
// //     }
// //   };

// //   // Calcular tempo de caminhada (Google Maps Directions)
// //   const fetchWalkingTime = async (
// //     origin: Location,
// //     destination: google.maps.LatLng
// //   ) => {
// //     try {
// //       const map = await loader.load();
// //       const directionsService = new map.DirectionsService();
// //       const request: google.maps.DirectionsRequest = {
// //         origin: new map.LatLng(origin.lat, origin.lng),
// //         destination,
// //         travelMode: google.maps.TravelMode.WALKING,
// //       };

// //       directionsService.route(request, (result, status) => {
// //         if (status === google.maps.DirectionsStatus.OK && result) {
// //           const duration = result.routes[0].legs[0].duration.text; // ex.: "10 mins"
// //           setWalkingTime(duration);
// //         } else {
// //           console.error('Erro ao calcular tempo de caminhada:', status);
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Erro ao carregar Directions API:', error);
// //     }
// //   };

// //   return (
// //     <div className="p-4">
// //       <h1 className="text-2xl font-bold">Não fique parado no ponto</h1>
// //       {!userLocation ? (
// //         <p>Carregando sua localização...</p>
// //       ) : (
// //         <>
// //           <h2>Pontos de ônibus próximos:</h2>
// //           <ul>
// //             {busStops.map((stop) => (
// //               <li
// //                 key={stop.stop_id}
// //                 className="cursor-pointer hover:underline"
// //                 onClick={() => handleStopSelection(stop)}
// //               >
// //                 {stop.stop_name} - {Math.round(stop.distance)}m
// //               </li>
// //             ))}
// //           </ul>
// //           {selectedStop && (
// //             <div>
// //               <h3>Ponto selecionado: {selectedStop.stop_name}</h3>
// //               <p>
// //                 Tempo até o ônibus chegar: {busArrivalTime || 'Calculando...'}
// //               </p>
// //               <p>Tempo de caminhada: {walkingTime || 'Calculando...'}</p>
// //               {busArrivalTime && walkingTime && (
// //                 <p>
// //                   Saia em{' '}
// //                   {Math.max(
// //                     0,
// //                     parseInt(busArrivalTime) - parseInt(walkingTime)
// //                   )}{' '}
// //                   minutos para chegar no horário!
// //                 </p>
// //               )}
// //             </div>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// 'use client';

// import { useState, useEffect } from 'react';
// import { Loader } from '@googlemaps/js-api-loader';

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

// // Tipagem para o ponto selecionado (ajustada para o GTFS)
// interface SelectedStop extends Stop {
//   geometry?: { location: google.maps.LatLng };
// }

// export default function Home() {
//   const [userLocation, setUserLocation] = useState<Location | null>(null);
//   const [busStops, setBusStops] = useState<Stop[]>([]);
//   const [selectedStop, setSelectedStop] = useState<SelectedStop | null>(null);
//   const [busArrivalTime, setBusArrivalTime] = useState<string | null>(null);
//   const [walkingTime, setWalkingTime] = useState<string | null>(null);

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

//   // Carregar pontos de ônibus próximos quando a localização estiver disponível
//   useEffect(() => {
//     if (userLocation) {
//       fetchNearbyBusStops(userLocation);
//     }
//   }, [userLocation]);

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

//   // Selecionar um ponto e calcular tempos
//   const handleStopSelection = async (stop: Stop) => {
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
//       const response = await fetch(
//         'http://api.olhovivo.sptrans.com.br/v2.1/Posicao', // Ajustar endpoint conforme necessário
//         {
//           headers: { Authorization: `Bearer ${process.env.SPTRANS_API_TOKEN}` },
//         }
//       );
//       if (!response.ok) throw new Error('Erro na API SPTrans');
//       const data = await response.json();
//       // Aqui você deve implementar a lógica real para calcular o tempo de chegada
//       setBusArrivalTime('10'); // Exemplo fixo, substituir por cálculo real
//     } catch (error) {
//       console.error('Erro ao buscar previsão de chegada:', error);
//     }
//   };

//   // Calcular tempo de caminhada (Google Maps Directions)

//   // Calcular tempo de caminhada (Google Maps Directions)
//   // const fetchWalkingTime = async (
//   //   origin: Location,
//   //   destination: google.maps.LatLng
//   // ) => {
//   //   try {
//   //     // Não precisamos carregar novamente, pois já foi carregado no useEffect
//   //     const directionsService = new google.maps.DirectionsService();
//   //     const request: google.maps.DirectionsRequest = {
//   //       origin: new google.maps.LatLng(origin.lat, origin.lng),
//   //       destination,
//   //       travelMode: google.maps.TravelMode.WALKING,
//   //     };

//   //     directionsService.route(
//   //       request,
//   //       (
//   //         result: google.maps.DirectionsResult | null,
//   //         status: google.maps.DirectionsStatus
//   //       ) => {
//   //         if (status === google.maps.DirectionsStatus.OK && result?.routes?.[0]?.legs?.[0]) {
//   //           const duration = result.routes[0].legs[0].duration.text; // ex.: "10 mins"
//   //           setWalkingTime(duration);
//   //         } else {
//   //           console.error('Erro ao calcular tempo de caminhada:', status);
//   //         }
//   //       }
//   //     );
//   //   } catch (error) {
//   //     console.error('Erro ao executar Directions API:', error);
//   //   }
//   // };

//   // app/page.tsx (trecho ajustado)
//   const fetchWalkingTime = async (
//     origin: Location,
//     destination: google.maps.LatLng
//   ) => {
//     try {
//       const directionsService = new google.maps.DirectionsService();
//       const request: google.maps.DirectionsRequest = {
//         origin: new google.maps.LatLng(origin.lat, origin.lng),
//         destination,
//         travelMode: google.maps.TravelMode.WALKING,
//       };

//       directionsService.route(
//         request,
//         (
//           result: google.maps.DirectionsResult | null,
//           status: google.maps.DirectionsStatus
//         ) => {
//           if (
//             status === google.maps.DirectionsStatus.OK &&
//             result &&
//             result.routes &&
//             result.routes.length > 0 &&
//             result.routes[0].legs &&
//             result.routes[0].legs.length > 0 &&
//             result.routes[0].legs[0].duration
//           ) {
//             const duration = result.routes[0].legs[0].duration.text; // Agora seguro
//             setWalkingTime(duration);
//           } else {
//             console.error('Erro ao calcular tempo de caminhada:', status);
//           }
//         }
//       );
//     } catch (error) {
//       console.error('Erro ao executar Directions API:', error);
//     }
//   };
//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold">Não fique parado no ponto</h1>
//       {!userLocation ? (
//         <p>Carregando sua localização...</p>
//       ) : (
//         <>
//           <h2>Pontos de ônibus próximos:</h2>
//           <ul>
//             {busStops.map((stop) => (
//               <li
//                 key={stop.stop_id}
//                 className="cursor-pointer hover:underline"
//                 onClick={() => handleStopSelection(stop)}
//               >
//                 {stop.stop_name} - {Math.round(stop.distance)}m
//               </li>
//             ))}
//           </ul>
//           {selectedStop && (
//             <div>
//               <h3>Ponto selecionado: {selectedStop.stop_name}</h3>
//               <p>
//                 Tempo até o ônibus chegar: {busArrivalTime || 'Calculando...'}
//               </p>
//               <p>Tempo de caminhada: {walkingTime || 'Calculando...'}</p>
//               {busArrivalTime && walkingTime && (
//                 <p>
//                   Saia em{' '}
//                   {Math.max(
//                     0,
//                     parseTime(busArrivalTime) - parseTime(walkingTime)
//                   )}{' '}
//                   minutos para chegar no horário!
//                 </p>
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }





// 'use client';

// import { useState, useEffect } from 'react';
// import { Loader } from '@googlemaps/js-api-loader';

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
//         // Inicializar o mapa após o carregamento
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

//   // Carregar pontos de ônibus próximos quando a localização estiver disponível
//   useEffect(() => {
//     if (userLocation) {
//       fetchNearbyBusStops(userLocation);
//     }
//   }, [userLocation]);

//   // Adicionar marcadores ao mapa quando os pontos de ônibus forem carregados
//   useEffect(() => {
//     if (map && busStops.length > 0 && isGoogleLoaded) {
//       busStops.forEach((stop) => {
//         new google.maps.Marker({
//           position: { lat: stop.stop_lat, lng: stop.stop_lon },
//           map,
//           title: stop.stop_name,
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

//   // Selecionar um ponto e calcular tempos
//   const handleStopSelection = async (stop: Stop) => {
//     if (!isGoogleLoaded || !google) return; // Evita executar antes do Google carregar

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
//       const response = await fetch(
//         'http://api.olhovivo.sptrans.com.br/v2.1/Posicao', // Ajustar endpoint
//         {
//           headers: { Authorization: `Bearer ${process.env.SPTRANS_API_TOKEN}` },
//         }
//       );
//       if (!response.ok) throw new Error('Erro na API SPTrans');
//       const data = await response.json();
//       // Substituir por lógica real
//       setBusArrivalTime('10'); // Exemplo fixo
//     } catch (error) {
//       console.error('Erro ao buscar previsão de chegada:', error);
//     }
//   };

//   // Calcular tempo de caminhada (Google Maps Directions)
//   const fetchWalkingTime = async (origin: Location, destination: google.maps.LatLng) => {
//     if (!isGoogleLoaded || !google) return; // Evita executar antes do Google carregar

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
//             result.routes.length > 0 &&
//             result.routes[0].legs &&
//             result.routes[0].legs.length > 0 &&
//             result.routes[0].legs[0].duration
//           ) {
//             const duration = result.routes[0].legs[0].duration.text;
//             setWalkingTime(duration);
//           } else {
//             console.error('Erro ao calcular tempo de caminhada:', status);
//           }
//         }
//       );
//     } catch (error) {
//       console.error('Erro ao executar Directions API:', error);
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
//           <h2>Pontos de ônibus próximos:</h2>
//           <ul>
//             {busStops.map((stop) => (
//               <li
//                 key={stop.stop_id}
//                 className="cursor-pointer hover:underline"
//                 onClick={() => handleStopSelection(stop)}
//               >
//                 {stop.stop_name} - {Math.round(stop.distance)}m
//               </li>
//             ))}
//           </ul>
//           {selectedStop && (
//             <div>
//               <h3>Ponto selecionado: {selectedStop.stop_name}</h3>
//               <p>Tempo até o ônibus chegar: {busArrivalTime || 'Calculando...'}</p>
//               <p>Tempo de caminhada: {walkingTime || 'Calculando...'}</p>
//               {busArrivalTime && walkingTime && (
//                 <p>
//                   Saia em{' '}
//                   {Math.max(0, parseTime(busArrivalTime) - parseTime(walkingTime))}{' '}
//                   minutos para chegar no horário!
//                 </p>
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// Tipagem para a localização do usuário
interface Location {
  lat: number;
  lng: number;
}

// Tipagem para os pontos de ônibus do banco (GTFS)
interface Stop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  distance: number;
}

// Tipagem para o ponto selecionado
interface SelectedStop extends Stop {
  geometry?: { location: google.maps.LatLng };
}

export default function Home() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [busStops, setBusStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<SelectedStop | null>(null);
  const [busArrivalTime, setBusArrivalTime] = useState<string | null>(null);
  const [walkingTime, setWalkingTime] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Configuração do Google Maps Loader
  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    version: 'weekly',
    libraries: ['places', 'geometry'],
  });

  // Função para converter "10 mins" em número (ex.: 10)
  const parseTime = (time: string): number => {
    const match = time.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Carregar a API do Google Maps e inicializar o mapa
  useEffect(() => {
    loader
      .load()
      .then(() => {
        setIsGoogleLoaded(true);
        const mapElement = document.getElementById('map');
        if (mapElement && userLocation) {
          const googleMap = new google.maps.Map(mapElement, {
            center: userLocation,
            zoom: 15,
          });
          setMap(googleMap);
        }
      })
      .catch((error) => console.error('Erro ao carregar Google Maps:', error));
  }, [userLocation]);

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error: GeolocationPositionError) =>
          console.error('Erro ao obter localização:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Carregar pontos de ônibus próximos
  useEffect(() => {
    if (userLocation) {
      fetchNearbyBusStops(userLocation);
    }
  }, [userLocation]);

  // Adicionar marcadores ao mapa com InfoWindow
  useEffect(() => {
    if (map && busStops.length > 0 && isGoogleLoaded) {
      const infoWindow = new google.maps.InfoWindow();
      busStops.forEach((stop) => {
        const marker = new google.maps.Marker({
          position: { lat: stop.stop_lat, lng: stop.stop_lon },
          map,
          title: stop.stop_name,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Pino azul
            scaledSize: new google.maps.Size(32, 32), // Tamanho do ícone
          },
        });

        marker.addListener('click', () => {
          fetchLinesForStop(stop.stop_id).then((lines) => {
            const content = `
              <div>
                <h3>${stop.stop_name}</h3>
                <p>Linhas: ${lines.length > 0 ? lines.join(', ') : 'Nenhuma linha encontrada'}</p>
              </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });
        });
      });
    }
  }, [map, busStops, isGoogleLoaded]);

  // Função para buscar pontos de ônibus próximos via API local
  const fetchNearbyBusStops = async (location: Location) => {
    try {
      const response = await fetch(
        `/api/nearby-stops?lat=${location.lat}&lng=${location.lng}&radius=1000`
      );
      if (!response.ok) throw new Error('Erro na resposta da API');
      const stops: Stop[] = await response.json();
      setBusStops(stops);
    } catch (error) {
      console.error('Erro ao buscar pontos próximos:', error);
    }
  };

  // Função para buscar linhas que atendem um ponto (exemplo com API local)
  const fetchLinesForStop = async (stopId: string): Promise<string[]> => {
    try {
      const response = await fetch(`/api/lines-for-stop?stopId=${stopId}`);
      if (!response.ok) throw new Error('Erro ao buscar linhas');
      const data = await response.json();
      return data.lines || []; // Ajustar conforme a resposta da API
    } catch (error) {
      console.error('Erro ao buscar linhas para o ponto:', error);
      return [];
    }
  };

  // Selecionar um ponto e calcular tempos
  const handleStopSelection = async (stop: Stop) => {
    if (!isGoogleLoaded || !google) return;

    const stopWithGeometry: SelectedStop = {
      ...stop,
      geometry: {
        location: new google.maps.LatLng(stop.stop_lat, stop.stop_lon),
      },
    };
    setSelectedStop(stopWithGeometry);
    await fetchBusArrivalTime(stopWithGeometry);
    if (userLocation && stopWithGeometry.geometry) {
      await fetchWalkingTime(userLocation, stopWithGeometry.geometry.location);
    }
  };

  // Buscar previsão de chegada do ônibus (SPTrans)
  const fetchBusArrivalTime = async (stop: SelectedStop) => {
    try {
      // Exemplo: buscar linhas do ponto e simular tempo
      const response = await fetch(
        'http://api.olhovivo.sptrans.com.br/v2.1/Linha/Buscar', // Endpoint correto para linhas
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.SPTRANS_API_TOKEN}`,
          },
          body: JSON.stringify({ termosBusca: stop.stop_id }),
        }
      );
      if (!response.ok) throw new Error('Erro na API SPTrans');
      const data = await response.json();
      // Simulação por enquanto
      setBusArrivalTime('10');
    } catch (error) {
      console.error('Erro ao buscar previsão de chegada:', error);
      setBusArrivalTime('Indisponível');
    }
  };

  // Calcular tempo de caminhada (Google Maps Directions)
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
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (
            status === google.maps.DirectionsStatus.OK &&
            result &&
            result.routes &&
            result.routes[0].legs &&
            result.routes[0].legs[0].duration
          ) {
            const duration = result.routes[0].legs[0].duration.text;
            setWalkingTime(duration);
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Não fique parado no ponto</h1>
      {!userLocation ? (
        <p>Carregando sua localização...</p>
      ) : (
        <>
          <div id="map" style={{ height: '400px', width: '100%', marginBottom: '20px' }}></div>
          <h2>Pontos de ônibus próximos:</h2>
          <ul>
            {busStops.map((stop) => (
              <li
                key={stop.stop_id}
                className="cursor-pointer hover:underline"
                onClick={() => handleStopSelection(stop)}
              >
                {stop.stop_name} - {Math.round(stop.distance)}m
              </li>
            ))}
          </ul>
          {selectedStop && (
            <div>
              <h3>Ponto selecionado: {selectedStop.stop_name}</h3>
              <p>Tempo até o ônibus chegar: {busArrivalTime || 'Calculando...'}</p>
              <p>Tempo de caminhada: {walkingTime || 'Calculando...'}</p>
              {busArrivalTime && walkingTime && (
                <p>
                  Saia em{' '}
                  {Math.max(0, parseTime(busArrivalTime) - parseTime(walkingTime))}{' '}
                  minutos para chegar no horário!
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}