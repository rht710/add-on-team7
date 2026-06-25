import { useState } from "react";

function CollegeAssistant() {
  const [messages, setMessages] = useState([
    { role: "user", text: "What is the attendance policy?" },
    { role: "bot", text: "Students must maintain 75% attendance.", source: "attendance_policy.pdf" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setThinking(true);

    // Simulate bot response (replace with real API call later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "This is a placeholder response. Connect your backend API here.", source: "" },
      ]);
      setThinking(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">🎓 College Assistant</h1>
        <p className="text-sm text-gray-500">Ask anything about college policies, schedules, and more.</p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl shadow p-6 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex flex-col max-w-md">
              <div
                className={`p-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              {msg.source && (
                <span className="text-xs text-gray-400 mt-1 ml-1">📄 {msg.source}</span>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="bg-yellow-100 text-yellow-800 text-sm p-3 rounded-2xl rounded-bl-none animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="flex-1 outline-none text-sm text-gray-700 px-2"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default CollegeAssistant;