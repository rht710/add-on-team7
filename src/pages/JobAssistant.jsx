import { useState } from "react";

function JobAssistant() {
  const [file, setFile] = useState(null);
  const [targetTitle, setTargetTitle] = useState("AI Engineer");
  const [targetLocation, setTargetLocation] = useState("Remote");
  const [skillsHint, setSkillsHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [atsScore, setAtsScore] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [recommendedRoles, setRecommendedRoles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [coverLetters, setCoverLetters] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_title", targetTitle);
    formData.append("target_location", targetLocation);
    formData.append("skills_hint", skillsHint);

    try {
      const response = await fetch("http://localhost:8000/api/job/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please check the backend connection and API keys.");
      }

      const data = await response.json();
      setAtsScore(data.ats_score);
      setFeedback(data.feedback);
      setRecommendedRoles(data.recommended_roles);
      setJobs(data.jobs);
      setCoverLetters(data.cover_letters);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen bg-slate-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        💼 Job Assistant & Resume Matcher
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Resume Upload */}
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Upload Resume
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <p className="text-gray-500 mb-2 font-medium">
              {file ? `📄 ${file.name}` : "Drag & Drop Resume Here or Click to Browse"}
            </p>
            <p className="text-xs text-gray-400">Supports PDF, DOCX, TXT</p>
          </div>
        </div>

        {/* Search Parameters */}
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Target Preferences
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Target Title</label>
                <input
                  type="text"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Target Location</label>
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Skills Hint (Optional)</label>
              <input
                type="text"
                value={skillsHint}
                onChange={(e) => setSkillsHint(e.target.value)}
                placeholder="e.g. Python, React, LLMs"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Analyzing Profile & Searching Jobs..." : "Find Matching Jobs & Analyze Resume"}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {atsScore !== null && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ATS Score Card */}
            <div className="bg-white p-6 rounded-xl shadow border border-slate-100 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">ATS Compatibility</h2>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${atsScore}%` }}
                ></div>
              </div>
              <p className="text-4xl font-bold mt-4 text-green-600">{atsScore}%</p>
              <p className="text-sm text-gray-500 mt-1">
                {atsScore >= 80 ? "Excellent compatibility with applicant tracking systems." : "Consider adding keywords from job descriptions."}
              </p>
            </div>

            {/* Recommended Roles */}
            <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Recommended Roles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendedRoles.map((roleObj, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
                    <h3 className="font-bold text-sm text-gray-800">{roleObj.role}</h3>
                    <p className="mt-2 text-blue-600 font-semibold text-lg">{roleObj.match}% Match</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Resume Analysis & Feedback</h2>
            <ul className="space-y-3">
              {feedback.map((point, idx) => (
                <li key={idx} className="border border-slate-100 p-3 rounded-lg bg-slate-50 text-sm text-gray-700">
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Job Postings */}
          <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Live Job Postings (via Tavily)</h2>
            {jobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-gray-500 font-medium">
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Why Fit?</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-gray-700">
                    {jobs.map((job, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">{job.company || "—"}</td>
                        <td className="py-3 px-4">{job.title || "—"}</td>
                        <td className="py-3 px-4">{job.location || "—"}</td>
                        <td className="py-3 px-4 text-xs italic text-gray-500">{job["Good Match"] || job.why_fit || "—"}</td>
                        <td className="py-3 px-4">
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Apply
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No live job postings matching your query were found or Tavily key is not configured.</p>
            )}
          </div>

          {/* Cover Letters */}
          <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Generated Cover Letters</h2>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-96">
              {coverLetters}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobAssistant;