import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { Document } from "@langchain/core/documents";

export async function loadDocument(
  filePath: string,
  fileName: string
): Promise<Document[]> {
  const extension = fileName.split(".").pop()?.toLowerCase();

  let loader;

  switch (extension) {
    case "pdf":
      loader = new PDFLoader(filePath);
      break;
    case "txt":
      loader = new TextLoader(filePath);
      break;
    case "docx":
      loader = new DocxLoader(filePath);
      break;
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }

  const docs = await loader.load();
  
  // Add metadata to each document
  return docs.map((doc, index) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      source: fileName,
      documentIndex: index,
    },
  }));
}