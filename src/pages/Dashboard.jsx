import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";

function Dashboard() {
  const navigate = useNavigate();
  const [docCount, setDocCount] = useState(0);
  const [collegeName, setCollegeName] = useState("");
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [scrapError, setScrapError] = useState("");
  const [sources, setSources] = useState([]);

  // Default Mock/Initial Placement Updates
  const [placements, setPlacements] = useState([
    { title: "Google Internship Drive", description: "Software Engineering & AI Internships", status: "Active" },
    { title: "Microsoft Hiring Event", description: "ML & Full Stack Engineering Roles", status: "Upcoming" },
    { title: "Amazon Campus Recruitment", description: "Cloud Support & Operations Engineers", status: "Closed" }
  ]);

  // Default Mock/Initial Academic & Event Calendar
  const [events, setEvents] = useState([
    { month: "Aug", day: "24", title: "Fall Semester Starts", description: "Orientation and commencement of regular classes" },
    { month: "Oct", day: "12", title: "Mid-Term Examinations", description: "Running from Oct 12 to Oct 16 across all branches" },
    { month: "Dec", day: "07", title: "Final Semester Examinations", description: "End-semester theory and practical exams" }
  ]);

  const [activeCompanies, setActiveCompanies] = useState("45+");
  const [averageCtc, setAverageCtc] = useState("8.5");

  useEffect(() => {
    // Fetch dynamic documents count from backend
    const fetchDocCount = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/college/indexed-files");
        if (response.ok) {
          const data = await response.json();
          setDocCount(data.indexed_files ? data.indexed_files.length : 0);
        }
      } catch (err) {
        console.error("Failed to fetch documents count on dashboard", err);
      }
    };
    fetchDocCount();
  }, []);

  const handleFetchUpdates = async () => {
    if (!collegeName.trim()) {
      setScrapError("Please enter a college name first.");
      return;
    }

    setLoadingUpdates(true);
    setScrapError("");

    try {
      const response = await fetch(`http://localhost:8000/api/college/scrape-updates?college_name=${encodeURIComponent(collegeName)}`);
      if (!response.ok) throw new Error("Failed to query live scraper.");
      
      const data = await response.json();
      if (data.placements && data.placements.length > 0) {
        setPlacements(data.placements);
      }
      if (data.events && data.events.length > 0) {
        setEvents(data.events);
      }
      if (data.active_companies) {
        setActiveCompanies(data.active_companies);
      }
      if (data.average_ctc) {
        setAverageCtc(data.average_ctc);
      }
      setSources(data.sources || []);
    } catch (err) {
      console.error(err);
      setScrapError("Failed to fetch live updates. Using default guidelines.");
      setSources([]);
    } finally {
      setLoadingUpdates(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            🎓 AI Campus & Career Assistant
          </h1>
          <p className="text-blue-100 mt-2 max-w-xl text-sm md:text-base leading-relaxed">
            Welcome to your unified workspace. Manage college guidelines, track key campus events, analyze job profiles, and prepare for technical interviews.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
          <span className="text-9xl font-bold">AI</span>
        </div>
      </div>

      {/* Target College Scraper Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm mb-8">
        <h2 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
          🔍 Target College Live Updates
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Enter your college name or official website URL to scrape live placement drives, fests, and academic updates. Specifying the official website (e.g., iitb.ac.in) restricts scraping to that site for maximum accuracy.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            placeholder="e.g. iitb.ac.in, sjsu.edu, or Stanford University"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleFetchUpdates}
            disabled={loadingUpdates}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition disabled:opacity-50 min-w-[150px]"
          >
            {loadingUpdates ? "Scraping Web..." : "Fetch Live News"}
          </button>
        </div>

        {scrapError && (
          <p className="text-xs text-red-650 font-medium mt-3">⚠️ {scrapError}</p>
        )}
      </div>

      {/* Dynamic Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Indexed Documents" value={docCount.toString()} />
        <StatCard title="Active Companies" value={activeCompanies} />
        <StatCard title="Practice Questions" value="15+" />
        <StatCard title="Average CTC (LPA)" value={averageCtc} />
      </div>

      {/* Feature Navigation Cards */}
      <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Navigation</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => navigate("/college")}
          className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-300 transition duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-2xl">📚</span>
            <h3 className="text-base font-bold text-slate-800 mt-3">College Assistant</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload guidelines, syllabus documents, or event dates and ask the RAG help desk chatbot questions with source verification.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 mt-4 inline-flex items-center gap-1">
            Access Help Desk →
          </span>
        </div>

        <div 
          onClick={() => navigate("/job")}
          className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-300 transition duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-2xl">💼</span>
            <h3 className="text-base font-bold text-slate-800 mt-3">Job Assistant</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload your resume to check its ATS score compatibility, find live matching jobs using Tavily, and generate tailored cover letters.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 mt-4 inline-flex items-center gap-1">
            Find Jobs →
          </span>
        </div>

        <div 
          onClick={() => navigate("/interview")}
          className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-300 transition duration-300 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-2xl">🎤</span>
            <h3 className="text-base font-bold text-slate-800 mt-3">Interview Prep</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Choose your target role (AI Engineer, MLE, Software Engineer, etc.) and generate custom technical interview practice questions.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 mt-4 inline-flex items-center gap-1">
            Practice Questions →
          </span>
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Updates */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            🚀 Campus Placement Updates
          </h2>
          <ul className="space-y-3">
            {placements.map((p, idx) => (
              <li key={idx} className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  p.status === "Active" ? "bg-green-50 text-green-700 border-green-150" :
                  p.status === "Upcoming" ? "bg-amber-50 text-amber-700 border-amber-150" :
                  "bg-slate-100 text-slate-600 border-slate-200"
                }`}>{p.status}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Academic Calendar Events */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            📅 Academic & Event Timeline
          </h2>
          <ul className="space-y-3">
            {events.map((e, idx) => (
              <li key={idx} className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 flex gap-4 items-center">
                <div className="bg-blue-50 text-blue-700 font-bold p-2.5 rounded-xl text-center min-w-[55px]">
                  <p className="text-[10px] uppercase tracking-wider">{e.month}</p>
                  <p className="text-sm">{e.day}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{e.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{e.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sources list for verification */}
      {sources.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            🔗 Verified Search References
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Click the links below to verify the scraped updates directly on the official university/source websites:
          </p>
          <ul className="space-y-1.5">
            {sources.map((url, idx) => (
              <li key={idx} className="text-xs truncate">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 font-medium"
                >
                  🌐 {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;