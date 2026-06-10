function parseTime12h(t: string): number {
  const match = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

export function isStoreOpenNow(hours: string | null | undefined): boolean {
  if (!hours) return false;
  const commaIdx = hours.indexOf(",");
  if (commaIdx === -1) return false;
  const days = hours.slice(0, commaIdx).trim();
  const timePart = hours.slice(commaIdx + 1).trim();
  const dashIdx = timePart.indexOf(" – ");
  if (dashIdx === -1) return false;
  const openMin = parseTime12h(timePart.slice(0, dashIdx).trim());
  const closeMin = parseTime12h(timePart.slice(dashIdx + 3).trim());
  if (openMin === -1 || closeMin === -1) return false;

  const now = new Date();
  const dow = now.getDay(); // 0=Sun … 6=Sat
  const dayOpen =
    days === "Everyday" ? true :
    days === "Mon–Sat" ? dow >= 1 && dow <= 6 :
    days === "Mon–Fri" ? dow >= 1 && dow <= 5 :
    days === "Sat–Sun" ? dow === 0 || dow === 6 :
    false;
  if (!dayOpen) return false;

  const cur = now.getHours() * 60 + now.getMinutes();
  return closeMin > openMin
    ? cur >= openMin && cur < closeMin
    : cur >= openMin || cur < closeMin;
}
