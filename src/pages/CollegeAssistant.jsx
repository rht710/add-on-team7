function CollegeAssistant() {
  return (
    <div className="p-6">
      {/* Chat Area */}
      <div className="bg-white rounded-xl shadow p-6 h-[450px] overflow-y-auto">
        <div className="flex justify-end mb-4">
          <div className="bg-blue-500 text-white p-3 rounded-xl max-w-md">
            What is the attendance policy?
          </div>
        </div>

        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 p-3 rounded-xl max-w-md">
            Students must maintain 75% attendance.
          </div>
        </div>

        {/* Source */}
        <div className="text-sm text-gray-500 mb-4">
          Source: attendance_policy.pdf
        </div>

        {/* Thinking State */}
        <div className="flex justify-start">
          <div className="bg-yellow-100 p-3 rounded-xl">
            Thinking...
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollegeAssistant;