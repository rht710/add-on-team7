import StatCard from "../components/StatCard";
import Calendar from "../components/Calendar";

function Dashboard() {
  return (
    <div className="flex-1 p-8 overflow-auto">

      <h1 className="text-4xl font-bold mb-8">
        🎓 AI Campus & Career Assistant
      </h1>

      {/* Stats */}

      <div className="grid grid-cols-4 gap-6">

        <StatCard title="Documents" value="120" />
        <StatCard title="Events" value="8" />
        <StatCard title="Companies" value="45" />
        <StatCard title="Students" value="500+" />

      </div>

      {/* Placement Updates & Academic Calendar */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">
            Placement Updates
          </h2>

          <ul className="space-y-3">

            <li className="border p-3 rounded">
              Google Internship Drive
            </li>

            <li className="border p-3 rounded">
              Microsoft Hiring Event
            </li>

            <li className="border p-3 rounded">
              Amazon Campus Recruitment
            </li>

          </ul>

        </div>

        <div>
          <Calendar />
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
