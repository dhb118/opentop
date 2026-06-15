export interface TrendSignalImport {
  signal: string;
  channels: string;
  rowCount: number;
}

export function parseTrendCsv(csv: string): TrendSignalImport | null {
  const rows = parseCsvRows(csv)
    .map((row) => row.map((cell) => cell.trim()).filter(Boolean))
    .filter((row) => row.length > 0);

  if (rows.length === 0) {
    return null;
  }

  const header = rows[0].map((cell) => cell.toLowerCase());
  const hasHeader = header.some((cell) => ["source", "channel", "signal", "note", "trend", "url"].includes(cell));
  const body = hasHeader ? rows.slice(1) : rows;
  const sourceIndex = findIndex(header, ["source", "channel", "platform"]);
  const signalIndex = findIndex(header, ["signal", "note", "trend", "summary"]);

  const items = body
    .map((row) => {
      const source = cleanCell(row[hasHeader && sourceIndex >= 0 ? sourceIndex : 0]);
      const signal = cleanCell(row[hasHeader && signalIndex >= 0 ? signalIndex : row.length > 1 ? 1 : 0]);
      return signal ? { source, signal } : null;
    })
    .filter((item): item is { source: string; signal: string } => Boolean(item))
    .slice(0, 12);

  if (items.length === 0) {
    return null;
  }

  const channels = Array.from(new Set(items.map((item) => item.source).filter(Boolean))).join(", ");
  const signal = items.map((item) => `${item.source ? `${item.source}: ` : ""}${item.signal}`).join("\n");

  return {
    signal,
    channels,
    rowCount: items.length
  };
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function findIndex(header: string[], candidates: string[]): number {
  return header.findIndex((cell) => candidates.includes(cell));
}

function cleanCell(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 360);
}
