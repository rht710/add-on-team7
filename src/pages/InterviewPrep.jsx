import { useState } from "react";

function InterviewPrep() {
  const [role, setRole] = useState("AI Engineer");
  const [questions, setQuestions] = useState([
    "Explain Retrieval-Augmented Generation (RAG).",
    "What is FAISS?",
    "Difference between embeddings and vectors?"
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/api/interview/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: role }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions. Make sure backend is running and OpenAI or Groq API Key is set.");
      }

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        throw new Error("No questions returned from API.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 h-screen overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        🎤 Interview Preparation
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <label className="block font-semibold text-gray-700 mb-2">
          Select Role
        </label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-slate-300 p-3 rounded-lg w-full text-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="AI Engineer">AI Engineer</option>
          <option value="Data Analyst">Data Analyst</option>
          <option value="Machine Learning Engineer">Machine Learning Engineer</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="Frontend Developer">Frontend Developer</option>
        </select>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Custom Questions"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow mt-6 border border-slate-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Interview Questions
        </h2>

        <ul className="space-y-3">
          {questions.map((question, index) => (
            <li key={index} className="border border-slate-100 p-3 rounded-lg bg-slate-50 text-sm text-gray-700">
              {question}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default InterviewPrep;