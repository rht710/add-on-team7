import { useState } from "react";
import { API_BASE_URL } from "../config";

function InterviewPrep() {
  const [role, setRole] = useState("AI Engineer");
  const [questions, setQuestions] = useState([
    {
      question: "Explain Retrieval-Augmented Generation (RAG).",
      answer: "RAG is a technique that combines an LLM with external knowledge retrieval. First, a query retrieves relevant documents from a vector store, which are then appended to the prompt, enabling the LLM to generate fact-based, verified answers."
    },
    {
      question: "What is FAISS?",
      answer: "FAISS (Facebook AI Similarity Search) is a library developed by Meta for efficient similarity search and clustering of dense vectors. It is highly optimized to run on both CPU and GPU."
    },
    {
      question: "Difference between embeddings and vectors?",
      answer: "A vector is a general mathematical array of numbers. An embedding is a specific type of vector that represents semantic information (meaning) of text, image, or other high-dimensional data in a lower-dimensional space."
    }
  ]);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/interview/questions`, {
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
        setExpandedAnswers({});
      } else {
        throw new Error("No questions returned from API.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 h-screen overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Interview Preparation
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
          {questions.map((item, index) => {
            const qText = typeof item === "string" ? item : item.question;
            const aText = typeof item === "string" ? "No explanation available." : item.answer;
            const isExpanded = !!expandedAnswers[index];

            return (
              <li key={index} className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm font-semibold text-slate-800">{qText}</p>
                  {aText && (
                    <button
                      onClick={() => toggleAnswer(index)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
                    >
                      {isExpanded ? "Hide Answer" : "Show Answer"}
                    </button>
                  )}
                </div>
                {isExpanded && aText && (
                  <div className="mt-2 text-xs text-slate-650 bg-white border border-slate-150 p-3 rounded-lg leading-relaxed shadow-sm">
                    <p className="font-semibold text-slate-700 mb-1">Model Answer / Explanation:</p>
                    {aText}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default InterviewPrep;