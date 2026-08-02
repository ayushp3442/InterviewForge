"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const scoreHistory = [
  { date: "Jul 10", score: 60 },
  { date: "Jul 14", score: 68 },
  { date: "Jul 18", score: 65 },
  { date: "Jul 21", score: 74 },
  { date: "Jul 25", score: 65 },
  { date: "Jul 28", score: 78 },
  { date: "Aug 1", score: 81 },
];

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Score trend chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
          <p className="text-sm font-medium text-gray-600 mb-3">Score trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scoreHistory}>
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#111827" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* History list */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-3">Interview history</p>
          {scoreHistory.slice().reverse().map((item, i) => (
            <div
              key={i}
              className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-none"
            >
              <span>{item.date}</span>
              <span className="text-gray-700 font-medium">{item.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}