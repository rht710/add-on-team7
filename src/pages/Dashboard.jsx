import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";

function Dashboard() {
  const navigate = useNavigate();
  const [docCount, setDocCount] = useState(0);

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

      {/* Dynamic Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Indexed Documents" value={docCount.toString()} />
        <StatCard title="Active Companies" value="45+" />
        <StatCard title="Practice Questions" value="15+" />
        <StatCard title="Average CTC (LPA)" value="8.5" />
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
            <li className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">Google Internship Drive</p>
                <p className="text-xs text-slate-500 mt-0.5">Software Engineering & AI Internships</p>
              </div>
              <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-150">Active</span>
            </li>
            <li className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">Microsoft Hiring Event</p>
                <p className="text-xs text-slate-500 mt-0.5">Full Stack & ML Engineering Roles</p>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-150">Upcoming</span>
            </li>
            <li className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">Amazon Campus Recruitment</p>
                <p className="text-xs text-slate-500 mt-0.5">Cloud Support & Operations Engineers</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Closed</span>
            </li>
          </ul>
        </div>

        {/* Academic Calendar Events */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            📅 Academic & Event Timeline
          </h2>
          <ul className="space-y-3">
            <li className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 flex gap-4 items-center">
              <div className="bg-blue-50 text-blue-700 font-bold p-2.5 rounded-xl text-center min-w-[55px]">
                <p className="text-[10px] uppercase tracking-wider">Aug</p>
                <p className="text-sm">24</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Fall Semester Starts</p>
                <p className="text-xs text-slate-500 mt-0.5">Orientation and commencement of regular classes</p>
              </div>
            </li>
            <li className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 flex gap-4 items-center">
              <div className="bg-blue-50 text-blue-700 font-bold p-2.5 rounded-xl text-center min-w-[55px]">
                <p className="text-[10px] uppercase tracking-wider">Oct</p>
                <p className="text-sm">12</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Mid-Term Examinations</p>
                <p className="text-xs text-slate-500 mt-0.5">Running from Oct 12 to Oct 16 across all branches</p>
              </div>
            </li>
            <li className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 flex gap-4 items-center">
              <div className="bg-blue-50 text-blue-700 font-bold p-2.5 rounded-xl text-center min-w-[55px]">
                <p className="text-[10px] uppercase tracking-wider">Dec</p>
                <p className="text-sm">07</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Final Semester Examinations</p>
                <p className="text-xs text-slate-500 mt-0.5">End-semester theory and practical exams</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;