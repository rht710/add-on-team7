import { useState } from "react";

const EVENTS = [
  { date: "2024-08-24", title: "Fall Semester Starts" },
  { date: "2024-10-12", title: "Mid-Term Examinations" },
  { date: "2024-10-13", title: "Mid-Term Examinations" },
  { date: "2024-10-14", title: "Mid-Term Examinations" },
  { date: "2024-10-15", title: "Mid-Term Examinations" },
  { date: "2024-10-16", title: "Mid-Term Examinations" },
  { date: "2024-12-07", title: "Final Semester Examinations" },
];

function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth(currentDate); i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth(currentDate); i++) {
    days.push(i);
  }

  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return EVENTS.filter(event => event.date === dateStr);
  };

  const isToday = (day) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Previous month"
          >
            &lt;
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Next month"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-semibold text-slate-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const events = day ? getEventsForDate(day) : [];
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              className={`min-h-24 p-2 rounded-lg border transition-colors ${
                isCurrentDay
                  ? "bg-blue-50 border-blue-300"
                  : day
                  ? "border-slate-200 hover:bg-slate-50"
                  : "border-transparent"
              }`}
            >
              {day && (
                <>
                  <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? "text-blue-600" : "text-slate-700"}`}>
                    {day}
                  </div>
                  {events.length > 0 && (
                    <div className="space-y-1">
                      {events.map((event, i) => (
                        <div
                          key={i}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded truncate"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
