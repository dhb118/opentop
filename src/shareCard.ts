import type { Opportunity } from "./domain.ts";

export const shareCardDimensions = {
  height: 630,
  width: 1200
} as const;

export function buildShareCardSvg(opportunity: Opportunity): string {
  const title = escapeXml(opportunity.name);
  const hook = escapeXml(opportunity.repoHook);
  const wedge = escapeXml(truncate(opportunity.wedge, 110));
  const score = escapeXml(`${opportunity.score}/10`);
  const targetUser = escapeXml(truncate(opportunity.targetUser, 88));

  return `<svg width="${shareCardDimensions.width}" height="${shareCardDimensions.height}" viewBox="0 0 ${shareCardDimensions.width} ${shareCardDimensions.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#10130F"/>
  <path d="M0 72H1200M0 144H1200M0 216H1200M0 288H1200M0 360H1200M0 432H1200M0 504H1200M0 576H1200" stroke="#F5F1E6" stroke-opacity=".08"/>
  <path d="M104 0L0 630M224 0L120 630M344 0L240 630M464 0L360 630M584 0L480 630M704 0L600 630M824 0L720 630M944 0L840 630M1064 0L960 630M1184 0L1080 630" stroke="#D8FF4F" stroke-opacity=".12"/>
  <circle cx="920" cy="170" r="220" fill="#32DCC0" fill-opacity=".16"/>
  <circle cx="244" cy="530" r="270" fill="#FF704D" fill-opacity=".18"/>
  <rect x="78" y="72" width="1044" height="486" rx="20" fill="#1C1F19" fill-opacity=".84" stroke="#F5F1E6" stroke-opacity=".16"/>
  <text x="112" y="132" fill="#D8FF4F" font-family="Consolas, monospace" font-size="28" font-weight="700">OPENTOP OPPORTUNITY</text>
  <text x="112" y="238" fill="#F5F1E6" font-family="Georgia, serif" font-size="78" font-weight="700">${title}</text>
  <text x="112" y="306" fill="#D8D4C2" font-family="Georgia, serif" font-size="32">${hook}</text>
  <text x="112" y="388" fill="#F5F1E6" font-family="Georgia, serif" font-size="34">${wedge}</text>
  <text x="112" y="456" fill="#A8AA9A" font-family="Consolas, monospace" font-size="22">Target: ${targetUser}</text>
  <rect x="112" y="488" width="172" height="58" rx="10" fill="#D8FF4F"/>
  <text x="138" y="527" fill="#10130F" font-family="Consolas, monospace" font-size="28" font-weight="700">${score}</text>
  <text x="312" y="527" fill="#F5F1E6" font-family="Consolas, monospace" font-size="24" font-weight="700">Built with TypeScript. Local-first. GitHub-ready.</text>
</svg>
`;
}

export function buildShareCardSvgDataUrl(opportunity: Opportunity): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildShareCardSvg(opportunity))}`;
}

export async function renderShareCardPngBlob(opportunity: Opportunity): Promise<Blob> {
  const image = await loadImage(buildShareCardSvgDataUrl(opportunity));
  const canvas = document.createElement("canvas");
  canvas.width = shareCardDimensions.width;
  canvas.height = shareCardDimensions.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering is not available.");
  }

  context.drawImage(image, 0, 0, shareCardDimensions.width, shareCardDimensions.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("PNG export failed."));
      }
    }, "image/png");
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";

  const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Share card image failed to load."));
  });

  image.src = src;

  if (typeof image.decode === "function") {
    await image.decode();
    return image;
  }

  return loaded;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
