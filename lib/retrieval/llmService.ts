import Groq from "groq-sdk";
import { Document } from "@langchain/core/documents";

export async function generateAnswer(
  query: string,
  context: Document[],
  chatHistory: { role: string; content: string }[] = []
) {
  // Create client INSIDE function
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  // Format context from retrieved chunks
  const contextText = context
    .map(
      (doc, idx) =>
        `[Chunk ${idx + 1}] (Source: ${
          doc.metadata.source || "Unknown"
        })\n${doc.pageContent}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `You are a helpful AI assistant that answers questions based ONLY on the provided document context.

STRICT RULES:
1. ONLY use information from the context provided below
2. If the answer is not in the context, respond: "I couldn't find this information in the uploaded document."
3. Do not use your general knowledge
4. Cite the source when possible (e.g., "According to the document...")
5. Be conversational but accurate

CONTEXT FROM DOCUMENT:
${contextText}`;

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...chatHistory,
    { role: "user", content: query },
  ];

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.3,
    max_tokens: 1000,
  });

  return {
    answer: response.choices[0]?.message?.content || "No response generated",
    sources: context.map((doc) => doc.metadata.source),
  };
}