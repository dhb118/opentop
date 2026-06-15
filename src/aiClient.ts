import type { AnalysisResult, OpportunityInput, ProviderSettings } from "./domain.ts";
import { parseModelAnalysis } from "./modelResponse.ts";
import { analyzeLocally } from "./opportunityEngine.ts";

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface AnthropicMessageResponse {
  content?: Array<{
    text?: string;
    type?: string;
  }>;
}

export interface ModelRequest {
  body: string;
  endpoint: string;
  headers: Record<string, string>;
}

const systemPrompt =
  "You are OpenTop, an exacting AI product strategist for open-source TypeScript apps. Return only valid JSON matching { summary: string, opportunities: Opportunity[] } where each Opportunity has id, name, tagline, targetUser, wedge, differentiator, moat, score, scores, firstRelease, launchPlan, repoHook, risks. Scores are 1-10.";

export async function analyzeOpportunity(
  input: OpportunityInput,
  settings: ProviderSettings
): Promise<AnalysisResult> {
  if (settings.provider === "demo") {
    return analyzeLocally(input);
  }

  const request = buildModelRequest(input, settings);
  const response = await fetch(request.endpoint, {
    method: "POST",
    headers: request.headers,
    body: request.body
  });

  if (!response.ok) {
    throw new Error(`Model request failed with ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = extractModelContent(data, settings.provider);
  if (!content) {
    throw new Error("Model returned an empty response.");
  }

  return parseModelAnalysis(content);
}

export function buildModelRequest(input: OpportunityInput, settings: ProviderSettings): ModelRequest {
  if (settings.provider === "anthropic") {
    return buildAnthropicRequest(input, settings);
  }

  return buildChatCompletionRequest(input, settings);
}

export function defaultEndpointForProvider(provider: ProviderSettings["provider"]): string {
  if (provider === "ollama") {
    return "http://localhost:11434/v1/chat/completions";
  }
  if (provider === "anthropic") {
    return "https://api.anthropic.com/v1/messages";
  }
  return "https://api.openai.com/v1/chat/completions";
}

export function defaultModelForProvider(provider: ProviderSettings["provider"]): string {
  if (provider === "ollama") {
    return "llama3.1";
  }
  if (provider === "anthropic") {
    return "claude-sonnet-4-5";
  }
  return "gpt-4.1-mini";
}

function buildChatCompletionRequest(input: OpportunityInput, settings: ProviderSettings): ModelRequest {
  const model = settings.model.trim() || defaultModelForProvider(settings.provider);
  const endpoint = settings.endpoint.trim() || defaultEndpointForProvider(settings.provider);

  return {
    endpoint,
    headers: {
      "Content-Type": "application/json",
      ...(settings.apiKey.trim() ? { Authorization: `Bearer ${settings.apiKey.trim()}` } : {})
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: buildMessages(input)
    })
  };
}

function buildAnthropicRequest(input: OpportunityInput, settings: ProviderSettings): ModelRequest {
  const apiKey = settings.apiKey.trim();
  const endpoint = settings.endpoint.trim() || defaultEndpointForProvider("anthropic");

  return {
    endpoint,
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      ...(apiKey ? { "x-api-key": apiKey } : {})
    },
    body: JSON.stringify({
      model: settings.model.trim() || defaultModelForProvider("anthropic"),
      max_tokens: 2600,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: JSON.stringify(input)
        }
      ]
    })
  };
}

function buildMessages(input: OpportunityInput): ChatMessage[] {
  return [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: JSON.stringify(input)
    }
  ];
}

function extractModelContent(data: unknown, provider: ProviderSettings["provider"]): string | undefined {
  if (provider === "anthropic") {
    return (data as AnthropicMessageResponse).content
      ?.filter((block) => block.type === "text" || !block.type)
      .map((block) => block.text)
      .filter((text): text is string => Boolean(text))
      .join("\n")
      .trim();
  }

  return (data as ChatCompletionResponse).choices?.[0]?.message?.content;
}
