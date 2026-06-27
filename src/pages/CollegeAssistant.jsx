import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

function CollegeAssistant() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I am your Digital Help Desk Assistant. You can ask me anything about college guidelines, exam dates, events, or placements.", source: "" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [indexedFiles, setIndexedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch currently indexed files from the backend
  const fetchIndexedFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/college/indexed-files`);
      if (!response.ok) throw new Error("Failed to load indexed files.");
      const data = await response.json();
      setIndexedFiles(data.indexed_files || []);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch indexed files. Please verify the backend is running.");
    }
  };

  useEffect(() => {
    fetchIndexedFiles();
  }, []);

  const handleSend = async (textToSend = input) => {
    const prompt = textToSend.trim();
    if (!prompt) return;

    const userMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setThinking(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/college/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server. Check API keys and backend.");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.answer,
          source: data.sources && data.sources.length > 0 ? data.sources.join(", ") : "",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `Error: ${err.message}. Make sure the backend is active and OpenAI or Groq API keys are set.`, source: "" },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // Handle document upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/college/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to upload document.");
      }

      setSuccess(`Successfully indexed "${file.name}"!`);
      fetchIndexedFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const quickQuestions = [
    "What is the attendance policy?",
    "When do mid-term exams start?",
    "What are the placement CGPA criteria?",
    "When do placements begin?"
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      {/* Left Pane - Document & Knowledge Manager */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-1/3 md:h-full">
        {/* Pane Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Knowledge Base
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload guidelines, schedules, or announcements to expand the assistant's knowledge.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="p-5 border-b border-slate-100">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-slate-100/50 transition cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <p className="text-xs font-semibold text-slate-600 mb-1">
              {uploading ? "Indexing Document..." : "Upload Help Desk Document"}
            </p>
            <p className="text-[10px] text-slate-400">Supports PDF, DOCX, TXT</p>
          </div>

          {error && (
            <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-3 text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-100">
              {success}
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Indexed Resources ({indexedFiles.length})
          </h3>
          {indexedFiles.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No custom resources loaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {indexedFiles.map((filename, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition text-xs font-medium text-slate-700 truncate"
                  title={filename}
                >
                  {filename}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Pane - Chat Assistant */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full bg-slate-100/40">
        {/* Chat Header */}
        <div className="p-5 border-b border-slate-200 bg-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Digital Help Desk
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ask rules, curricula, timelines, placements, hostel, or transport queries.
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex flex-col max-w-[80%] md:max-w-md">
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-150 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.source && (
                  <span className="text-[10px] text-slate-450 mt-1 ml-1 flex items-center gap-1 font-medium">
                    Verified Source: <span className="bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700 font-semibold">{msg.source}</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="bg-blue-50 text-blue-800 text-xs px-4 py-2.5 rounded-2xl rounded-bl-none border border-blue-100/50 animate-pulse font-medium">
                Searching Knowledge Base & Formulating Answer...
              </div>
            </div>
          )}
        </div>

        {/* Quick Questions & Input Area */}
        <div className="p-5 bg-white border-t border-slate-200">
          {/* Quick-click Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={thinking}
                className="text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3 py-1.5 rounded-full transition font-medium border border-slate-200/40 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={thinking}
              placeholder="Ask the help desk a question..."
              className="flex-1 outline-none bg-transparent text-sm text-slate-800 px-2"
            />
            <button
              onClick={() => handleSend()}
              disabled={thinking || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollegeAssistant;