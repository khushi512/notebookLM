import { NextRequest, NextResponse } from "next/server";

import { retrieveRelevantChunks } from "../../../lib/retrieval/vectorStore";
import { generateAnswer } from "../../../lib/retrieval/llmService";

export async function POST(req: NextRequest) {
    try {

        const body = await req.json() as {
            question: string;
            documentId: string;
            chatHistory?: { role: string; content: string }[];
        };
        const {
            question,
            documentId,
            chatHistory = [],
        } = body;
        // Validation
        if (!question || !documentId) {
            return NextResponse.json(
                {
                    error: "Question and documentId are required",
                },
                {
                    status: 400,
                }
            );
        }

        // Retrieve relevant chunks
        const relevantChunks = await retrieveRelevantChunks(
            question,
            documentId,
            4
        );

        // Generate grounded answer
        const result = await generateAnswer(
            question,
            relevantChunks,
            chatHistory
        );

        return NextResponse.json({
            success: true,
            answer: result.answer,
            sources: result.sources,
        });

    } catch (error) {

        console.error("CHAT ERROR:", error);

        return NextResponse.json(
            {
                error: "Failed to generate answer",
            },
            {
                status: 500,
            }
        );
    }
}