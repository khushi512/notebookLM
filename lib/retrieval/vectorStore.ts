import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { Document } from "@langchain/core/documents";
import { getEmbeddingModel } from "../embeddings/embeddingService";

const QDRANT_URL = process.env.QDRANT_URL!;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY!;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "rag_docs";
const client = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

async function ensureDocumentIdIndex() {

  try {

    await client.createPayloadIndex(
      COLLECTION_NAME,
      {
        field_name: "metadata.documentId",
        field_schema: "keyword",
      }
    );

  } catch (error) {

    console.log("Index may already exist");
  }
}

export async function storeDocuments(documents: Document[]) {
    const embeddings = getEmbeddingModel();
    
    await ensureDocumentIdIndex();

    await QdrantVectorStore.fromDocuments(documents, embeddings, {
        url: QDRANT_URL,
        apiKey: QDRANT_API_KEY,
        collectionName: COLLECTION_NAME,
    });

    return { success: true, documentCount: documents.length };
}

export async function retrieveRelevantChunks(
  query: string,
  documentId: string,
  k: number = 3
): Promise<Document[]> {

  const embeddings = getEmbeddingModel();

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY,
      collectionName: COLLECTION_NAME,
    }
  );

  const results = await vectorStore.similaritySearch(
    query,
    k,
    {
      must: [
        {
          key: "metadata.documentId",
          match: {
            value: documentId,
          },
        },
      ],
    }
  );

  return results;
}