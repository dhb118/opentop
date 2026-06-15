export interface TrendSignalImport {
  signal: string;
  channels: string;
  rowCount: number;
  ignoredCount: number;
  format: "csv" | "notes";
}

interface TrendItem {
  source: string;
  signal: string;
}

export function parseTrendSignals(input: string): TrendSignalImport | null {
  return looksLikeCsv(input) ? parseTrendCsv(input) : parseTrendNotes(input);
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

  const parsed = body.map((row) => {
    const source = cleanCell(row[hasHeader && sourceIndex >= 0 ? sourceIndex : 0]);
    const signal = cleanCell(row[hasHeader && signalIndex >= 0 ? signalIndex : row.length > 1 ? 1 : 0]);
    return signal ? { source, signal } : null;
  });
  const items = parsed.filter((item): item is TrendItem => Boolean(item)).slice(0, 12);

  if (items.length === 0) {
    return null;
  }

  return {
    ...buildImport(items),
    ignoredCount: parsed.length - items.length,
    format: "csv"
  };
}

export function parseTrendNotes(notes: string): TrendSignalImport | null {
  const parsed = notes
    .split(/\r?\n/)
    .map(cleanNoteLine)
    .filter((line) => line.length > 0)
    .map(parseNoteLine);
  const items = parsed.filter((item): item is TrendItem => Boolean(item)).slice(0, 12);

  if (items.length === 0) {
    return null;
  }

  return {
    ...buildImport(items),
    ignoredCount: parsed.length - items.length,
    format: "notes"
  };
}

function buildImport(items: TrendItem[]): Pick<TrendSignalImport, "signal" | "channels" | "rowCount"> {
  const channels = Array.from(new Set(items.map((item) => item.source).filter(Boolean))).join(", ");
  const signal = items.map((item) => `${item.source ? `${item.source}: ` : ""}${item.signal}`).join("\n");

  return {
    channels,
    rowCount: items.length,
    signal
  };
}

function looksLikeCsv(input: string): boolean {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return false;
  }

  const first = lines[0].toLowerCase();
  return first.includes(",") && (first.includes("source") || first.includes("signal") || first.includes("channel"));
}

function cleanNoteLine(line: string): string {
  return line
    .replace(/^\s{0,3}[-*+]\s+/, "")
    .replace(/^\s{0,3}\d+[.)]\s+/, "")
    .replace(/^>\s?/, "")
    .trim();
}

function parseNoteLine(line: string): TrendItem | null {
  const withoutLinks = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 $2");
  const match = withoutLinks.match(/^([^:|-]{2,32})\s*[:|-]\s*(.+)$/);
  const source = cleanCell(match?.[1]);
  const signal = cleanCell(match?.[2] ?? withoutLinks);

  if (signal.length < 12) {
    return null;
  }

  return { source, signal };
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
