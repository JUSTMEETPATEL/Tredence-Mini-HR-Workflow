import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Fallback chain — if one model is rate-limited, try the next
const MODELS = [
  'openai/gpt-oss-120b:free',
  'qwen/qwen3-coder:free',
  'z-ai/glm-4.5-air:free',
  'openrouter/free',
];

const SYSTEM_PROMPT = `You are an expert HR Workflow Designer AI assistant. You help users build automated HR workflows by generating structured node graphs.

AVAILABLE NODE TYPES:
- "start": Beginning of workflow. Data: { title: string }
- "task": Manual human task. Data: { title: string, description?: string, assignee?: string, dueDate?: string }
- "approval": Requires someone to approve/reject. Data: { title: string, approver?: string }
- "automated_step": Automatic system action (API call, email, etc). Data: { title: string, actionType?: string, endpointUrl?: string }
- "end": End of workflow. Data: { title: string }

BEHAVIOR RULES:
1. When the user's description is vague or missing critical details, ask clarifying questions BEFORE generating a workflow.
2. Ask a MAXIMUM of 3 questions at a time. Each question should have 2-5 options. One option can be "Other" with allowCustom: true.
3. When you have enough context, generate the full workflow.
4. Always generate realistic, practical HR workflows.

YOU MUST RESPOND WITH VALID JSON ONLY. No markdown, no code fences, no explanation outside the JSON.

RESPONSE FORMAT (questions):
{
  "type": "questions",
  "message": "brief explanation of why you need more info",
  "questions": [
    {
      "id": "q1",
      "text": "Which notification system should be used?",
      "options": [
        { "label": "Slack", "value": "slack" },
        { "label": "Microsoft Teams", "value": "teams" },
        { "label": "Email (SMTP)", "value": "email" },
        { "label": "Other", "value": "other", "allowCustom": true }
      ]
    }
  ]
}

RESPONSE FORMAT (workflow):
{
  "type": "workflow",
  "message": "brief description of the generated workflow",
  "workflow": {
    "name": "Workflow Name",
    "nodes": [
      { "id": "n1", "type": "start", "position": { "x": 300, "y": 50 }, "data": { "title": "Start" } },
      { "id": "n2", "type": "task", "position": { "x": 300, "y": 170 }, "data": { "title": "Do Something", "assignee": "HR Manager" } }
    ],
    "edges": [
      { "id": "e1-2", "source": "n1", "target": "n2" }
    ]
  }
}

LAYOUT RULES for positions:
- Place nodes vertically with ~120px spacing between each node (y-axis).
- For parallel branches, offset x by 250px left and right.
- Start x at 300 for single-column flows.
- Always start at y=50 and increment by 120.`;

async function tryModel(model: string, apiKey: string, messages: {role: string; content: string}[]): Promise<Response> {
  return fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://codeauto-hr.app',
      'X-Title': 'CodeAuto HR Workflow Designer',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.4,
      max_tokens: 4096,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
    }

    let response: Response | null = null;
    let lastError = '';

    // Try each model in the fallback chain
    for (const model of MODELS) {
      console.log(`Trying model: ${model}`);
      response = await tryModel(model, apiKey, messages);

      if (response.ok) break;

      // If rate-limited (429) or unavailable, try the next model
      if (response.status === 429 || response.status === 503) {
        console.warn(`Model ${model} returned ${response.status}, trying next...`);
        lastError = `${model}: ${response.status}`;
        // Small delay before trying next
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      // For other errors, bail out
      const errBody = await response.text();
      console.error('OpenRouter error:', response.status, errBody);
      return NextResponse.json({ error: `OpenRouter API error: ${response.status}` }, { status: 502 });
    }

    if (!response || !response.ok) {
      return NextResponse.json({ error: `All models rate-limited. Last: ${lastError}. Please wait a moment and try again.` }, { status: 429 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Fix common LLM JSON mistakes:
      // 1. Missing colon after key:  "value: " → "value": "
      cleaned = cleaned.replace(/"(\w+):\s*"/g, '"$1": "');
      // 2. Trailing commas before ] or }
      cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
      // 3. Single quotes used instead of double quotes
      cleaned = cleaned.replace(/'/g, '"');

      parsed = JSON.parse(cleaned);
    } catch {
      // Second attempt: try to extract JSON object from the text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          let extracted = jsonMatch[0];
          extracted = extracted.replace(/"(\w+):\s*"/g, '"$1": "');
          extracted = extracted.replace(/,\s*([\]}])/g, '$1');
          parsed = JSON.parse(extracted);
        } catch {
          parsed = { type: 'message', message: content };
        }
      } else {
        parsed = { type: 'message', message: content };
      }
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('AI workflow route error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

