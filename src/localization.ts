import type { OpportunityInput, ProviderSettings } from "./domain";

export type AppLocale = "en" | "zh-CN";

export const defaultLocale: AppLocale = "en";

export const localeOptions: Array<{ value: AppLocale; label: string }> = [
  { value: "en", label: "English" },
  { value: "zh-CN", label: "简体中文" }
];

export function normalizeLocale(value: unknown): AppLocale {
  return typeof value === "string" && value.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

export function detectDefaultLocale(languages: readonly string[] | undefined): AppLocale {
  return languages?.some((language) => language.toLowerCase().startsWith("zh")) ? "zh-CN" : defaultLocale;
}

export const localizedDefaultInputs: Record<AppLocale, OpportunityInput> = {
  en: {
    audience: "solo developers, AI engineers, and open-source maintainers",
    signal:
      "Developers are overwhelmed by fast-moving AI APIs, agent frameworks, and local model tooling. They want smaller tools that help them decide what to build, ship fast, and explain the project clearly.",
    constraints:
      "Must be TypeScript-first, runnable locally, useful without a paid API key, and easy to publish on GitHub.",
    channels:
      "GitHub, Hacker News, Product Hunt, Reddit r/LocalLLaMA, X/Twitter demos, developer newsletters",
    pain: 8,
    urgency: 7,
    distribution: 8
  },
  "zh-CN": {
    audience: "独立开发者、AI 工程师和开源维护者",
    signal:
      "AI API、Agent 框架和本地模型工具变化太快，开发者很难判断哪个应用想法值得先做。他们需要一个小工具，把趋势、issue 和调研笔记整理成可比较的开源项目方案。",
    constraints: "必须使用 TypeScript，能本地运行，不依赖付费 API Key，适合发布到 GitHub。",
    channels: "GitHub、Hacker News、Product Hunt、Reddit r/LocalLLaMA、中文开发者社区、技术 newsletter",
    pain: 8,
    urgency: 7,
    distribution: 8
  }
};

export function defaultInputForLocale(locale: AppLocale): OpportunityInput {
  return localizedDefaultInputs[locale];
}

export interface AppText {
  appTitle: string;
  workspaceAria: string;
  currentInferenceMode: string;
  language: string;
  tryBrief: string;
  importSignals: string;
  trendSignalsLabel: string;
  trendSignalsPlaceholder: string;
  useSignals: string;
  readmeAudit: string;
  githubRepositoryUrl: string;
  pasteOrFetchReadme: string;
  fetchReadme: string;
  auditReadme: string;
  copyAudit: string;
  copySprint: string;
  copyProfile: string;
  noCriticalGaps: string;
  checks: string;
  topFixes: string;
  profileFixes: string;
  scoringTemplates: string;
  audience: string;
  signalBrief: string;
  constraints: string;
  launchChannels: string;
  pain: string;
  urgency: string;
  distribution: string;
  analyze: string;
  analyzing: string;
  modelSettings: string;
  provider: string;
  endpoint: string;
  apiKey: string;
  model: string;
  saveSettings: string;
  warmingUp: string;
  preparingMap: string;
  opportunityGallery: string;
  proofBeforeSetup: string;
  load: string;
  openLink: string;
  selectedWedge: string;
  scoreExplanation: string;
  scoreMath: string;
  benchmarkLessons: string;
  benchmarkProof: string;
  loadingBenchmarks: string;
  benchmarkLoadingNote: string;
  benchmarkUnavailable: string;
  benchmarkUnavailableNote: string;
  publicSignal: string;
  lesson: string;
  openTopUse: string;
  viewEvidence: string;
  publicRepoPatterns: string;
  benchmarkNote: string;
  wedge: string;
  differentiator: string;
  moat: string;
  firstRelease: string;
  launchPlan: string;
  risks: string;
  copied: string;
  downloaded: string;
  rendering: string;
  pngFailed: string;
  buildingZip: string;
  noUsableSignals: string;
  couldNotImportIssues: string;
  fetchingReadme: string;
  couldNotFetchReadme: string;
  modelFallback: string;
  providerLabels: Record<ProviderSettings["provider"], string>;
  trendLabels: Record<"csv" | "notes" | "github-issues" | "links", string>;
  dimensionLabels: Record<"pain" | "urgency" | "distribution" | "buildability" | "starPotential", string>;
  copyLabels: Record<string, string>;
}

export const appTexts: Record<AppLocale, AppText> = {
  en: {
    appTitle: "AI Opportunity Radar",
    workspaceAria: "OpenTop workspace",
    currentInferenceMode: "Current inference mode",
    language: "Language",
    tryBrief: "Try a brief",
    importSignals: "Import Trend Signals",
    trendSignalsLabel: "Paste CSV, bullets, notes, bookmark links, or GitHub issue URLs",
    trendSignalsPlaceholder:
      "Local-first AI debugging https://news.ycombinator.com/item?id=4242\n<A HREF=\"https://github.com/example/repo\">Agent debugging toolkit</A>\n- Reddit: Local model setup is still painful",
    useSignals: "Use Signals",
    readmeAudit: "README Star Audit",
    githubRepositoryUrl: "GitHub repository URL",
    pasteOrFetchReadme: "Paste or fetch a project README",
    fetchReadme: "Fetch README",
    auditReadme: "Audit README",
    copyAudit: "Copy Audit",
    copySprint: "Copy 7-Day Sprint",
    copyProfile: "Copy Profile",
    noCriticalGaps: "No critical gaps found. Keep screenshots, examples, and demo links current.",
    checks: "checks",
    topFixes: "Top fixes",
    profileFixes: "Profile fixes",
    scoringTemplates: "Scoring templates",
    audience: "Audience",
    signalBrief: "Signal Brief",
    constraints: "Constraints",
    launchChannels: "Launch Channels",
    pain: "Pain",
    urgency: "Urgency",
    distribution: "Distribution",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    modelSettings: "Model Settings",
    provider: "Provider",
    endpoint: "Endpoint",
    apiKey: "API Key",
    model: "Model",
    saveSettings: "Save Settings",
    warmingUp: "warming-up",
    preparingMap: "Reading the signal brief and preparing the first opportunity map.",
    opportunityGallery: "Opportunity gallery",
    proofBeforeSetup: "Proof before setup",
    load: "Load",
    openLink: "Open link",
    selectedWedge: "Selected wedge",
    scoreExplanation: "Score explanation",
    scoreMath: "Score math",
    benchmarkLessons: "Benchmark lessons",
    benchmarkProof: "Benchmark proof",
    loadingBenchmarks: "Loading public repo lessons...",
    benchmarkLoadingNote: "Lessons load from the committed public benchmark JSON.",
    benchmarkUnavailable: "Benchmark lessons unavailable",
    benchmarkUnavailableNote: "Could not load public benchmark examples from benchmarks.json.",
    publicSignal: "Public signal",
    lesson: "Lesson",
    openTopUse: "OpenTop use",
    viewEvidence: "View evidence",
    publicRepoPatterns: "Patterns from public AI repos",
    benchmarkNote: "Each benchmark maps to one OpenTop score dimension. No star counts or private metrics are used.",
    wedge: "Wedge",
    differentiator: "Differentiator",
    moat: "Moat",
    firstRelease: "First Release",
    launchPlan: "Launch Plan",
    risks: "Risks",
    copied: "Copied",
    downloaded: "Downloaded",
    rendering: "Rendering...",
    pngFailed: "PNG failed",
    buildingZip: "Building ZIP...",
    noUsableSignals: "No usable signals found",
    couldNotImportIssues: "Could not import GitHub issues",
    fetchingReadme: "Fetching README...",
    couldNotFetchReadme: "Could not fetch README",
    modelFallback: "Model request failed. Falling back to local analysis.",
    providerLabels: {
      demo: "Demo engine",
      "openai-compatible": "API ready",
      ollama: "Ollama ready",
      anthropic: "Anthropic ready",
      "anthropic-bedrock": "Bedrock ready",
      "anthropic-vertex": "Vertex ready"
    },
    trendLabels: {
      csv: "CSV rows",
      notes: "notes",
      "github-issues": "GitHub issues",
      links: "links"
    },
    dimensionLabels: {
      pain: "pain",
      urgency: "urgency",
      distribution: "distribution",
      buildability: "buildability",
      starPotential: "star potential"
    },
    copyLabels: {
      "show-hn": "Copy Show HN",
      "product-hunt": "Copy Product Hunt",
      "build-log": "Copy Build Log",
      newsletter: "Copy Newsletter",
      "demo-script": "Copy Demo Script",
      "github-issue": "Copy GitHub Issue",
      "launch-brief": "Copy Launch Brief",
      "launch-kit": "Copy Launch Kit",
      "contributor-queue": "Copy Contributor Queue",
      "star-plan": "Copy Star Plan",
      "repo-listing": "Copy Repo Listing",
      "x-thread": "Copy X Thread",
      reddit: "Copy Reddit",
      "repo-scaffold": "Copy Repo Plan",
      "share-url": "Copy Share Link",
      markdown: "Copy README Brief"
    }
  },
  "zh-CN": {
    appTitle: "AI 应用选题雷达",
    workspaceAria: "OpenTop 工作台",
    currentInferenceMode: "当前推理模式",
    language: "语言",
    tryBrief: "试用示例简报",
    importSignals: "导入趋势信号",
    trendSignalsLabel: "粘贴 CSV、要点、调研笔记、书签链接或 GitHub issue URL",
    trendSignalsPlaceholder:
      "本地优先 AI 调试 https://news.ycombinator.com/item?id=4242\n<A HREF=\"https://github.com/example/repo\">Agent 调试工具</A>\n- 中文社区：本地模型配置仍然很痛苦",
    useSignals: "使用这些信号",
    readmeAudit: "README Star 审计",
    githubRepositoryUrl: "GitHub 仓库 URL",
    pasteOrFetchReadme: "粘贴或抓取项目 README",
    fetchReadme: "抓取 README",
    auditReadme: "审计 README",
    copyAudit: "复制审计结果",
    copySprint: "复制 7 天冲刺",
    copyProfile: "复制仓库 Profile",
    noCriticalGaps: "没有发现关键缺口。继续保持截图、示例和 demo 链接可用。",
    checks: "项检查",
    topFixes: "优先修复",
    profileFixes: "Profile 修复",
    scoringTemplates: "评分模板",
    audience: "目标用户",
    signalBrief: "信号简报",
    constraints: "约束条件",
    launchChannels: "发布渠道",
    pain: "痛点",
    urgency: "紧迫性",
    distribution: "分发",
    analyze: "分析机会",
    analyzing: "分析中...",
    modelSettings: "模型设置",
    provider: "Provider",
    endpoint: "Endpoint",
    apiKey: "API Key",
    model: "模型",
    saveSettings: "保存设置",
    warmingUp: "准备中",
    preparingMap: "正在读取信号简报，并准备第一版机会地图。",
    opportunityGallery: "机会图库",
    proofBeforeSetup: "先看证明，再配置环境",
    load: "载入",
    openLink: "打开链接",
    selectedWedge: "当前切入点",
    scoreExplanation: "评分解释",
    scoreMath: "评分计算",
    benchmarkLessons: "基准案例",
    benchmarkProof: "基准证明",
    loadingBenchmarks: "正在加载公开仓库案例...",
    benchmarkLoadingNote: "案例来自仓库中提交的公开 benchmark JSON。",
    benchmarkUnavailable: "基准案例暂不可用",
    benchmarkUnavailableNote: "无法从 benchmarks.json 加载公开 benchmark 示例。",
    publicSignal: "公开信号",
    lesson: "经验",
    openTopUse: "OpenTop 用法",
    viewEvidence: "查看证据",
    publicRepoPatterns: "公开 AI 仓库里的模式",
    benchmarkNote: "每个 benchmark 都映射到一个 OpenTop 评分维度，不使用 star 数或私有指标。",
    wedge: "切入点",
    differentiator: "差异化",
    moat: "护城河",
    firstRelease: "第一版范围",
    launchPlan: "发布计划",
    risks: "风险",
    copied: "已复制",
    downloaded: "已下载",
    rendering: "正在渲染...",
    pngFailed: "PNG 失败",
    buildingZip: "正在生成 ZIP...",
    noUsableSignals: "没有找到可用信号",
    couldNotImportIssues: "无法导入 GitHub issue",
    fetchingReadme: "正在抓取 README...",
    couldNotFetchReadme: "无法抓取 README",
    modelFallback: "模型请求失败，已回退到本地分析。",
    providerLabels: {
      demo: "本地演示引擎",
      "openai-compatible": "API 可用",
      ollama: "Ollama 可用",
      anthropic: "Anthropic 可用",
      "anthropic-bedrock": "Bedrock 可用",
      "anthropic-vertex": "Vertex 可用"
    },
    trendLabels: {
      csv: "CSV 行",
      notes: "笔记",
      "github-issues": "GitHub issue",
      links: "链接"
    },
    dimensionLabels: {
      pain: "痛点",
      urgency: "紧迫性",
      distribution: "分发",
      buildability: "可构建性",
      starPotential: "Star 潜力"
    },
    copyLabels: {
      "show-hn": "复制 Show HN",
      "product-hunt": "复制 Product Hunt",
      "build-log": "复制构建日志",
      newsletter: "复制 Newsletter",
      "demo-script": "复制 Demo 脚本",
      "github-issue": "复制 GitHub Issue",
      "launch-brief": "复制发布简报",
      "launch-kit": "复制 Launch Kit",
      "contributor-queue": "复制贡献任务",
      "star-plan": "复制 Star 增长计划",
      "repo-listing": "复制仓库 Profile",
      "x-thread": "复制 X Thread",
      reddit: "复制 Reddit",
      "repo-scaffold": "复制仓库计划",
      "share-url": "复制分享链接",
      markdown: "复制 README 简报"
    }
  }
};

export function textForLocale(locale: AppLocale): AppText {
  return appTexts[locale];
}
