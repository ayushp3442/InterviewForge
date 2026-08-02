export default function DashboardPage() {
  const recentActivity = [
    { type: "Technical — Backend role", date: "Jul 28", score: 78 },
    { type: "HR — General", date: "Jul 25", score: 65 },
    { type: "Technical — Frontend role", date: "Jul 21", score: 74 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Top nav */}
        <div className="flex justify-between items-center bg-white rounded-xl px-4 py-3 mb-4 shadow-sm border border-gray-200">
          <p className="font-medium text-sm">InterviewForge AI</p>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
            KR
          </div>
        </div>

        {/* Start interview button */}
        <button className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium mb-4">
          Start new interview
        </button>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total interviews</p>
            <p className="text-xl font-semibold">7</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Average score</p>
            <p className="text-xl font-semibold">72%</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Latest score</p>
            <p className="text-xl font-semibold">81%</p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-3">Recent activity</p>
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-none"
            >
              <span>{item.type}</span>
              <span className="text-gray-500">{item.date} · {item.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}