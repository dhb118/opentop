import "./styles.css";
import { analyzeOpportunity, defaultEndpointForProvider, defaultModelForProvider } from "./aiClient";
import { buildBenchmarkComparisons } from "./benchmarkComparison";
import type { BenchmarkDimension, BenchmarkRepo } from "./benchmarkRepos";
import type { AnalysisResult, Opportunity, OpportunityInput, ProviderSettings } from "./domain";
import {
  buildBuildLogPost,
  buildContributorQueueMarkdown,
  buildDemoRecordingScript,
  buildGitHubIssueBody,
  buildLaunchKit,
  buildNewsletterPitch,
  buildProductHuntLaunchDraft,
  buildPublicLaunchBriefMarkdown,
  buildReadmeBrief,
  buildRedditPost,
  buildRepoListingPackMarkdown,
  buildRepoScaffoldPlan,
  buildShowHnPost,
  buildStarGrowthPlanMarkdown,
  buildXThread
} from "./launchExports";
import { isOpportunityNavigationKey, nextOpportunityIndex } from "./keyboardNavigation";
import {
  defaultInputForLocale,
  detectDefaultLocale,
  localeOptions,
  normalizeLocale,
  textForLocale,
  type AppLocale
} from "./localization";
import { analyzeLocally, totalScore } from "./opportunityEngine";
import { buildOpportunityJsonExport } from "./opportunityJsonExport";
import {
  auditReadmeForStars,
  fetchGitHubRepoProfile,
  fetchGitHubReadme,
  formatGitHubRepoStarProfile,
  formatReadmeStarAudit,
  formatStarReadinessSprint,
  type GitHubRepoStarProfile,
  type ReadmeStarAudit
} from "./readmeAudit";
import { buildRepoScaffoldZipBlob, repoScaffoldRootName } from "./repoScaffold";
import { sampleBriefsForLocale } from "./sampleBriefs";
import {
  defaultScoringProfileId,
  getScoringProfile,
  scoringProfiles,
  type ScoringProfile
} from "./scoringProfiles";
import { buildShareCardSvg, renderShareCardPngBlob } from "./shareCard";
import {
  loadInput,
  loadLocale,
  loadScoringProfileId,
  loadSettings,
  saveInput,
  saveLocale,
  saveScoringProfileId,
  saveSettings
} from "./storage";
import { fetchGitHubIssueSignals, parseGitHubIssueUrls, parseTrendSignals } from "./trendImport";
import { createShareUrl, readBriefFromSearch } from "./urlState";

const appRoot = requireAppRoot();
const benchmarkDimensions = new Set<BenchmarkDimension>([
  "pain",
  "urgency",
  "distribution",
  "buildability",
  "starPotential"
]);

let locale: AppLocale = loadLocale(detectDefaultLocale(navigator.languages));
let currentInput = readBriefFromSearch(window.location.search) ?? loadInput(defaultInputForLocale(locale));
let settings = loadSettings();
let selectedScoringProfileId = loadScoringProfileId();
let result: AnalysisResult | null = null;
let selectedId = "";
let isBusy = false;
let pendingFocusId = "";
let importFeedback = "";
let readmeAuditRepoUrl = "";
let readmeAuditText = "";
let readmeAuditResult: ReadmeStarAudit | null = null;
let repoStarProfileResult: GitHubRepoStarProfile | null = null;
let readmeAuditFeedback = "";
let benchmarks: BenchmarkRepo[] = [];
let benchmarkStatus: "loading" | "ready" | "failed" = "loading";

render();
void runAnalysis();
void loadBenchmarks();

function render(): void {
  const ui = textForLocale(locale);
  const localizedSampleBriefs = sampleBriefsForLocale(locale);

  appRoot.innerHTML = `
    <main class="shell">
      <section class="workspace" aria-label="${escapeHtml(ui.workspaceAria)}">
        <header class="topbar">
          <div>
            <p class="eyebrow">OpenTop</p>
            <h1>${escapeHtml(ui.appTitle)}</h1>
          </div>
          <div class="topbar-actions">
            <label class="locale-switch">
              <span>${escapeHtml(ui.language)}</span>
              <select name="locale" aria-label="${escapeHtml(ui.language)}">
                ${localeOptions
                  .map(
                    (option) => `
                      <option value="${option.value}" ${option.value === locale ? "selected" : ""}>${escapeHtml(option.label)}</option>
                    `
                  )
                  .join("")}
              </select>
            </label>
            <div class="status-pill" title="${escapeHtml(ui.currentInferenceMode)}">
              <span class="pulse"></span>
              ${escapeHtml(labelForProvider(settings.provider))}
            </div>
          </div>
        </header>

        <div class="layout">
          <aside class="control-panel">
            <section class="sample-strip" aria-label="${escapeHtml(ui.tryBrief)}">
              <p class="eyebrow">${escapeHtml(ui.tryBrief)}</p>
              <div class="sample-grid">
                ${localizedSampleBriefs
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

            <details class="import-panel">
              <summary>${escapeHtml(ui.importSignals)}</summary>
              <label>
                ${escapeHtml(ui.trendSignalsLabel)}
                <textarea name="trendSignals" rows="5" placeholder="${escapeHtml(ui.trendSignalsPlaceholder)}"></textarea>
              </label>
              <div class="import-actions">
                <button class="secondary-action" data-import-trends type="button">${escapeHtml(ui.useSignals)}</button>
                <span data-import-feedback aria-live="polite">${escapeHtml(importFeedback)}</span>
              </div>
            </details>

            ${renderReadmeAuditPanel()}

            ${renderScoringMarketplace()}

            <form id="briefForm">
              <label>
                ${escapeHtml(ui.audience)}
                <input name="audience" value="${escapeHtml(currentInput.audience)}" />
              </label>
              <label>
                ${escapeHtml(ui.signalBrief)}
                <textarea name="signal" rows="7">${escapeHtml(currentInput.signal)}</textarea>
              </label>
              <label>
                ${escapeHtml(ui.constraints)}
                <textarea name="constraints" rows="4">${escapeHtml(currentInput.constraints)}</textarea>
              </label>
              <label>
                ${escapeHtml(ui.launchChannels)}
                <textarea name="channels" rows="4">${escapeHtml(currentInput.channels)}</textarea>
              </label>

              <div class="slider-grid">
                ${slider("pain", ui.pain, currentInput.pain)}
                ${slider("urgency", ui.urgency, currentInput.urgency)}
                ${slider("distribution", ui.distribution, currentInput.distribution)}
              </div>

              <button class="primary-action" type="submit" ${isBusy ? "disabled" : ""}>
                ${isBusy ? escapeHtml(ui.analyzing) : escapeHtml(ui.analyze)}
              </button>
            </form>

            <details class="settings">
              <summary>${escapeHtml(ui.modelSettings)}</summary>
              <form id="settingsForm">
                <label>
                  ${escapeHtml(ui.provider)}
                  <select name="provider">
                    ${option("demo", labelForProvider("demo"), settings.provider)}
                    ${option("openai-compatible", "OpenAI-compatible", settings.provider)}
                    ${option("ollama", "Ollama", settings.provider)}
                    ${option("anthropic", "Anthropic", settings.provider)}
                    ${option("anthropic-bedrock", "Anthropic on Bedrock", settings.provider)}
                    ${option("anthropic-vertex", "Anthropic on Vertex AI", settings.provider)}
                  </select>
                </label>
                <label>
                  ${escapeHtml(ui.endpoint)}
                  <input name="endpoint" placeholder="https://api.openai.com/v1/chat/completions" value="${escapeHtml(settings.endpoint)}" />
                </label>
                <label>
                  ${escapeHtml(ui.apiKey)}
                  <input name="apiKey" type="password" autocomplete="off" value="${escapeHtml(settings.apiKey)}" />
                </label>
                <label>
                  ${escapeHtml(ui.model)}
                  <input name="model" placeholder="gpt-4.1-mini or llama3.1" value="${escapeHtml(settings.model)}" />
                </label>
                <button type="submit" class="secondary-action">${escapeHtml(ui.saveSettings)}</button>
              </form>
            </details>
          </aside>

          <section class="radar-panel">
            <div class="canvas-wrap">
              <canvas id="radarCanvas" width="760" height="360" aria-label="${escapeHtml(ui.scoreExplanation)}"></canvas>
              <div class="canvas-copy">
                <span>${result ? result.generatedBy : escapeHtml(ui.warmingUp)}</span>
                <strong>${result ? escapeHtml(result.summary) : escapeHtml(ui.preparingMap)}</strong>
              </div>
            </div>

            ${renderGalleryRail()}

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
  restorePendingFocus();
}

function requireAppRoot(): HTMLDivElement {
  const root = document.querySelector<HTMLDivElement>("#app");
  if (!root) {
    throw new Error("Missing #app root.");
  }
  return root;
}

function renderReadmeAuditPanel(): string {
  const ui = textForLocale(locale);
  const result = readmeAuditResult;
  const isOpen = readmeAuditText || result ? "open" : "";

  return `
    <details class="readme-audit-panel" ${isOpen}>
      <summary>${escapeHtml(ui.readmeAudit)}</summary>
      <label>
        ${escapeHtml(ui.githubRepositoryUrl)}
        <input name="readmeRepoUrl" placeholder="https://github.com/owner/repo" value="${escapeHtml(readmeAuditRepoUrl)}" />
      </label>
      <label>
        ${escapeHtml(ui.pasteOrFetchReadme)}
        <textarea name="readmeAudit" rows="5" placeholder="# My AI Tool&#10;&#10;A local-first assistant for...">${escapeHtml(readmeAuditText)}</textarea>
      </label>
      <div class="readme-audit-actions">
        <button class="secondary-action" data-fetch-readme type="button">${escapeHtml(ui.fetchReadme)}</button>
        <button class="secondary-action" data-audit-readme type="button">${escapeHtml(ui.auditReadme)}</button>
        ${
          result
            ? `<button class="secondary-action" data-copy-readme-audit type="button">${escapeHtml(ui.copyAudit)}</button>`
            : ""
        }
        ${
          result
            ? `<button class="secondary-action" data-copy-star-sprint type="button">${escapeHtml(ui.copySprint)}</button>`
            : ""
        }
        ${
          repoStarProfileResult
            ? `<button class="secondary-action" data-copy-repo-profile type="button">${escapeHtml(ui.copyProfile)}</button>`
            : ""
        }
        <span data-readme-audit-feedback aria-live="polite">${escapeHtml(readmeAuditFeedback)}</span>
      </div>
      ${result ? renderReadmeAuditResult(result) : ""}
      ${repoStarProfileResult ? renderRepoStarProfile(repoStarProfileResult) : ""}
    </details>
  `;
}

function renderReadmeAuditResult(result: ReadmeStarAudit): string {
  const ui = textForLocale(locale);
  const topFixes =
    result.topFixes.length > 0
      ? result.topFixes.map((item) => `<li>${escapeHtml(item.fix)}</li>`).join("")
      : `<li>${escapeHtml(ui.noCriticalGaps)}</li>`;
  const checks = result.items
    .map(
      (item) => `
        <span class="${item.passed ? "passed" : "missing"}">
          <b>${item.passed ? "Pass" : "Fix"}</b>
          ${escapeHtml(item.label)}
        </span>
      `
    )
    .join("");

  return `
    <section class="readme-audit-result" aria-label="README star audit result">
      <div class="readme-audit-score">
        <strong>${result.score}</strong>
        <span>${escapeHtml(result.grade)}</span>
        <small>${result.passedCount}/${result.totalCount} ${escapeHtml(ui.checks)}</small>
      </div>
      <p>${escapeHtml(result.summary)}</p>
      <div>
        <h3>${escapeHtml(ui.topFixes)}</h3>
        <ol>${topFixes}</ol>
      </div>
      <div class="readme-audit-checks">
        ${checks}
      </div>
    </section>
  `;
}

function renderRepoStarProfile(profile: GitHubRepoStarProfile): string {
  const ui = textForLocale(locale);
  const topFixes =
    profile.topFixes.length > 0
      ? profile.topFixes.map((item) => `<li>${escapeHtml(item.fix)}</li>`).join("")
      : `<li>${escapeHtml(ui.noCriticalGaps)}</li>`;
  const stats = [
    ["Stars", String(profile.stats.stars)],
    ["Forks", String(profile.stats.forks)],
    ["Issues", String(profile.stats.openIssues)],
    ["Topics", profile.stats.topics.length > 0 ? profile.stats.topics.slice(0, 4).join(", ") : "none"]
  ];

  return `
    <section class="repo-profile-result" aria-label="GitHub star profile result">
      <div class="repo-profile-heading">
        <div>
          <p class="eyebrow">GitHub profile</p>
          <h3>${profile.score}/100 ${escapeHtml(profile.grade)}</h3>
        </div>
        <p>${escapeHtml(profile.summary)}</p>
      </div>
      <div class="repo-profile-stats">
        ${stats.map(([label, value]) => `<span><b>${escapeHtml(value)}</b>${escapeHtml(label)}</span>`).join("")}
      </div>
      <div>
        <h3>${escapeHtml(ui.profileFixes)}</h3>
        <ol>${topFixes}</ol>
      </div>
    </section>
  `;
}

function renderScoringMarketplace(): string {
  const ui = textForLocale(locale);
  const activeProfile = selectedScoringProfile();

  return `
    <section class="scoring-marketplace" aria-label="Scoring template marketplace">
      <div class="marketplace-heading">
        <p class="eyebrow">${escapeHtml(ui.scoringTemplates)}</p>
        <strong>${escapeHtml(activeProfile.name)}</strong>
        <span>${escapeHtml(activeProfile.bestFor)}</span>
      </div>
      <div class="template-grid">
        ${scoringProfiles.map((profile) => renderScoringProfileButton(profile, activeProfile.id)).join("")}
      </div>
    </section>
  `;
}

function renderScoringProfileButton(profile: ScoringProfile, activeProfileId: string): string {
  const isActive = profile.id === activeProfileId;
  const weights = Object.entries(profile.weights)
    .map(
      ([dimension, weight]) => `
        <span title="${escapeHtml(humanize(dimension))}: ${Math.round(weight * 100)}%">
          <i style="height: ${Math.round(weight * 100)}%"></i>
        </span>
      `
    )
    .join("");

  return `
    <button
      class="template-card ${isActive ? "active" : ""}"
      data-scoring-profile="${profile.id}"
      type="button"
      aria-pressed="${isActive ? "true" : "false"}"
    >
      <span>${escapeHtml(profile.name)}</span>
      <small>${escapeHtml(profile.tagline)}</small>
      <div class="weight-bars" aria-label="${escapeHtml(profile.name)} score weights">
        ${weights}
      </div>
    </button>
  `;
}

function bindEvents(): void {
  document.querySelector<HTMLSelectElement>("[name='locale']")?.addEventListener("change", (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    const nextLocale = normalizeLocale(select.value);
    if (nextLocale === locale) {
      return;
    }

    const previousLocale = locale;
    const shouldSwapDefaultInput = isDefaultLocaleInput(currentInput, previousLocale);
    locale = nextLocale;
    saveLocale(locale);
    if (!readBriefFromSearch(window.location.search) && shouldSwapDefaultInput) {
      currentInput = defaultInputForLocale(locale);
      saveInput(currentInput);
    }
    result = null;
    void runAnalysis();
  });

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

  document.querySelector<HTMLSelectElement>("#settingsForm [name='provider']")?.addEventListener("change", (event) => {
    const provider = (event.currentTarget as HTMLSelectElement).value as ProviderSettings["provider"];
    const form = document.querySelector<HTMLFormElement>("#settingsForm");
    const endpoint = form?.elements.namedItem("endpoint") as HTMLInputElement | null;
    const model = form?.elements.namedItem("model") as HTMLInputElement | null;

    if (endpoint && (!settings.endpoint || endpoint.value === defaultEndpointForProvider(settings.provider))) {
      endpoint.value = provider === "demo" ? "" : defaultEndpointForProvider(provider);
    }
    if (model && (!settings.model || model.value === defaultModelForProvider(settings.provider))) {
      model.value = provider === "demo" ? "" : defaultModelForProvider(provider);
    }
  });

  document.querySelectorAll<HTMLButtonElement>("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      selectOpportunity(button.dataset.select ?? selectedId);
    });

    button.addEventListener("keydown", (event) => {
      if (!isOpportunityNavigationKey(event.key)) {
        return;
      }

      event.preventDefault();
      const cards = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-select]"));
      const currentIndex = cards.findIndex((card) => card === event.currentTarget);
      const nextIndex = nextOpportunityIndex(currentIndex, cards.length, event.key);
      const nextId = cards[nextIndex]?.dataset.select;
      if (!nextId || nextId === selectedId) {
        return;
      }

      selectOpportunity(nextId, true);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const sample = sampleBriefsForLocale(locale).find((brief) => brief.id === button.dataset.sample);
      if (!sample) {
        return;
      }
      currentInput = sample.input;
      saveInput(currentInput);
      void runAnalysis();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-scoring-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedScoringProfileId = getScoringProfile(button.dataset.scoringProfile ?? defaultScoringProfileId).id;
      saveScoringProfileId(selectedScoringProfileId);
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
      button.textContent = textForLocale(locale).copied;
      window.setTimeout(() => {
        button.textContent = copyLabel(mode);
      }, 1400);
    });
  });

  document.querySelector<HTMLButtonElement>("[data-import-trends]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const input = document.querySelector<HTMLTextAreaElement>("[name='trendSignals']");
    const feedback = document.querySelector<HTMLSpanElement>("[data-import-feedback]");
    const rawSignals = input?.value ?? "";
    const githubIssueCount = parseGitHubIssueUrls(rawSignals).length;
    const ui = textForLocale(locale);

    button.disabled = true;
    if (githubIssueCount > 0) {
      updateImportFeedback(
        feedback,
        locale === "zh-CN"
          ? `正在抓取 ${githubIssueCount} 个公开 GitHub issue...`
          : `Fetching ${githubIssueCount} public GitHub issue${githubIssueCount === 1 ? "" : "s"}...`
      );
    }

    try {
      const parsed = githubIssueCount > 0 ? await fetchGitHubIssueSignals(rawSignals) : parseTrendSignals(rawSignals);

      if (!parsed) {
        updateImportFeedback(feedback, ui.noUsableSignals);
        return;
      }

      updateImportFeedback(
        feedback,
        locale === "zh-CN"
          ? `已导入 ${parsed.rowCount} 条${labelForTrendImport(parsed.format)}${
              parsed.ignoredCount > 0 ? `，跳过 ${parsed.ignoredCount} 条` : ""
            }${parsed.failures?.length ? `，失败 ${parsed.failures.length} 条` : ""}`
          : `Imported ${parsed.rowCount} ${labelForTrendImport(parsed.format)}${
              parsed.ignoredCount > 0 ? `, skipped ${parsed.ignoredCount}` : ""
            }${parsed.failures?.length ? `, failed ${parsed.failures.length}` : ""}`
      );
      currentInput = {
        ...currentInput,
        signal: parsed.signal,
        channels: parsed.channels || currentInput.channels,
        distribution: Math.max(currentInput.distribution, Math.min(10, 5 + Math.ceil(parsed.rowCount / 2)))
      };
      saveInput(currentInput);
      void runAnalysis();
    } catch (error) {
      updateImportFeedback(feedback, error instanceof Error ? error.message : ui.couldNotImportIssues);
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector<HTMLButtonElement>("[data-audit-readme]")?.addEventListener("click", () => {
    const repoUrlInput = document.querySelector<HTMLInputElement>("[name='readmeRepoUrl']");
    const input = document.querySelector<HTMLTextAreaElement>("[name='readmeAudit']");
    readmeAuditRepoUrl = repoUrlInput?.value ?? "";
    readmeAuditText = input?.value ?? "";
    readmeAuditResult = auditReadmeForStars(readmeAuditText);
    repoStarProfileResult = null;
    readmeAuditFeedback = `${readmeAuditResult.score}/100 ${readmeAuditResult.grade}`;
    render();
  });

  document.querySelector<HTMLButtonElement>("[data-fetch-readme]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const repoUrlInput = document.querySelector<HTMLInputElement>("[name='readmeRepoUrl']");
    const repoUrl = repoUrlInput?.value ?? "";

    button.disabled = true;
    readmeAuditFeedback = textForLocale(locale).fetchingReadme;
    updateReadmeAuditFeedback(readmeAuditFeedback);

    try {
      const [fetched, profile] = await Promise.all([fetchGitHubReadme(repoUrl), fetchGitHubRepoProfile(repoUrl)]);
      readmeAuditRepoUrl = fetched.reference.displayUrl;
      readmeAuditText = fetched.readme;
      readmeAuditResult = auditReadmeForStars(fetched.readme);
      repoStarProfileResult = profile;
      readmeAuditFeedback = `${fetched.reference.owner}/${fetched.reference.repo}: README ${readmeAuditResult.score}/100, profile ${profile.score}/100`;
      render();
    } catch (error) {
      readmeAuditRepoUrl = repoUrl;
      readmeAuditFeedback = error instanceof Error ? error.message : textForLocale(locale).couldNotFetchReadme;
      updateReadmeAuditFeedback(readmeAuditFeedback);
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector<HTMLButtonElement>("[data-copy-readme-audit]")?.addEventListener("click", async (event) => {
    if (!readmeAuditResult) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    await navigator.clipboard.writeText(formatReadmeStarAudit(readmeAuditResult));
    button.textContent = textForLocale(locale).copied;
    window.setTimeout(() => {
      button.textContent = textForLocale(locale).copyAudit;
    }, 1400);
  });

  document.querySelector<HTMLButtonElement>("[data-copy-repo-profile]")?.addEventListener("click", async (event) => {
    if (!repoStarProfileResult) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    await navigator.clipboard.writeText(formatGitHubRepoStarProfile(repoStarProfileResult));
    button.textContent = textForLocale(locale).copied;
    window.setTimeout(() => {
      button.textContent = textForLocale(locale).copyProfile;
    }, 1400);
  });

  document.querySelector<HTMLButtonElement>("[data-copy-star-sprint]")?.addEventListener("click", async (event) => {
    if (!readmeAuditResult) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    await navigator.clipboard.writeText(formatStarReadinessSprint(readmeAuditResult, repoStarProfileResult));
    button.textContent = textForLocale(locale).copied;
    window.setTimeout(() => {
      button.textContent = textForLocale(locale).copySprint;
    }, 1400);
  });

  document.querySelector<HTMLButtonElement>("[data-download]")?.addEventListener("click", () => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }
    downloadJson(`${selected.id}.json`, selected);
  });

  document.querySelector<HTMLButtonElement>("[data-download-card-svg]")?.addEventListener("click", () => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }
    downloadSvg(`${selected.id}-share-card.svg`, buildShareCardSvg(selected));
  });

  document.querySelector<HTMLButtonElement>("[data-download-card-png]")?.addEventListener("click", async (event) => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    const ui = textForLocale(locale);
    button.textContent = ui.rendering;
    button.disabled = true;
    try {
      const blob = await renderShareCardPngBlob(selected);
      downloadBlob(`${selected.id}-share-card.png`, blob);
      button.textContent = ui.downloaded;
    } catch {
      button.textContent = ui.pngFailed;
    } finally {
      window.setTimeout(() => {
        button.textContent = downloadLabel("card-png");
        button.disabled = false;
      }, 1400);
    }
  });

  document.querySelector<HTMLButtonElement>("[data-download-launch-brief]")?.addEventListener("click", (event) => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    button.textContent = textForLocale(locale).downloaded;
    downloadMarkdown(`${repoScaffoldRootName(selected)}-public-launch-brief.md`, buildPublicLaunchBriefMarkdown(selected));
    window.setTimeout(() => {
      button.textContent = downloadLabel("launch-brief");
    }, 1400);
  });

  document.querySelector<HTMLButtonElement>("[data-download-launch-kit]")?.addEventListener("click", (event) => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    button.textContent = textForLocale(locale).downloaded;
    downloadMarkdown(`${repoScaffoldRootName(selected)}-launch-kit.md`, buildLaunchKit(selected));
    window.setTimeout(() => {
      button.textContent = downloadLabel("launch-kit");
    }, 1400);
  });

  document.querySelector<HTMLButtonElement>("[data-download-contributor-queue]")?.addEventListener("click", (event) => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    button.textContent = textForLocale(locale).downloaded;
    downloadMarkdown(`${repoScaffoldRootName(selected)}-contributor-queue.md`, buildContributorQueueMarkdown(selected));
    window.setTimeout(() => {
      button.textContent = downloadLabel("contributor-queue");
    }, 1400);
  });

  document.querySelector<HTMLButtonElement>("[data-download-star-plan]")?.addEventListener("click", (event) => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    button.textContent = textForLocale(locale).downloaded;
    downloadMarkdown(`${repoScaffoldRootName(selected)}-star-growth-plan.md`, buildStarGrowthPlanMarkdown(selected));
    window.setTimeout(() => {
      button.textContent = downloadLabel("star-plan");
    }, 1400);
  });

  document.querySelector<HTMLButtonElement>("[data-download-repo-listing]")?.addEventListener("click", (event) => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    button.textContent = textForLocale(locale).downloaded;
    downloadMarkdown(`${repoScaffoldRootName(selected)}-repo-listing-pack.md`, buildRepoListingPackMarkdown(selected));
    window.setTimeout(() => {
      button.textContent = downloadLabel("repo-listing");
    }, 1400);
  });

  document.querySelector<HTMLButtonElement>("[data-download-scaffold]")?.addEventListener("click", (event) => {
    const selected = result?.opportunities.find((item) => item.id === selectedId);
    if (!selected) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    button.textContent = textForLocale(locale).buildingZip;
    button.disabled = true;
    downloadBlob(`${repoScaffoldRootName(selected)}.zip`, buildRepoScaffoldZipBlob(selected));
    window.setTimeout(() => {
      button.textContent = downloadLabel("repo-zip");
      button.disabled = false;
    }, 1400);
  });
}

async function runAnalysis(): Promise<void> {
  isBusy = true;
  render();
  try {
    result = applyScoringProfile(await analyzeOpportunity(currentInput, settings, locale), selectedScoringProfile());
    selectedId = result.opportunities[0]?.id ?? "";
  } catch (error) {
    result = {
      generatedBy: "local-engine",
      summary: error instanceof Error ? error.message : textForLocale(locale).modelFallback,
      opportunities: []
    };
  } finally {
    isBusy = false;
    const currentResult = result;
    if (!currentResult || currentResult.opportunities.length === 0) {
      const fallback = analyzeFallback(currentInput);
      result = currentResult
        ? applyScoringProfile({ ...currentResult, opportunities: fallback.opportunities }, selectedScoringProfile())
        : fallback;
      selectedId = result.opportunities[0]?.id ?? "";
    }
    render();
  }
}

async function loadBenchmarks(): Promise<void> {
  benchmarkStatus = "loading";

  try {
    const response = await fetch(new URL("benchmarks.json", new URL(".", window.location.href)));
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText || "request failed"}`);
    }

    benchmarks = parseBenchmarkRepos(await response.json());
    benchmarkStatus = benchmarks.length > 0 ? "ready" : "failed";
  } catch {
    benchmarks = [];
    benchmarkStatus = "failed";
  }

  render();
}

function renderResults(analysis: AnalysisResult): string {
  const selected = analysis.opportunities.find((item) => item.id === selectedId) ?? analysis.opportunities[0];

  return `
    <div class="opportunity-list">
      ${analysis.opportunities
        .map(
          (item) => `
            <button class="opportunity-card ${item.id === selected?.id ? "active" : ""}" data-select="${item.id}" type="button" tabindex="${item.id === selected?.id ? "0" : "-1"}" aria-pressed="${item.id === selected?.id ? "true" : "false"}">
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

function selectOpportunity(id: string, focusAfterRender = false): void {
  selectedId = id;
  pendingFocusId = focusAfterRender ? id : "";
  render();
}

function restorePendingFocus(): void {
  if (!pendingFocusId) {
    return;
  }

  const nextFocus = document.querySelector<HTMLButtonElement>(`[data-select="${CSS.escape(pendingFocusId)}"]`);
  pendingFocusId = "";
  nextFocus?.focus({ preventScroll: true });
}

function renderGalleryRail(): string {
  const ui = textForLocale(locale);
  const localizedSampleBriefs = sampleBriefsForLocale(locale);

  return `
    <section class="gallery-rail" aria-label="${escapeHtml(ui.opportunityGallery)}">
      <div>
        <p class="eyebrow">${escapeHtml(ui.opportunityGallery)}</p>
        <h2>${escapeHtml(ui.proofBeforeSetup)}</h2>
      </div>
      <div class="gallery-cards">
        ${localizedSampleBriefs
          .map((brief) => {
            const top = analyzeLocally(brief.input, selectedScoringProfile().weights, locale).opportunities[0];
            const shareUrl = createShareUrl(brief.input, window.location.href);
            return `
              <article class="gallery-card">
                <div>
                  <span>${top.score}/10</span>
                  <strong>${escapeHtml(brief.title)}</strong>
                </div>
                <p>${escapeHtml(top.name)} - ${escapeHtml(top.wedge)}</p>
                <div class="gallery-actions">
                  <button class="secondary-action" data-sample="${brief.id}" type="button">${escapeHtml(ui.load)}</button>
                  <a href="${escapeHtml(shareUrl)}">${escapeHtml(ui.openLink)}</a>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderOpportunityDetail(item: NonNullable<AnalysisResult["opportunities"][number]>): string {
  const ui = textForLocale(locale);

  return `
    <article class="detail-panel">
      <div class="detail-heading">
        <div>
          <p class="eyebrow">${escapeHtml(ui.selectedWedge)}</p>
          <h2>${escapeHtml(item.name)}</h2>
        </div>
        <div class="action-row">
          ${copyButton("markdown")}
          ${copyButton("show-hn")}
          ${copyButton("build-log")}
          ${copyButton("product-hunt")}
          ${copyButton("demo-script")}
          ${copyButton("x-thread")}
          ${copyButton("newsletter")}
          ${copyButton("reddit")}
          ${copyButton("github-issue")}
          ${copyButton("launch-brief")}
          ${copyButton("launch-kit")}
          ${copyButton("contributor-queue")}
          ${copyButton("star-plan")}
          ${copyButton("repo-listing")}
          ${copyButton("repo-scaffold")}
          ${downloadButton("launch-brief", "data-download-launch-brief")}
          ${downloadButton("launch-kit", "data-download-launch-kit")}
          ${downloadButton("contributor-queue", "data-download-contributor-queue")}
          ${downloadButton("star-plan", "data-download-star-plan")}
          ${downloadButton("repo-listing", "data-download-repo-listing")}
          ${downloadButton("repo-zip", "data-download-scaffold")}
          ${copyButton("share-url")}
          ${downloadButton("card-png", "data-download-card-png")}
          ${downloadButton("card-svg", "data-download-card-svg")}
          ${downloadButton("json", "data-download")}
        </div>
      </div>
      <p class="tagline">${escapeHtml(item.tagline)}</p>
      <div class="score-strip">
        ${Object.entries(item.scores)
          .map(([label, value]) => `<span><b>${value}</b>${humanize(label)}</span>`)
          .join("")}
      </div>
      ${renderScoreMath(item)}
      ${renderBenchmarkPanel(item)}
      <div class="detail-grid">
        ${detailBlock(ui.wedge, item.wedge)}
        ${detailBlock(ui.differentiator, item.differentiator)}
        ${detailBlock(ui.moat, item.moat)}
        ${listBlock(ui.firstRelease, item.firstRelease)}
        ${listBlock(ui.launchPlan, item.launchPlan)}
        ${listBlock(ui.risks, item.risks)}
      </div>
    </article>
  `;
}

function renderScoreMath(item: Opportunity): string {
  const ui = textForLocale(locale);
  const profile = selectedScoringProfile();
  const rows = Object.entries(profile.weights)
    .map(([key, weight]) => {
      const value = item.scores[key as keyof Opportunity["scores"]];
      return `
        <span>
          <b>${humanize(key)}</b>
          <em>${value} x ${Math.round(weight * 100)}%</em>
        </span>
      `;
    })
    .join("");

  return `
    <section class="score-math" aria-label="${escapeHtml(ui.scoreExplanation)}">
      <div>
        <h3>${escapeHtml(ui.scoreMath)}</h3>
        <p>${
          locale === "zh-CN"
            ? `${escapeHtml(profile.name)} 权重计算后得到 ${item.score}/10。`
            : `${escapeHtml(profile.name)} weights round to ${item.score}/10.`
        }</p>
      </div>
      <div class="score-math-grid">
        ${rows}
      </div>
    </section>
  `;
}

function renderBenchmarkPanel(item: Opportunity): string {
  const ui = textForLocale(locale);

  if (benchmarkStatus === "loading") {
    return `
      <section class="benchmark-panel" aria-label="${escapeHtml(ui.benchmarkLessons)}">
        <div class="benchmark-heading">
          <div>
            <p class="eyebrow">${escapeHtml(ui.benchmarkProof)}</p>
            <h3>${escapeHtml(ui.loadingBenchmarks)}</h3>
          </div>
          <p>${escapeHtml(ui.benchmarkLoadingNote)}</p>
        </div>
      </section>
    `;
  }

  if (benchmarkStatus === "failed") {
    return `
      <section class="benchmark-panel" aria-label="${escapeHtml(ui.benchmarkLessons)}">
        <div class="benchmark-heading">
          <div>
            <p class="eyebrow">${escapeHtml(ui.benchmarkProof)}</p>
            <h3>${escapeHtml(ui.benchmarkUnavailable)}</h3>
          </div>
          <p>${escapeHtml(ui.benchmarkUnavailableNote)}</p>
        </div>
      </section>
    `;
  }

  const cards = buildBenchmarkComparisons(item, benchmarks)
    .map(
      (comparison) => `
        <article class="benchmark-card ${comparison.alignment}">
          <div class="benchmark-card-top">
            <span>${comparison.score}/10 ${humanize(comparison.dimension)}</span>
            <a href="${escapeHtml(comparison.url)}" target="_blank" rel="noreferrer">${escapeHtml(comparison.repo)}</a>
          </div>
          <p><b>${escapeHtml(ui.publicSignal)}</b>${escapeHtml(comparison.signal)}</p>
          <p><b>${escapeHtml(ui.lesson)}</b>${escapeHtml(comparison.lesson)}</p>
          <p><b>${escapeHtml(ui.openTopUse)}</b>${escapeHtml(comparison.use)}</p>
          <a class="benchmark-source" href="${escapeHtml(comparison.sourceUrl)}" target="_blank" rel="noreferrer">
            ${escapeHtml(ui.viewEvidence)}
          </a>
        </article>
      `
    )
    .join("");

  return `
    <section class="benchmark-panel" aria-label="${escapeHtml(ui.benchmarkLessons)}">
      <div class="benchmark-heading">
        <div>
          <p class="eyebrow">${escapeHtml(ui.benchmarkProof)}</p>
          <h3>${escapeHtml(ui.publicRepoPatterns)}</h3>
        </div>
        <p>${escapeHtml(ui.benchmarkNote)}</p>
      </div>
      <div class="benchmark-grid">
        ${cards}
      </div>
    </section>
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

function copyButton(mode: string): string {
  return `<button class="secondary-action" data-copy="${mode}" type="button">${escapeHtml(copyLabel(mode))}</button>`;
}

function downloadButton(mode: string, attribute: string): string {
  return `<button class="secondary-action" ${attribute} type="button">${escapeHtml(downloadLabel(mode))}</button>`;
}

function selectedScoringProfile(): ScoringProfile {
  return getScoringProfile(selectedScoringProfileId);
}

function applyScoringProfile(analysis: AnalysisResult, profile: ScoringProfile): AnalysisResult {
  const opportunities = analysis.opportunities
    .map((item) => ({
      ...item,
      score: totalScore(item.scores, profile.weights)
    }))
    .sort((a, b) => b.score - a.score);

  return {
    ...analysis,
    opportunities
  };
}

function labelForProvider(provider: ProviderSettings["provider"]): string {
  return textForLocale(locale).providerLabels[provider];
}

function labelForTrendImport(format: "csv" | "notes" | "github-issues" | "links"): string {
  return textForLocale(locale).trendLabels[format];
}

function parseBenchmarkRepos(value: unknown): BenchmarkRepo[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): BenchmarkRepo[] => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const dimension = record.dimension;
    const repo = readBenchmarkText(record.repo);
    const url = readGitHubUrl(record.url);
    const sourceUrl = readGitHubUrl(record.sourceUrl);
    const publicSignal = readBenchmarkText(record.publicSignal);
    const lesson = readBenchmarkText(record.lesson);
    const openTopUse = readBenchmarkText(record.openTopUse);

    if (!isBenchmarkDimension(dimension) || !repo || !url || !sourceUrl || !publicSignal || !lesson || !openTopUse) {
      return [];
    }

    return [
      {
        repo,
        url,
        sourceUrl,
        dimension,
        publicSignal,
        lesson,
        openTopUse
      }
    ];
  });
}

function isBenchmarkDimension(value: unknown): value is BenchmarkDimension {
  return typeof value === "string" && benchmarkDimensions.has(value as BenchmarkDimension);
}

function readBenchmarkText(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 640) : "";
}

function readGitHubUrl(value: unknown): string {
  const text = readBenchmarkText(value);
  return text.startsWith("https://github.com/") ? text : "";
}

function updateImportFeedback(element: HTMLSpanElement | null, message: string): void {
  importFeedback = message;
  if (element) {
    element.textContent = message;
  }
}

function updateReadmeAuditFeedback(message: string): void {
  readmeAuditFeedback = message;
  const element = document.querySelector<HTMLSpanElement>("[data-readme-audit-feedback]");
  if (element) {
    element.textContent = message;
  }
}

function humanize(value: string): string {
  const ui = textForLocale(locale);
  if (value in ui.dimensionLabels) {
    return ui.dimensionLabels[value as keyof typeof ui.dimensionLabels];
  }

  return value.replace(/[A-Z]/g, (letter) => ` ${letter}`).toLowerCase();
}

function copyPayload(mode: string | undefined, item: AnalysisResult["opportunities"][number]): string {
  if (mode === "show-hn") {
    return buildShowHnPost(item);
  }
  if (mode === "product-hunt") {
    return buildProductHuntLaunchDraft(item);
  }
  if (mode === "build-log") {
    return buildBuildLogPost(item);
  }
  if (mode === "newsletter") {
    return buildNewsletterPitch(item);
  }
  if (mode === "demo-script") {
    return buildDemoRecordingScript(item);
  }
  if (mode === "github-issue") {
    return buildGitHubIssueBody(item);
  }
  if (mode === "launch-brief") {
    return buildPublicLaunchBriefMarkdown(item);
  }
  if (mode === "launch-kit") {
    return buildLaunchKit(item);
  }
  if (mode === "contributor-queue") {
    return buildContributorQueueMarkdown(item);
  }
  if (mode === "star-plan") {
    return buildStarGrowthPlanMarkdown(item);
  }
  if (mode === "repo-listing") {
    return buildRepoListingPackMarkdown(item);
  }
  if (mode === "x-thread") {
    return buildXThread(item);
  }
  if (mode === "reddit") {
    return buildRedditPost(item);
  }
  if (mode === "repo-scaffold") {
    return buildRepoScaffoldPlan(item);
  }
  if (mode === "share-url") {
    return createShareUrl(currentInput, window.location.href);
  }
  return buildReadmeBrief(item.name, item);
}

function copyLabel(mode: string | undefined): string {
  return textForLocale(locale).copyLabels[mode ?? "markdown"] ?? textForLocale(locale).copyLabels.markdown;
}

function downloadLabel(mode: string): string {
  if (locale === "zh-CN") {
    const labels: Record<string, string> = {
      "launch-brief": "下载发布简报",
      "launch-kit": "下载 Launch Kit",
      "contributor-queue": "下载贡献任务",
      "star-plan": "下载 Star 增长计划",
      "repo-listing": "下载仓库 Profile",
      "repo-zip": "下载仓库 ZIP",
      "card-png": "下载 PNG",
      "card-svg": "下载 SVG",
      json: "下载 JSON"
    };
    return labels[mode] ?? "下载";
  }

  const labels: Record<string, string> = {
    "launch-brief": "Download Launch Brief",
    "launch-kit": "Download Launch Kit",
    "contributor-queue": "Download Contributor Queue",
    "star-plan": "Download Star Plan",
    "repo-listing": "Download Repo Listing",
    "repo-zip": "Download Repo ZIP",
    "card-png": "Download PNG",
    "card-svg": "Download SVG",
    json: "Download JSON"
  };
  return labels[mode] ?? "Download";
}

function downloadJson(filename: string, item: AnalysisResult["opportunities"][number]): void {
  const blob = new Blob([JSON.stringify(buildOpportunityJsonExport(item, selectedScoringProfile()), null, 2)], {
    type: "application/json"
  });
  downloadBlob(filename, blob);
}

function downloadSvg(filename: string, svg: string): void {
  downloadBlob(filename, new Blob([svg], { type: "image/svg+xml" }));
}

function downloadMarkdown(filename: string, markdown: string): void {
  downloadBlob(filename, new Blob([markdown], { type: "text/markdown" }));
}

function downloadBlob(filename: string, blob: Blob): void {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function analyzeFallback(input: OpportunityInput): AnalysisResult {
  return analyzeLocally(input, selectedScoringProfile().weights, locale);
}

function isDefaultLocaleInput(input: OpportunityInput, inputLocale: AppLocale): boolean {
  return JSON.stringify(input) === JSON.stringify(defaultInputForLocale(inputLocale));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
