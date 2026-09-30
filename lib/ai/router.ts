// Free-model router per reviewlabs.space.pdf > Tech stack: Z.ai GLM-4.7-Flash
// first, then Qwen3-32B on Cerebras, then Qwen3-32B on Groq. Every provider
// here speaks the OpenAI chat-completions shape, so one call site handles
// all three — falling through on any failure (missing key, rate limit,
// outage) to the next tier rather than failing the whole draft.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type ProviderConfig = {
  name: string;
  envKey: string;
  baseUrl: string;
  model: string;
};

function providers(): ProviderConfig[] {
  return [
    {
      name: "zai",
      envKey: "ZAI_API_KEY",
      baseUrl: "https://api.z.ai/api/paas/v4",
      model: process.env.ZAI_MODEL || "glm-4.7-flash",
    },
    {
      name: "cerebras",
      envKey: "CEREBRAS_API_KEY",
      baseUrl: "https://api.cerebras.ai/v1",
      model: process.env.CEREBRAS_MODEL || "qwen-3-32b",
    },
    {
      name: "groq",
      envKey: "GROQ_API_KEY",
      baseUrl: "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
    },
  ];
}

export function hasAnyAiProviderConfigured(): boolean {
  return providers().some((p) => Boolean(process.env[p.envKey]));
}

export function configuredProviderNames(): string[] {
  return providers()
    .filter((p) => Boolean(process.env[p.envKey]))
    .map((p) => p.name);
}

export async function routedChatCompletion(
  messages: ChatMessage[]
): Promise<{ text: string; modelUsed: string } | null> {
  for (const provider of providers()) {
    const apiKey = process.env[provider.envKey];
    if (!apiKey) continue;

    try {
      const res = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          temperature: 0.4,
          max_tokens: 200,
        }),
      });

      if (!res.ok) continue; // try the next tier down

      const data = await res.json();
      const text: string | undefined = data.choices?.[0]?.message?.content?.trim();
      if (text) return { text, modelUsed: `${provider.name}/${provider.model}` };
    } catch {
      continue; // network error on this tier, fall through
    }
  }

  return null;
}
