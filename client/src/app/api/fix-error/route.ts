import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { errorMessage, code } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ text: "Error: Missing API Key" });
    }

    const prompt = `
      You are an expert coding assistant.
      Fix the following code error. 
      Output ONLY the fixed code block, followed by a one-sentence explanation.
      
      CODE:
      ${code}
      
      ERROR:
      ${errorMessage}
    `;

    // ✅ FIX: Use "gemini-2.0-flash-lite" 
    // This model is lighter, faster, and usually has better free-tier availability.
    const modelName = "gemini-2.5-flash"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("AI Error:", data.error);
      return NextResponse.json({ 
        text: `AI Error: ${data.error.message}` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: `Server Error: ${error.message}` });
  }
}