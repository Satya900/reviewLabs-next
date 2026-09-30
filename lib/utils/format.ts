export function initialFromName(name?: string | null) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

export function timeUntil(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now();
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (hours < 0) return `${Math.abs(hours)}h overdue`;
  if (hours < 1) return "due within the hour";
  return `due in ${hours}h`;
}
