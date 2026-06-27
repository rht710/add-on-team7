import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "College Assistant", to: "/college" },
  { label: "Job Assistant", to: "/job" },
  { label: "Interview Prep", to: "/interview" },
];

function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white p-6">

      <h1 className="text-2xl font-bold mb-10">
        🎓 AI Portal
      </h1>

      <ul className="space-y-4">

        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block p-3 rounded-lg transition-colors ${
                  isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}

      </ul>
    </div>
  );
}

export default Sidebar;
