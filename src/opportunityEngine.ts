import type { AnalysisResult, Opportunity, OpportunityInput } from "./domain";
import type { AppLocale } from "./localization";
import { defaultScoringProfile, type ScoreWeights } from "./scoringProfiles.ts";

const productNouns = [
  "Radar",
  "Workbench",
  "Scout",
  "Foundry",
  "Console",
  "Briefing",
  "Studio",
  "Navigator"
];

const wedges = [
  "turns scattered trend notes into ranked product bets",
  "converts a messy launch idea into an issue-by-issue open-source roadmap",
  "compares model, API, and local-first implementation paths before code is written",
  "generates a public README, demo script, and launch checklist from one product brief",
  "scores ideas by pain, urgency, distribution, buildability, and star potential"
];

const differentiators = [
  "local-first demo mode plus optional OpenAI-compatible and Ollama adapters",
  "opinionated GitHub-readiness scoring instead of generic brainstorm output",
  "launch artifacts that are immediately copyable into issues, README sections, and demos",
  "transparent scoring so users can challenge the ranking instead of trusting a black box",
  "designed for builders who need one sharp wedge, not a list of vague startup ideas"
];

const releaseItems = [
  "Signal intake with audience, trend, constraints, and channel context",
  "Opportunity scoring matrix with editable assumptions",
  "README hook and launch-plan generator",
  "Provider switcher for demo, OpenAI-compatible APIs, and Ollama",
  "Exportable Markdown brief for GitHub issues and Product Hunt drafts"
];

const localizedTerms: Record<
  AppLocale,
  {
    productNouns: string[];
    wedges: string[];
    differentiators: string[];
    releaseItems: string[];
    launchPlan: string[];
    risks: string[];
  }
> = {
  en: {
    productNouns,
    wedges,
    differentiators,
    releaseItems,
    launchPlan: [
      "Ship a polished 90-second screen recording and a no-login hosted demo.",
      "Open 5 starter issues labeled good-first-opportunity so contributors can extend templates.",
      "Publish a transparent build log explaining why this idea scored well.",
      "Post before/after examples that turn vague AI trends into concrete repos."
    ],
    risks: [
      "Generic output if the input signal is too broad.",
      "Users may expect business validation beyond a launch-readiness score.",
      "Real model calls need clear privacy expectations for pasted research notes."
    ]
  },
  "zh-CN": {
    productNouns: ["雷达", "工作台", "侦察器", "工坊", "控制台", "简报台", "实验室", "导航器"],
    wedges: [
      "把零散趋势笔记整理成可排序的产品机会",
      "把模糊发布想法拆成 issue 级别的开源路线图",
      "在写代码前比较模型、API 和本地优先实现路径",
      "从一份产品简报生成公开 README、demo 脚本和发布清单",
      "按痛点、紧迫性、分发、可构建性和 Star 潜力给想法打分"
    ],
    differentiators: [
      "本地演示模式加可选 OpenAI 兼容接口和 Ollama 适配",
      "用面向 GitHub 发布的评分替代泛泛的头脑风暴输出",
      "发布素材可以直接复制到 issue、README 和 demo 文案里",
      "评分过程透明，用户可以质疑排名而不是盲信黑盒",
      "为需要一个清晰切入点的开发者设计，而不是生成一堆模糊创业点子"
    ],
    releaseItems: [
      "输入目标用户、趋势、约束和渠道上下文",
      "用可编辑假设展示机会评分矩阵",
      "生成 README hook 和发布计划",
      "支持本地 demo、OpenAI 兼容 API 和 Ollama 的 Provider 切换",
      "导出可用于 GitHub issue 和 Product Hunt 草稿的 Markdown 简报"
    ],
    launchPlan: [
      "发布一个打磨过的 90 秒录屏和无需登录的在线 demo。",
      "开放 5 个 good-first-opportunity 新手 issue，方便贡献者扩展模板。",
      "发布透明构建日志，解释为什么这个想法得分高。",
      "发布前后对比示例，把模糊 AI 趋势变成具体仓库。"
    ],
    risks: [
      "如果输入信号过宽，输出可能变得泛泛。",
      "用户可能期待超出发布就绪评分之外的商业验证。",
      "真实模型调用需要清晰说明粘贴调研笔记时的隐私预期。"
    ]
  }
};

export const scoreWeights = defaultScoringProfile.weights;

function clampScore(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function keywords(text: string, locale: AppLocale): string[] {
  const pattern = locale === "zh-CN" ? /[\u4e00-\u9fff]{2,8}|[a-z0-9-]{5,}/gi : /[a-z0-9-]{5,}/gi;
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .match(pattern)
        ?.map((word) => word.trim())
        .filter((word) => (locale === "zh-CN" ? word.length >= 2 : word.length > 4))
        .filter((word) => !["there", "their", "about", "would", "could", "should"].includes(word)) ?? []
    )
  ).slice(0, 12);
}

function scoreOpportunity(input: OpportunityInput, index: number): Opportunity["scores"] {
  const buildabilityBase = input.constraints.toLowerCase().includes("local") ? 8 : 6;
  const starPotentialBase = input.channels.toLowerCase().includes("github") ? 8 : 6;

  return {
    pain: clampScore(input.pain + (index % 2) - 1),
    urgency: clampScore(input.urgency + (index % 3) - 1),
    distribution: clampScore(input.distribution + (index % 2)),
    buildability: clampScore(buildabilityBase + (index === 0 ? 1 : 0) - Math.floor(index / 3)),
    starPotential: clampScore(starPotentialBase + (index === 1 ? 1 : 0) - Math.floor(index / 4))
  };
}

export function totalScore(scores: Opportunity["scores"], weights: ScoreWeights = scoreWeights): number {
  return Math.round(
    Object.entries(weights).reduce(
      (total, [key, weight]) => total + scores[key as keyof Opportunity["scores"]] * weight,
      0
    )
  );
}

export function analyzeLocally(
  input: OpportunityInput,
  weights: ScoreWeights = scoreWeights,
  locale: AppLocale = "en"
): AnalysisResult {
  const terms = keywords(`${input.audience} ${input.signal} ${input.constraints}`, locale);
  const anchor = terms[0] ?? "ai";
  const audience = input.audience.trim() || (locale === "zh-CN" ? "AI 开发者" : "AI builders");
  const text = localizedTerms[locale];

  const opportunities: Opportunity[] = text.productNouns.slice(0, 5).map((noun, index) => {
    const name = locale === "zh-CN" ? `${formatChineseAnchor(anchor)}${noun}` : `${capitalize(anchor)} ${noun}`;
    const id =
      locale === "zh-CN" ? `${slugAnchor(anchor) || "ai"}-${index + 1}` : `${anchor}-${noun.toLowerCase()}`;
    const scores = scoreOpportunity(input, index);
    const score = totalScore(scores, weights);

    return {
      id,
      name,
      tagline:
        locale === "zh-CN"
          ? `${name}帮助${audience}在写代码前选出更清晰的 AI 产品切入点。`
          : `${name} helps ${audience} choose a sharper AI product wedge before they start building.`,
      targetUser: audience,
      wedge: text.wedges[index % text.wedges.length],
      differentiator: text.differentiators[index % text.differentiators.length],
      moat:
        locale === "zh-CN"
          ? index % 2 === 0
            ? "不断增长的公开评分简报会沉淀成可复用 benchmark。"
            : "工作流把市场信号、实现范围和发布素材连接在一个地方。"
          : index % 2 === 0
            ? "A growing public library of scored launch briefs compounds into a reusable benchmark."
            : "The workflow connects market signal, implementation scope, and launch assets in one place.",
      score,
      scores,
      firstRelease: rotate(text.releaseItems, index).slice(0, 3),
      launchPlan: text.launchPlan,
      repoHook:
        locale === "zh-CN"
          ? `${name}：把趋势噪音转成可排序、可发布到 GitHub 的 AI 应用方案。`
          : `${name}: an AI opportunity radar that turns trend noise into ranked, GitHub-ready app ideas.`,
      risks: text.risks
    };
  });

  opportunities.sort((a, b) => b.score - a.score);

  return {
    summary:
      locale === "zh-CN"
        ? `从 ${terms.length} 个信号关键词里找到 ${opportunities.length} 个可发布的 AI 应用方向。最高分方向同时具备清晰痛点、快速分发路径和较小的 TypeScript 首版范围。`
        : `Found ${opportunities.length} launchable AI app directions from ${terms.length} extracted signal terms. The top idea balances visible pain, fast distribution loops, and a small TypeScript-first build surface.`,
    opportunities,
    generatedBy: "local-engine"
  };
}

function rotate<T>(items: T[], amount: number): T[] {
  return [...items.slice(amount), ...items.slice(0, amount)];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatChineseAnchor(value: string): string {
  const trimmed = value.replace(/[^\u4e00-\u9fffa-z0-9-]/gi, "").slice(0, 10);
  return trimmed || "AI";
}

function slugAnchor(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}
