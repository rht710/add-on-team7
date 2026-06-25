import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white p-6">

      <h1 className="text-2xl font-bold mb-10">
        🎓 AI Portal
      </h1>

      <ul className="space-y-4">

        <li>
          <Link
            to="/"
            className="block p-3 rounded-lg bg-slate-700"
          >
            Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/college"
            className="block p-3 rounded-lg hover:bg-slate-800"
          >
            College Assistant
          </Link>
        </li>

        <li>
          <Link
            to="/job"
            className="block p-3 rounded-lg hover:bg-slate-800"
          >
            Job Assistant
          </Link>
        </li>

        <li>
          <Link
            to="/interview"
            className="block p-3 rounded-lg hover:bg-slate-800"
          >
            Interview Prep
          </Link>
        </li>

      </ul>
    </div>
  );
}

export default Sidebar;