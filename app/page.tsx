"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);

  const [documentId, setDocumentId] = useState("");

  const [uploading, setUploading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);

  // Upload document
  async function handleUpload() {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: any = await response.json();

      if (data.success) {
        setDocumentId(data.documentId);
        setMessages([]);

        alert("Document uploaded successfully!");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {

      console.error(error);

      alert(
        "Embedding service temporarily unavailable. Please retry upload."
      );

    } finally {
      setUploading(false);
    }
  }

  // Ask question
  async function handleAsk() {
    if (!question.trim()) return;

    if (!documentId) {
      alert("Please upload a document first");
      return;
    }

    const currentQuestion = question;

    const userMessage: Message = {
      role: "user",
      content: currentQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);

    setQuestion("");

    try {
      setLoading(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
          documentId,
          chatHistory: messages,
        }),
      });

      const data: any = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);

      alert("Failed to get answer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white">
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-6 flex flex-col">
          {/* Logo / Title */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              NotebookLM
            </h1>

            <p className="text-zinc-400 mt-3 text-sm leading-relaxed">
              Upload documents and chat with them using Retrieval-Augmented Generation.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
            <h2 className="text-xl font-semibold mb-2">
              Upload Document
            </h2>

            <p className="text-zinc-400 text-sm mb-5">
              PDF, TXT, DOCX supported
            </p>

            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-white hover:bg-zinc-800/40 transition-all duration-200 text-center px-4">
                <div className="text-4xl mb-2">📄</div>

                <p className="text-white font-medium mb-1">
                  Click to select a document
                </p>

                <p className="text-zinc-500 text-sm">
                  PDF, TXT, DOCX
                </p>

                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={(e) =>
                    setFile(
                      (e.target as HTMLInputElement).files?.[0] || null
                    )
                  }
                  className="hidden"
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-white text-black py-3 rounded-2xl font-semibold hover:bg-zinc-300 transition-all duration-200 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          {/* Current Document */}
          <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-lg font-semibold mb-3">
              Current Document
            </h3>

            {file ? (
              <div>
                <p className="text-white font-medium break-all">
                  {file.name}
                </p>

                <p className="text-zinc-400 text-sm mt-2">
                  {(file.size / 1024).toFixed(2)} KB
                </p>

                {documentId && (
                  <div className="mt-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-3 text-sm">
                     Indexed successfully
                  </div>
                )}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">
                No document uploaded yet.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-6 text-xs text-zinc-500 leading-relaxed">
            Powered by LangChain, Qdrant, HuggingFace Embeddings, and Groq.
          </div>
        </aside>

        {/* Main Chat Area */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="border-b border-zinc-800 px-6 py-5 bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Chat With Your Document
              </h2>

              <p className="text-zinc-400 text-sm mt-1">
                Answers are grounded strictly in uploaded content.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-full text-sm text-zinc-300">
              RAG Enabled
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <div className="text-6xl mb-4">📄</div>

                  <h3 className="text-2xl font-semibold mb-2 text-zinc-300">
                    Start chatting with your document
                  </h3>

                  <p className="text-zinc-500 max-w-md leading-relaxed">
                    Upload a file from the sidebar and ask natural language questions about its content.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[85%] px-6 py-5 rounded-3xl whitespace-pre-wrap shadow-2xl ${msg.role === "user"
                      ? "bg-white text-black rounded-br-md"
                      : "bg-zinc-900 border border-zinc-800 text-white rounded-bl-md"
                    }`}
                >
                  <div className="text-xs uppercase tracking-wide opacity-60 mb-3 font-semibold">
                    {msg.role === "user" ? "You" : "NotebookLM"}
                  </div>

                  <div className="leading-relaxed text-[15px] md:text-base">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-800 px-6 py-5 rounded-3xl rounded-bl-md shadow-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-zinc-800 bg-zinc-950/50 backdrop-blur-xl p-5">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Ask something about your document..."
                value={question}
                onChange={(e) =>
                  setQuestion(
                    (e.target as HTMLInputElement).value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAsk();
                  }
                }}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-white text-white placeholder:text-zinc-500"
              />

              <button
                onClick={handleAsk}
                disabled={loading}
                className="bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:bg-zinc-300 transition-all duration-200 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}