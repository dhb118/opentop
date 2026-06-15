import "./styles.css";
import { analyzeOpportunity } from "./aiClient";
import type { AnalysisResult, OpportunityInput, ProviderSettings } from "./domain";
import { analyzeLocally } from "./opportunityEngine";
import { sampleBriefs } from "./sampleBriefs";
import { loadInput, loadSettings, saveInput, saveSettings } from "./storage";
import { createShareUrl, readBriefFromSearch } from "./urlState";

const appRoot = requireAppRoot();

let currentInput = readBriefFromSearch(window.location.search) ?? loadInput();
let settings = loadSettings();
let result: AnalysisResult | null = null;
let selectedId = "";
let isBusy = false;

render();
void runAnalysis();

function render(): void {
  appRoot.innerHTML = `
    <main class="shell">
      <section class="workspace" aria-label="OpenTop workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">OpenTop</p>
            <h1>AI Opportunity Radar</h1>
          </div>
          <div class="status-pill" title="Current inference mode">
            <span class="pulse"></span>
            ${labelForProvider(settings.provider)}
          </div>
        </header>

        <div class="layout">
          <aside class="control-panel">
            <section class="sample-strip" aria-label="Sample opportunity briefs">
              <p class="eyebrow">Try a brief</p>
              <div class="sample-grid">
                ${sampleBriefs
                  .map(
                    (brief) => `
                      <button class="sample-button" data-sample="${brief.id}" type="button">
                        ${escapeHtml(brief.title)}
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </section>

            <form id="briefForm">
              <label>
                Audience
                <input name="audience" value="${escapeHtml(currentInput.audience)}" />
              </label>
              <label>
                Signal Brief
                <textarea name="signal" rows="7">${escapeHtml(currentInput.signal)}</textarea>
              </label>
              <label>
                Constraints
                <textarea name="constraints" rows="4">${escapeHtml(currentInput.constraints)}</textarea>
              </label>
              <label>
                Launch Channels
                <textarea name="channels" rows="4">${escapeHtml(currentInput.channels)}</textarea>
              </label>

              <div class="slider-grid">
                ${slider("pain", "Pain", currentInput.pain)}
                ${slider("urgency", "Urgency", currentInput.urgency)}
                ${slider("distribution", "Distribution", currentInput.distribution)}
              </div>

              <button class="primary-action" type="submit" ${isBusy ? "disabled" : ""}>
                ${isBusy ? "Analyzing..." : "Analyze"}
              </button>
            </form>

            <details class="settings">
              <summary>Model Settings</summary>
              <form id="settingsForm">
                <label>
                  Provider
                  <select name="provider">
                    ${option("demo", "Demo engine", settings.provider)}
                    ${option("openai-compatible", "OpenAI-compatible", settings.provider)}
                    ${option("ollama", "Ollama", settings.provider)}
                  </select>
                </label>
                <label>
                  Endpoint
                  <input name="endpoint" placeholder="https://api.openai.com/v1/chat/completions" value="${escapeHtml(settings.endpoint)}" />
                </label>
                <label>
                  API Key
                  <input name="apiKey" type="password" autocomplete="off" value="${escapeHtml(settings.apiKey)}" />
                </label>
                <label>
                  Model
                  <input name="model" placeholder="gpt-4.1-mini or llama3.1" value="${escapeHtml(settings.model)}" />
                </label>
                <button type="submit" class="secondary-action">Save Settings</button>
              </form>
            </details>
          </aside>

          <section class="radar-panel">
            <div class="canvas-wrap">
              <canvas id="radarCanvas" width="760" height="360" aria-label="Opportunity score radar"></canvas>
              <div class="canvas-copy">
                <span>${result ? result.generatedBy : "warming-up"}</span>
                <strong>${result ? escapeHtml(result.summary) : "Reading the signal brief and preparing the first opportunity map."}</strong>
              </div>
            </div>

            <div class="results-grid">
              ${result ? renderResults(result) : renderSkeletons()}
            </div>
          </section>
        </div>
      </section>
    </main>
  `;

  bindEvents();
  drawRadar();
}

function requireAppRoot(): HTMLDivElement {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) {
    throw new Error("Missing #app root.");
  }
  return root;
}

function bindEvents(): void {
  document.querySelector<HTMLFormElement>("#briefForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    currentInput = readInput(event.currentTarget as HTMLFormElement);
    saveInput(currentInput);
    void runAnalysis();
  });

  document.querySelector<HTMLFormElement>("#settingsForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    settings = readSettings(event.currentTarget as HTMLFormElement);
    saveSettings(settings);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.select ?? selectedId;
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const sample = sampleBriefs.find((brief) => brief.id === button.dataset.sample);
      if (!sample) {
        return;
      }
      currentInput = sample.input;
      saveInput(currentInput);
      void runAnalysis();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const selected = result?.opportunities.find((item) => item.id === selectedId);
      if (!selected) {
        return;
      }
      const mode = button.dataset.copy;
      await navigator.clipboard.writeText(copyPayload(mode, selected));
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = copyLabel(mode);
      }, 1400);
    });
  });

  document.querySelector<HTMLButtonElement>("[data-download]")?.addEventListener("click", () => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }
    downloadJson(`${selected.id}.json`, selected);
  });
}

async function runAnalysis(): Promise<void> {
  isBusy = true;
  render();
  try {
    result = await analyzeOpportunity(currentInput, settings);
    selectedId = result.opportunities[0]?.id ?? "";
  } catch (error) {
    result = {
      generatedBy: "local-engine",
      summary: error instanceof Error ? error.message : "Model request failed. Falling back to local analysis.",
      opportunities: []
    };
  } finally {
    isBusy = false;
    const currentResult = result;
    if (!currentResult || currentResult.opportunities.length === 0) {
      const fallback = analyzeFallback(currentInput);
      result = currentResult
        ? {
            ...currentResult,
            opportunities: fallback.opportunities
          }
        : fallback;
      selectedId = result.opportunities[0]?.id ?? "";
    }
    render();
  }
}

function renderResults(analysis: AnalysisResult): string {
  const selected = analysis.opportunities.find((item) => item.id === selectedId) ?? analysis.opportunities[0];

  return `
    <div class="opportunity-list">
      ${analysis.opportunities
        .map(
          (item) => `
            <button class="opportunity-card ${item.id === selected?.id ? "active" : ""}" data-select="${item.id}" type="button">
              <span>${item.score}/10</span>
              <strong>${escapeHtml(item.name)}</strong>
              <small>${escapeHtml(item.tagline)}</small>
            </button>
          `
        )
        .join("")}
    </div>
    ${selected ? renderOpportunityDetail(selected) : ""}
  `;
}

function renderOpportunityDetail(item: NonNullable<AnalysisResult["opportunities"][number]>): string {
  return `
    <article class="detail-panel">
      <div class="detail-heading">
        <div>
          <p class="eyebrow">Selected wedge</p>
          <h2>${escapeHtml(item.name)}</h2>
        </div>
        <div class="action-row">
          <button class="secondary-action" data-copy="markdown" type="button">Copy README Brief</button>
          <button class="secondary-action" data-copy="show-hn" type="button">Copy Show HN</button>
          <button class="secondary-action" data-copy="share-url" type="button">Copy Share Link</button>
          <button class="secondary-action" data-download type="button">Download JSON</button>
        </div>
      </div>
      <p class="tagline">${escapeHtml(item.tagline)}</p>
      <div class="score-strip">
        ${Object.entries(item.scores)
          .map(([label, value]) => `<span><b>${value}</b>${humanize(label)}</span>`)
          .join("")}
      </div>
      <div class="detail-grid">
        ${detailBlock("Wedge", item.wedge)}
        ${detailBlock("Differentiator", item.differentiator)}
        ${detailBlock("Moat", item.moat)}
        ${listBlock("First Release", item.firstRelease)}
        ${listBlock("Launch Plan", item.launchPlan)}
        ${listBlock("Risks", item.risks)}
      </div>
    </article>
  `;
}

function drawRadar(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#radarCanvas");
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#10130f";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 32; i += 1) {
    ctx.strokeStyle = `rgba(190, 255, 70, ${i % 4 === 0 ? 0.18 : 0.06})`;
    ctx.beginPath();
    ctx.moveTo(i * 28, 0);
    ctx.lineTo(i * 28 - 180, height);
    ctx.stroke();
  }

  const opportunities = result?.opportunities ?? [];
  opportunities.forEach((item, index) => {
    const x = 90 + index * 145;
    const y = height - 48 - item.score * 24;
    const radius = 18 + item.score * 2;
    const gradient = ctx.createRadialGradient(x, y, 2, x, y, radius);
    gradient.addColorStop(0, "#f8ff7a");
    gradient.addColorStop(0.48, index % 2 ? "#36e4c6" : "#ff6a4d");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f4f1e7";
    ctx.font = "600 13px Georgia";
    ctx.fillText(`${item.score}/10`, x - 18, y - radius - 8);
  });
}

function readInput(form: HTMLFormElement): OpportunityInput {
  const data = new FormData(form);
  return {
    audience: String(data.get("audience") ?? ""),
    signal: String(data.get("signal") ?? ""),
    constraints: String(data.get("constraints") ?? ""),
    channels: String(data.get("channels") ?? ""),
    pain: Number(data.get("pain") ?? 5),
    urgency: Number(data.get("urgency") ?? 5),
    distribution: Number(data.get("distribution") ?? 5)
  };
}

function readSettings(form: HTMLFormElement): ProviderSettings {
  const data = new FormData(form);
  return {
    provider: String(data.get("provider") ?? "demo") as ProviderSettings["provider"],
    endpoint: String(data.get("endpoint") ?? ""),
    apiKey: String(data.get("apiKey") ?? ""),
    model: String(data.get("model") ?? "")
  };
}

function renderSkeletons(): string {
  return Array.from({ length: 3 }, () => `<div class="skeleton"></div>`).join("");
}

function slider(name: keyof Pick<OpportunityInput, "pain" | "urgency" | "distribution">, label: string, value: number): string {
  return `
    <label class="range-label">
      <span>${label}</span>
      <output>${value}</output>
      <input name="${name}" type="range" min="1" max="10" value="${value}" />
    </label>
  `;
}

function option(value: ProviderSettings["provider"], label: string, current: ProviderSettings["provider"]): string {
  return `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`;
}

function detailBlock(title: string, body: string): string {
  return `<section><h3>${title}</h3><p>${escapeHtml(body)}</p></section>`;
}

function listBlock(title: string, items: string[]): string {
  return `<section><h3>${title}</h3><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`;
}

function labelForProvider(provider: ProviderSettings["provider"]): string {
  return provider === "demo" ? "Demo engine" : provider === "ollama" ? "Ollama ready" : "API ready";
}

function humanize(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => ` ${letter}`).toLowerCase();
}

function toMarkdown(title: string, item: AnalysisResult["opportunities"][number]): string {
  return `# ${title}

${item.repoHook}

## Why this can work

- Target user: ${item.targetUser}
- Wedge: ${item.wedge}
- Differentiator: ${item.differentiator}
- Moat: ${item.moat}

## First release

${item.firstRelease.map((entry) => `- ${entry}`).join("\n")}

## Launch plan

${item.launchPlan.map((entry) => `- ${entry}`).join("\n")}
`;
}

function toShowHnPost(item: AnalysisResult["opportunities"][number]): string {
  return `Show HN: ${item.name} - ${item.repoHook}

I built ${item.name} for ${item.targetUser}.

The wedge: ${item.wedge}

Why it is different: ${item.differentiator}

First release scope:
${item.firstRelease.map((entry) => `- ${entry}`).join("\n")}

Launch plan:
${item.launchPlan.map((entry) => `- ${entry}`).join("\n")}
`;
}

function copyPayload(mode: string | undefined, item: AnalysisResult["opportunities"][number]): string {
  if (mode === "show-hn") {
    return toShowHnPost(item);
  }
  if (mode === "share-url") {
    return createShareUrl(currentInput, window.location.href);
  }
  return toMarkdown(item.name, item);
}

function copyLabel(mode: string | undefined): string {
  if (mode === "show-hn") {
    return "Copy Show HN";
  }
  if (mode === "share-url") {
    return "Copy Share Link";
  }
  return "Copy README Brief";
}

function downloadJson(filename: string, item: AnalysisResult["opportunities"][number]): void {
  const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function analyzeFallback(input: OpportunityInput): AnalysisResult {
  return analyzeLocally(input);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
