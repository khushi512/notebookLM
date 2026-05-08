import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

export async function chunkDocuments(
    documents: Document[], documentId: string
): Promise<Document[]> {
    // Recursive Character Text Splitter - industry standard
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: ["\n\n", "\n", " ", ""],
    });

    const chunks = await splitter.splitDocuments(documents);

    // Add chunk metadata for better tracking
    return chunks.map((chunk, index) => ({
        ...chunk,
        metadata: {
            ...chunk.metadata,
            chunkIndex: index,
            chunkSize: chunk.pageContent.length,
            documentId,
            uploadedAt: new Date().toISOString(),
        },
    }));
}