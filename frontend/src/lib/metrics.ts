export function readNumber(obj: unknown, key: string): number | null {
  if (!obj || typeof obj !== "object") return null;
  const v = (obj as Record<string, unknown>)[key];
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function formatSeconds(v: number | null): string {
  if (v === null) return "—";
  return `${v.toFixed(2)}s`;
}

export function formatMs(v: number | null): string {
  if (v === null) return "—";
  return `${Math.round(v)}ms`;
}

export function formatBytes(v: number | null): string {
  if (v === null) return "—";
  const units = ["B", "KB", "MB", "GB"] as const;
  let n = v;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)}${units[i]}`;
}

export function delta(before: number | null, after: number | null): number | null {
  if (before === null || after === null) return null;
  return after - before;
}

