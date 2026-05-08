import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { loadDocument } from "../../../lib/loaders/documentLoader";
import { chunkDocuments } from "../../../lib/chunking/textSplitter";
import { storeDocuments } from "../../../lib/retrieval/vectorStore";

export async function POST(req: NextRequest) {
  try {

    // Parse form data
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Generate unique document ID
    const documentId = uuidv4();

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Temporary upload path
    const uploadDir = path.join(process.cwd(), "tmp");

    // Create tmp directory if missing
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(uploadDir, file.name);

    // Save file temporarily
    fs.writeFileSync(filePath, buffer);

    // Load document
    const docs = await loadDocument(filePath, file.name);

    // Chunk document
    const chunks = await chunkDocuments(docs, documentId);

    // Store embeddings in Qdrant
    await storeDocuments(chunks);

    // Optional cleanup
    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      documentId,
      chunksStored: chunks.length,
    });

  } catch (error) {

    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to process document",
      },
      {
        status: 500,
      }
    );
  }
}