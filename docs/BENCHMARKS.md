# AI Repo Benchmarks

These benchmark examples map visible public repository signals to OpenTop scoring dimensions. They avoid private metrics and avoid hard-coding star counts; the point is to show what a visitor can inspect before deciding whether an AI app idea has a credible path to GitHub distribution.

Facts were checked against public GitHub repository metadata and linked README/docs sources on 2026-06-15.

## ollama/ollama

- Source: [repository](https://github.com/ollama/ollama) / [evidence](https://github.com/ollama/ollama/blob/main/README.md)
- OpenTop dimension: `distribution`
- Public signal: The README leads with local open-model building, one-command installs across operating systems, official Docker packaging, client libraries, community links, and coding-agent integrations.
- Lesson: Distribution improves when a project meets users where they already work: terminal, Docker, SDKs, Discord, Reddit, and adjacent tools.
- Use in OpenTop: Reward ideas that have obvious launch channels and integration hooks before the first release is built.

## open-webui/open-webui

- Source: [repository](https://github.com/open-webui/open-webui) / [evidence](https://github.com/open-webui/open-webui/blob/main/README.md)
- OpenTop dimension: `pain`
- Public signal: The README frames the project as a self-hosted, offline AI platform with Ollama and OpenAI-compatible support, RAG, responsive UI, permissions, plugins, and deployment options.
- Lesson: Pain is visible when the repository bundles a complete workflow around a recurring operational problem instead of exposing only a thin model call.
- Use in OpenTop: Score opportunities higher when they remove setup, hosting, access-control, and workflow friction for a specific user.

## langchain-ai/langchainjs

- Source: [repository](https://github.com/langchain-ai/langchainjs) / [evidence](https://github.com/langchain-ai/langchainjs/blob/main/README.md)
- OpenTop dimension: `buildability`
- Public signal: The README positions LangChain.js as a TypeScript framework with standard interfaces for agents, models, embeddings, vector stores, integrations, and multiple supported runtimes.
- Lesson: Buildability improves when the project narrows complexity into composable interfaces and lets users swap providers or runtimes without rewriting the app.
- Use in OpenTop: Favor TypeScript ideas that can start with a small stable abstraction and expand through provider or integration modules.

## vercel/ai

- Source: [repository](https://github.com/vercel/ai) / [evidence](https://github.com/vercel/ai/blob/main/content/docs/03-ai-sdk-core/index.mdx)
- OpenTop dimension: `starPotential`
- Public signal: The docs expose many reusable jobs: structured data generation, tool calling, realtime voice, MCP apps, provider management, testing, telemetry, and media generation.
- Lesson: Star potential compounds when one clear SDK becomes the default extension point for many adjacent AI workflows.
- Use in OpenTop: Reward ideas that can publish a useful first wedge while leaving credible expansion paths for contributors.
