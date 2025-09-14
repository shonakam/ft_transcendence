export function getUnixTimeSec(): number {
  return Math.floor(Date.now() / 1000);
}

export function getUnixTimeMs(): number {
  return Date.now();
}
