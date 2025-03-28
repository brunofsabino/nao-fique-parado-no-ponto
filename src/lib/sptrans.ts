// app/lib/sptrans.ts
let sptransCookie: string | null = null;

export function setSptransCookie(cookie: string | null) {
  sptransCookie = cookie;
}

export function getSptransCookie(): string | null {
  return sptransCookie;
}
