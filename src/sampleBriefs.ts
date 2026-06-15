import type { OpportunityInput } from "./domain";
import type { AppLocale } from "./localization";

export interface SampleBrief {
  id: string;
  title: string;
  input: OpportunityInput;
}

export const sampleBriefs: SampleBrief[] = [
  {
    id: "local-model-debugger",
    title: "Local model debugger",
    input: {
      audience: "developers building with Ollama, llama.cpp, and local model wrappers",
      signal:
        "Local AI stacks are powerful but difficult to debug. Developers need a small tool that captures prompt, model, parameters, latency, and output drift.",
      constraints: "TypeScript, local-first, no cloud account, browser UI, exportable runs",
      channels: "GitHub, Reddit r/LocalLLaMA, Hacker News, Discord communities",
      pain: 9,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "agent-trace-notebook",
    title: "Agent trace notebook",
    input: {
      audience: "developers building AI agents and workflow automations",
      signal:
        "Agent failures are hard to explain because tool calls, intermediate state, retries, and model outputs are scattered across logs.",
      constraints: "TypeScript, file-based storage, Markdown export, works with any framework",
      channels: "GitHub, AI engineering newsletters, X/Twitter demos, framework Discords",
      pain: 8,
      urgency: 9,
      distribution: 7
    }
  },
  {
    id: "prompt-regression-lab",
    title: "Prompt regression lab",
    input: {
      audience: "product engineers shipping LLM features",
      signal:
        "Teams change prompts often but lack lightweight regression checks for important user scenarios, tone, refusal behavior, and JSON shape.",
      constraints: "TypeScript, CLI plus web UI, supports OpenAI-compatible APIs and local mock mode",
      channels: "GitHub, DevTools communities, Product Hunt, engineering blogs",
      pain: 8,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "readme-positioning-assistant",
    title: "README positioning assistant",
    input: {
      audience: "open-source maintainers launching developer tools",
      signal:
        "Useful repositories get ignored when the README fails to explain the wedge, install path, screenshot, and first successful outcome in the first screen.",
      constraints: "TypeScript, no backend, paste existing README, export patch suggestions",
      channels: "GitHub, Hacker News, maintainer communities, launch newsletters",
      pain: 7,
      urgency: 7,
      distribution: 9
    }
  },
  {
    id: "rag-fixture-builder",
    title: "RAG fixture builder",
    input: {
      audience: "engineers building retrieval-augmented generation features for support, docs, and internal knowledge bases",
      signal:
        "Teams ship RAG prototypes quickly but struggle to create repeatable fixtures that catch retrieval drift, citation mistakes, stale chunks, and prompt changes before customers notice.",
      constraints: "TypeScript, local document fixtures, works with any vector database, exports JSONL test cases",
      channels: "GitHub, LangChain and LlamaIndex communities, AI engineering newsletters, DevTools Slack groups",
      pain: 9,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "llm-cost-watch",
    title: "LLM cost watch",
    input: {
      audience: "startup engineers and maintainers running OpenAI-compatible, Anthropic, and local model workloads",
      signal:
        "Small teams lose track of token spend, latency, fallback behavior, and provider mix across AI features because logs are fragmented and dashboards are too heavyweight.",
      constraints: "TypeScript, browser dashboard, CSV import, no hosted backend, redacts prompts by default",
      channels: "GitHub, SaaS engineering blogs, Hacker News, FinOps communities, X/Twitter demos",
      pain: 8,
      urgency: 9,
      distribution: 8
    }
  },
  {
    id: "provider-migration-copilot",
    title: "Provider migration copilot",
    input: {
      audience: "developers moving AI apps between OpenAI-compatible APIs, Anthropic, Ollama, OpenRouter, and cloud gateways",
      signal:
        "AI teams need to switch providers for cost, latency, compliance, or model quality, but each migration breaks request shapes, streaming behavior, JSON mode, tool calls, and eval baselines.",
      constraints: "TypeScript, adapter checklist, request diff viewer, no secrets stored, generates migration issues",
      channels: "GitHub, provider Discords, AI SDK communities, Reddit r/LocalLLaMA, developer newsletters",
      pain: 8,
      urgency: 8,
      distribution: 9
    }
  },
  {
    id: "agent-permission-simulator",
    title: "Agent permission simulator",
    input: {
      audience: "developers adding tool-using agents to internal apps, CLIs, and developer workflows",
      signal:
        "Agent products need clear permission boundaries, but teams often discover risky file, shell, browser, or API actions only after a bad tool call reaches production.",
      constraints: "TypeScript, local-only policy simulator, scenario fixtures, Markdown reports, no live destructive actions",
      channels: "GitHub, security engineering communities, AI agent newsletters, Hacker News, framework Discords",
      pain: 9,
      urgency: 8,
      distribution: 7
    }
  },
  {
    id: "eval-report-publisher",
    title: "Eval report publisher",
    input: {
      audience: "AI product teams that run prompt, model, or agent evaluations but struggle to communicate results",
      signal:
        "Evaluation runs often stay trapped in notebooks or vendor dashboards. Teams need a lightweight way to turn eval outputs into readable changelogs, scorecards, and GitHub-ready release notes.",
      constraints: "TypeScript, imports JSON/CSV eval runs, static HTML export, share cards, works without a model API",
      channels: "GitHub, Product Hunt, AI engineering blogs, DevTools communities, maintainer newsletters",
      pain: 7,
      urgency: 8,
      distribution: 9
    }
  },
  {
    id: "agent-memory-inspector",
    title: "Agent memory inspector",
    input: {
      audience: "developers shipping long-running agents with vector memory, summaries, and user-specific context",
      signal:
        "Agent memory failures are subtle: stale facts, over-retained private data, duplicate memories, and missing citations often surface only after users complain.",
      constraints: "TypeScript, local-first inspection UI, imports JSON logs, redacts sensitive values, exports reproducible memory bug reports",
      channels: "GitHub, AI agent communities, security engineering newsletters, Hacker News, framework Discords",
      pain: 9,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "local-vector-index-doctor",
    title: "Local vector index doctor",
    input: {
      audience: "engineers running local RAG prototypes with SQLite, LanceDB, Chroma, or file-backed vector indexes",
      signal:
        "Local retrieval demos often decay when chunks change, embeddings are regenerated, filters break, or index files drift from the source documents.",
      constraints: "TypeScript, no hosted backend, scans local index metadata, compares source files, writes repair checklists",
      channels: "GitHub, Reddit r/LocalLLaMA, LangChain communities, docs engineering forums, DevTools newsletters",
      pain: 8,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "model-routing-playground",
    title: "Model routing playground",
    input: {
      audience: "developers deciding when to route requests between cheap, fast, local, and high-quality models",
      signal:
        "Teams want smaller model bills without degrading user-visible answers, but routing experiments are scattered across spreadsheets, logs, and provider dashboards.",
      constraints: "TypeScript, local demo mode, imports request samples, compares latency/cost/quality notes, no secrets in exports",
      channels: "GitHub, SaaS engineering blogs, AI infrastructure newsletters, FinOps communities, X/Twitter demos",
      pain: 8,
      urgency: 9,
      distribution: 8
    }
  },
  {
    id: "ai-release-risk-reviewer",
    title: "AI release risk reviewer",
    input: {
      audience: "engineering teams preparing releases that change prompts, models, retrieval data, or agent tools",
      signal:
        "AI releases fail in ways normal changelogs miss: prompt regressions, changed refusal behavior, broken JSON contracts, and new tool permissions.",
      constraints: "TypeScript, imports release notes and eval summaries, produces GitHub checklist, works without model API",
      channels: "GitHub, DevOps communities, AI engineering newsletters, internal platform teams, Hacker News",
      pain: 8,
      urgency: 8,
      distribution: 7
    }
  },
  {
    id: "support-thread-signal-miner",
    title: "Support thread signal miner",
    input: {
      audience: "founders and maintainers turning support tickets, Discord threads, and GitHub discussions into AI product ideas",
      signal:
        "Useful product signals are buried in repeated setup questions, confusing errors, integration requests, and workaround threads across support channels.",
      constraints: "TypeScript, paste-only import, local clustering, no customer data upload, exports opportunity briefs and starter issues",
      channels: "GitHub, founder communities, support engineering blogs, Product Hunt, developer newsletters",
      pain: 8,
      urgency: 7,
      distribution: 9
    }
  },
  {
    id: "mcp-server-contract-tester",
    title: "MCP server contract tester",
    input: {
      audience: "developers exposing internal tools, data sources, and automation APIs through MCP servers",
      signal:
        "MCP servers are easy to prototype but hard to trust because schema drift, auth assumptions, tool side effects, and model-facing descriptions often break after small changes.",
      constraints: "TypeScript, local test harness, records tool schemas, mocks dangerous calls, exports GitHub-ready regression reports",
      channels: "GitHub, MCP communities, AI agent newsletters, DevTools blogs, Hacker News",
      pain: 9,
      urgency: 8,
      distribution: 8
    }
  },
  {
    id: "ai-coding-agent-pr-triage",
    title: "AI coding agent PR triage",
    input: {
      audience: "open-source maintainers receiving AI-generated pull requests, issue fixes, and automated refactors",
      signal:
        "Maintainers need a fast way to separate useful AI-generated contributions from risky churn, missing tests, broad rewrites, and changes that ignore project conventions.",
      constraints: "TypeScript, GitHub issue and diff import, local scoring, no repository write access, exports review checklists",
      channels: "GitHub, maintainer communities, AI coding newsletters, DevTools forums, Hacker News",
      pain: 8,
      urgency: 8,
      distribution: 9
    }
  }
];

const sampleBriefsZhCn: SampleBrief[] = [
  briefZh("local-model-debugger", "本地模型调试器", "使用 Ollama、llama.cpp 和本地模型封装的开发者", "本地 AI 栈很强，但调试很难。开发者需要一个小工具记录 prompt、模型、参数、延迟和输出漂移。", "TypeScript、本地优先、无需云账号、浏览器 UI、可导出运行记录", "GitHub、Reddit r/LocalLLaMA、Hacker News、Discord 社区", 9, 8, 8),
  briefZh("agent-trace-notebook", "Agent Trace 笔记本", "构建 AI Agent 和自动化工作流的开发者", "Agent 失败很难解释，因为工具调用、中间状态、重试和模型输出分散在日志里。", "TypeScript、文件存储、Markdown 导出、兼容任意框架", "GitHub、AI 工程 newsletter、X/Twitter demo、框架 Discord", 8, 9, 7),
  briefZh("prompt-regression-lab", "Prompt 回归实验室", "交付 LLM 功能的产品工程师", "团队频繁修改 prompt，却缺少轻量回归检查来覆盖关键场景、语气、拒答行为和 JSON 结构。", "TypeScript、CLI 加 Web UI、支持 OpenAI 兼容 API 和本地 mock 模式", "GitHub、DevTools 社区、Product Hunt、工程博客", 8, 8, 8),
  briefZh("readme-positioning-assistant", "README 定位助手", "发布开发者工具的开源维护者", "很多有用仓库被忽略，是因为 README 首屏没有讲清切入点、安装路径、截图和首次成功结果。", "TypeScript、无后端、粘贴现有 README、导出修复建议", "GitHub、Hacker News、维护者社区、发布 newsletter", 7, 7, 9),
  briefZh("rag-fixture-builder", "RAG Fixture 生成器", "为支持、文档和内部知识库构建 RAG 功能的工程师", "团队能快速做出 RAG 原型，但很难创建可复现 fixture 来发现检索漂移、引用错误、过期 chunk 和 prompt 变化。", "TypeScript、本地文档 fixture、兼容任意向量库、导出 JSONL 测试用例", "GitHub、LangChain 和 LlamaIndex 社区、AI 工程 newsletter、DevTools Slack", 9, 8, 8),
  briefZh("llm-cost-watch", "LLM 成本观察台", "运行 OpenAI 兼容、Anthropic 和本地模型工作负载的创业团队工程师和维护者", "小团队很难跨 AI 功能跟踪 token 成本、延迟、fallback 行为和 provider 组合，因为日志分散、仪表盘又太重。", "TypeScript、浏览器仪表盘、CSV 导入、无托管后端、默认脱敏 prompt", "GitHub、SaaS 工程博客、Hacker News、FinOps 社区、X/Twitter demo", 8, 9, 8),
  briefZh("provider-migration-copilot", "Provider 迁移 Copilot", "在 OpenAI 兼容 API、Anthropic、Ollama、OpenRouter 和云网关之间迁移 AI 应用的开发者", "AI 团队因为成本、延迟、合规或模型质量切换 provider，但迁移会打破请求结构、流式行为、JSON mode、工具调用和 eval 基线。", "TypeScript、适配清单、请求 diff 查看器、不存储密钥、生成迁移 issue", "GitHub、provider Discord、AI SDK 社区、Reddit r/LocalLLaMA、开发者 newsletter", 8, 8, 9),
  briefZh("agent-permission-simulator", "Agent 权限模拟器", "为内部应用、CLI 和开发者工作流加入工具型 Agent 的开发者", "Agent 产品需要清晰权限边界，但团队常在危险文件、shell、浏览器或 API 调用进入生产后才发现问题。", "TypeScript、本地策略模拟器、场景 fixture、Markdown 报告、不执行真实破坏操作", "GitHub、安全工程社区、AI Agent newsletter、Hacker News、框架 Discord", 9, 8, 7),
  briefZh("eval-report-publisher", "Eval 报告发布器", "运行 prompt、模型或 Agent eval 但难以沟通结果的 AI 产品团队", "Eval 结果常被困在 notebook 或厂商仪表盘里。团队需要轻量方式把结果转成可读 changelog、scorecard 和 GitHub release notes。", "TypeScript、导入 JSON/CSV eval、静态 HTML 导出、分享卡片、不依赖模型 API", "GitHub、Product Hunt、AI 工程博客、DevTools 社区、维护者 newsletter", 7, 8, 9),
  briefZh("agent-memory-inspector", "Agent 记忆检查器", "交付带向量记忆、摘要和用户上下文的长期运行 Agent 的开发者", "Agent 记忆问题很隐蔽：过期事实、过度保留隐私数据、重复记忆和缺少引用，通常在用户投诉后才暴露。", "TypeScript、本地优先检查 UI、导入 JSON 日志、脱敏敏感值、导出可复现记忆 bug 报告", "GitHub、AI Agent 社区、安全工程 newsletter、Hacker News、框架 Discord", 9, 8, 8),
  briefZh("local-vector-index-doctor", "本地向量索引医生", "使用 SQLite、LanceDB、Chroma 或文件型向量索引运行本地 RAG 原型的工程师", "本地检索 demo 会因为 chunk 变化、embedding 重建、过滤器损坏或索引文件与源文档漂移而失效。", "TypeScript、无托管后端、扫描本地索引元数据、比较源文件、写出修复清单", "GitHub、Reddit r/LocalLLaMA、LangChain 社区、文档工程论坛、DevTools newsletter", 8, 8, 8),
  briefZh("model-routing-playground", "模型路由实验场", "决定何时在便宜、快速、本地和高质量模型之间路由请求的开发者", "团队想降低模型账单又不降低用户可见答案质量，但路由实验分散在表格、日志和 provider 仪表盘里。", "TypeScript、本地 demo 模式、导入请求样本、比较延迟/成本/质量备注、导出不含密钥", "GitHub、SaaS 工程博客、AI 基础设施 newsletter、FinOps 社区、X/Twitter demo", 8, 9, 8),
  briefZh("ai-release-risk-reviewer", "AI 发布风险审查器", "准备发布 prompt、模型、检索数据或 Agent 工具变更的工程团队", "AI 发布会以普通 changelog 捕捉不到的方式失败：prompt 回归、拒答行为变化、JSON contract 损坏和新工具权限。", "TypeScript、导入 release notes 和 eval 摘要、生成 GitHub checklist、不依赖模型 API", "GitHub、DevOps 社区、AI 工程 newsletter、内部平台团队、Hacker News", 8, 8, 7),
  briefZh("support-thread-signal-miner", "支持线程信号挖掘器", "把支持工单、Discord 线程和 GitHub discussion 转成 AI 产品想法的创始人和维护者", "有价值产品信号埋在重复配置问题、困惑报错、集成请求和各种 workaround 线程里。", "TypeScript、粘贴式导入、本地聚类、不上传客户数据、导出机会简报和 starter issue", "GitHub、创始人社区、支持工程博客、Product Hunt、开发者 newsletter", 8, 7, 9),
  briefZh("mcp-server-contract-tester", "MCP Server Contract 测试器", "通过 MCP server 暴露内部工具、数据源和自动化 API 的开发者", "MCP server 容易原型化但难以信任，因为 schema 漂移、鉴权假设、工具副作用和面向模型的描述会在小改动后失效。", "TypeScript、本地测试 harness、记录工具 schema、mock 危险调用、导出 GitHub 可用回归报告", "GitHub、MCP 社区、AI Agent newsletter、DevTools 博客、Hacker News", 9, 8, 8),
  briefZh("ai-coding-agent-pr-triage", "AI 编码 Agent PR 分诊", "收到 AI 生成 PR、issue 修复和自动重构的开源维护者", "维护者需要快速区分有价值的 AI 贡献和高风险 churn、缺失测试、大范围重写、无视项目惯例的改动。", "TypeScript、GitHub issue 和 diff 导入、本地评分、无仓库写权限、导出 review checklist", "GitHub、维护者社区、AI 编码 newsletter、DevTools 论坛、Hacker News", 8, 8, 9)
];

export function sampleBriefsForLocale(locale: AppLocale): SampleBrief[] {
  return locale === "zh-CN" ? sampleBriefsZhCn : sampleBriefs;
}

function briefZh(
  id: string,
  title: string,
  audience: string,
  signal: string,
  constraints: string,
  channels: string,
  pain: number,
  urgency: number,
  distribution: number
): SampleBrief {
  return {
    id,
    title,
    input: {
      audience,
      signal,
      constraints,
      channels,
      pain,
      urgency,
      distribution
    }
  };
}
