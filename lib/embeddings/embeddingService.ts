import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export function getEmbeddingModel() {
  return new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });
}