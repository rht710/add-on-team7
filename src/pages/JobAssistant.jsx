function JobAssistant() {
  return (
    <div className="flex-1 p-8">

      <h1 className="text-3xl font-bold mb-6">
        💼 Job Assistant
      </h1>

      {/* Top Section */}

      <div className="grid grid-cols-2 gap-6">

        {/* Resume Upload */}

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            Upload Resume
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">

            <p className="text-gray-500 mb-4">
              Drag & Drop Resume Here
            </p>

            <input
              type="file"
              className="w-full"
            />

          </div>

        </div>

        {/* ATS Score */}

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            ATS Score
          </h2>

          <div className="w-full bg-gray-200 rounded-full h-4">

            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: "85%" }}
            ></div>

          </div>

          <p className="text-3xl font-bold mt-4">
            85%
          </p>

          <p className="text-green-600">
            Resume is ATS Friendly
          </p>

        </div>

      </div>

      {/* Resume Analysis */}

      <div className="bg-white p-6 rounded-xl shadow mt-6">

        <h2 className="text-xl font-semibold mb-4">
          Resume Analysis
        </h2>

        <ul className="space-y-3">

          <li className="border p-3 rounded">
            ✅ Strong Technical Skills Section
          </li>

          <li className="border p-3 rounded">
            ✅ Good Project Descriptions
          </li>

          <li className="border p-3 rounded">
            ⚠ Add More Quantifiable Achievements
          </li>

        </ul>

      </div>

      {/* Job Recommendations */}

      <div className="bg-white p-6 rounded-xl shadow mt-6">

        <h2 className="text-xl font-semibold mb-4">
          Recommended Roles
        </h2>

        <div className="grid grid-cols-3 gap-4">

          <div className="border rounded-xl p-4">
            <h3 className="font-bold text-lg">
              AI Engineer
            </h3>

            <p className="mt-2">
              Match: 92%
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h3 className="font-bold text-lg">
              Data Analyst
            </h3>

            <p className="mt-2">
              Match: 88%
            </p>
          </div>

          <div className="border rounded-xl p-4">
            <h3 className="font-bold text-lg">
              ML Intern
            </h3>

            <p className="mt-2">
              Match: 84%
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default JobAssistant;