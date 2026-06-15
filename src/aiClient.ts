import type { AnalysisResult, OpportunityInput, ProviderSettings } from "./domain";
import { analyzeLocally } from "./opportunityEngine";

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

export async function analyzeOpportunity(
  input: OpportunityInput,
  settings: ProviderSettings
): Promise<AnalysisResult> {
  if (settings.provider === "demo") {
    return analyzeLocally(input);
  }

  const model = settings.model.trim() || (settings.provider === "ollama" ? "llama3.1" : "gpt-4.1-mini");
  const endpoint =
    settings.endpoint.trim() ||
    (settings.provider === "ollama"
      ? "http://localhost:11434/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions");

  const response = await fetch(endpoint, {
    method: "POST",
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
  });

  if (!response.ok) {
    throw new Error(`Model request failed with ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Model returned an empty response.");
  }

  const parsed = JSON.parse(content) as AnalysisResult;
  return {
    ...parsed,
    generatedBy: "model"
  };
}

function buildMessages(input: OpportunityInput): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are OpenTop, an exacting AI product strategist for open-source TypeScript apps. Return only valid JSON matching { summary: string, opportunities: Opportunity[] } where each Opportunity has id, name, tagline, targetUser, wedge, differentiator, moat, score, scores, firstRelease, launchPlan, repoHook, risks. Scores are 1-10."
    },
    {
      role: "user",
      content: JSON.stringify(input)
    }
  ];
}
