import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import CollegeAssistant from "./pages/CollegeAssistant";
import JobAssistant from "./pages/JobAssistant";
import InterviewPrep from "./pages/InterviewPrep";

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-100">

        <Sidebar />

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/college"
            element={<CollegeAssistant />}
          />

          <Route
            path="/job"
            element={<JobAssistant />}
          />

          <Route
            path="/interview"
            element={<InterviewPrep />}
          />

        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;