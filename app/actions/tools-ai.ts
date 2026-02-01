'use server';

// Using standard fetch for OpenRouter as it's just an OpenAI-compatible API
// or we can use the `openai` sdk if installed, but fetch is lighter for this single use.

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Need to ensure this is in env
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SITE_NAME = "FukaiBox";

interface GenerateToolsAppResponse {
    success: boolean;
    data?: {
        version: number;
        files: Record<string, string>;
        description: string;
    };
    error?: string;
}

export async function generateToolsApp(prompt: string, _history: unknown[] = []): Promise<GenerateToolsAppResponse> {
    if (!OPENROUTER_API_KEY) {
        return { success: false, error: "AI Service Unavailable (Missing Key)" };
    }

    try {
        const systemPrompt = `
You are an expert React developer building micro-apps for "封解Box Tools".
Your goal is to generate a complete, working React application based on the user's request.

**Output Format**:
You must output STRICT JSON with no markdown formatting. The JSON structure:
{
  "description": "Short summary of what you built",
  "files": {
    "/App.tsx": "Code...",
    "/utils.ts": "Code..." 
    // Add other files as needed. Do NOT include package.json or public/index.html.
  }
}

**CRITICAL CONSTRAINTS**:
1. **NO External APIs**: Do NOT use Supabase, Firebase, or any external services.
   - Reasoning: The app runs in a sandboxed iframe without network access.
2. **Available Libraries ONLY**:
   - lucide-react (icons)
   - clsx, tailwind-merge (utilities)
   - React hooks (useState, useEffect, etc.)
3. **Forbidden**:
   - ❌ createClient (Supabase)
   - ❌ initializeApp (Firebase)
   - ❌ fetch() or axios (external HTTP)
   - ❌ localStorage/sessionStorage (use window.fukai.db instead)
   - ❌ react-router-dom (no routing needed)
   - ❌ next/navigation (no routing needed)
   - ❌ next/image (no next.js environment)
4. **Styling**: Use Tailwind CSS exclusively. Dark mode by default.
5. **Tools SDK**: If the user needs user data, use \`window.fukai.getUser()\`.
   - Access: \`const user = await window.fukai?.getUser();\` (Safe access)
   - Do NOT mock data if you can use real data via SDK.
6. **Interaction**: Make the UI interactive and visually "Premium" (Dark mode default).

**Output Format**: Strict JSON only.
{
  "description": "...",
  "files": {
    "/App.tsx": "...",
    "/components/Button.tsx": "..."
  }
}

**User Prompt**:
${prompt}
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free", // Or "deepseek/deepseek-chat"
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": "Generate the app now." }
                ],
                "response_format": { type: "json_object" }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("AI API Error:", err);
            throw new Error("AI Generation Failed");
        }

        const json = await response.json();
        const content = json.choices[0].message.content;

        // Parse JSON content
        const result = JSON.parse(content);

        return {
            success: true,
            data: {
                version: Date.now(),
                files: result.files,
                description: result.description
            }
        };

    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown Error";
        console.error("Generate Tools App Error:", e);
        return { success: false, error: errorMessage };
    }
}
