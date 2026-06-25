function InterviewPrep() {
  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">
        🎤 Interview Preparation
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">

        <label className="block font-semibold mb-2">
          Select Role
        </label>

        <select className="border p-3 rounded-lg w-full">
          <option>AI Engineer</option>
          <option>Data Analyst</option>
          <option>Machine Learning Engineer</option>
        </select>

        <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
          Generate Questions
        </button>

      </div>

      <div className="bg-white p-6 rounded-xl shadow mt-6">

        <h2 className="text-xl font-semibold mb-4">
          Sample Questions
        </h2>

        <ul className="space-y-3">

          <li className="border p-3 rounded">
            Explain Retrieval-Augmented Generation (RAG).
          </li>

          <li className="border p-3 rounded">
            What is FAISS?
          </li>

          <li className="border p-3 rounded">
            Difference between embeddings and vectors?
          </li>

        </ul>

      </div>
    </div>
  );
}

export default InterviewPrep;