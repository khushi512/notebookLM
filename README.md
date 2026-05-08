# NotebookLM Clone — RAG Powered Document Chat

A Retrieval-Augmented Generation (RAG) application inspired by Google NotebookLM.

Users can upload documents and have grounded conversations with them using vector search + LLM generation.

---

# Features

* Upload PDF, TXT, and DOCX documents
* Automatic document chunking
* Embedding generation using HuggingFace embeddings
* Vector storage using Qdrant
* Semantic retrieval of relevant chunks
* Grounded answer generation using Groq LLMs
* Modern NotebookLM-style UI
* Conversational chat interface
* Document-specific retrieval isolation
* Hallucination prevention using contextual grounding

---

# Tech Stack

## Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS

## Backend

* Next.js API Routes
* LangChain
* Qdrant Vector Database
* Groq API
* HuggingFace Embeddings

---

# RAG Pipeline

The application implements a complete Retrieval-Augmented Generation pipeline:

```text
Document Upload
      ↓
Document Loading
      ↓
Text Chunking
      ↓
Embedding Generation
      ↓
Vector Storage (Qdrant)
      ↓
Semantic Retrieval
      ↓
Grounded LLM Response
```

---

# Chunking Strategy

The project uses:

## Recursive Character Text Splitter

Configuration:

* Chunk Size: 1000
* Chunk Overlap: 200

Reasoning:

* Maintains semantic continuity
* Prevents context fragmentation
* Improves retrieval quality
* Handles long documents efficiently

---

# Project Structure

```text
app/
 ├── api/
 │    ├── chat/
 │    └── upload/
 │
 ├── globals.css
 ├── layout.tsx
 └── page.tsx

lib/
 ├── chunking/
 ├── embeddings/
 ├── loaders/
 └── retrieval/

public/

README.md
package.json
tsconfig.json
```

---

# API Endpoints

## Upload API

```http
POST /api/upload
```

Uploads and processes documents.

### Flow

* Receive file
* Save temporarily
* Load document
* Chunk text
* Generate embeddings
* Store in Qdrant
* Return documentId

---

## Chat API

```http
POST /api/chat
```

Generates grounded answers using retrieved document context.

### Request Example

```json
{
  "question": "What is this document about?",
  "documentId": "example-doc-id"
}
```

---

# Installation

## 1. Clone Repository

```bash
git clone <your-repo-url>
cd rag-notebooklm
```

---

## 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

---

## 3. Setup Environment Variables

Create:

```text
.env.local
```

Add:

```env
GROQ_API_KEY=your_groq_api_key
HUGGINGFACEHUB_API_KEY=your_huggingface_api_key
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=rag_docs
```

---

## 4. Start Qdrant

Using Docker:

```bash
docker run -p 6333:6333 qdrant/qdrant
```

---

## 5. Run Application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Hallucination Prevention

The LLM is instructed to:

* Answer ONLY from retrieved document context
* Avoid using external/general knowledge
* Explicitly state when information is missing
* Ground responses in retrieved chunks

This ensures reliable and document-faithful answers.

---

# Future Improvements

Potential future upgrades:

* Multiple document support
* Streaming responses
* Source chunk citations
* Persistent chat history
* Local embedding models
* Hybrid search
* Reranking pipeline
* Authentication
* Drag-and-drop uploads

---

# Deployment

Recommended deployment stack:

* Vercel (Frontend + API)
* Qdrant Cloud

---

# Author

Khushboo
