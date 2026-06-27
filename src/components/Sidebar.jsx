import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `block p-3 rounded-lg transition-all ${
      isActive ? "bg-slate-700 font-bold text-white shadow-sm" : "hover:bg-slate-850 text-slate-300 hover:text-white"
    }`;
  };

  return (
    <div className="w-64 bg-slate-900 text-white p-6 flex flex-col border-r border-slate-800">
      <h1 className="text-2xl font-bold mb-10 flex items-center gap-2">
        🎓 AI Portal
      </h1>

      <ul className="space-y-3">
        <li>
          <Link to="/" className={getLinkClass("/")}>
            Dashboard
          </Link>
        </li>

        <li>
          <Link to="/college" className={getLinkClass("/college")}>
            College Assistant
          </Link>
        </li>

        <li>
          <Link to="/job" className={getLinkClass("/job")}>
            Job Assistant
          </Link>
        </li>

        <li>
          <Link to="/interview" className={getLinkClass("/interview")}>
            Interview Prep
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;