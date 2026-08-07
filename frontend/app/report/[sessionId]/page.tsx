export default function ReportPage() {
  const questionFeedback = [
    {
      question: "Tell me about yourself and your background.",
      answer: "I'm a final year CS student...",
      feedback: "Good structure, but be more specific about your key projects.",
    },
    {
      question: "Explain the difference between REST and GraphQL.",
      answer: "REST uses multiple endpoints...",
      feedback: "Correct core concept, missing mention of over-fetching/under-fetching.",
    },
    {
      question: "Describe a challenging project you worked on.",
      answer: "I built a...",
      feedback: "Strong example, communicate the outcome more clearly next time.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        {/* Overall score */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center mb-4">
          <p className="text-sm text-gray-500 mb-1">Overall Score</p>
          <p className="text-4xl font-semibold">78%</p>
        </div>

        {/* Sub-scores */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-1">Technical</p>
            <p className="text-xl font-semibold">82%</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-1">Communication</p>
            <p className="text-xl font-semibold">74%</p>
          </div>
        </div>

        {/* Question-wise feedback */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-3">Question-wise feedback</p>
          {questionFeedback.map((item, i) => (
            <div key={i} className="py-3 border-b border-gray-100 last:border-none">
              <p className="text-sm font-medium mb-1">{item.question}</p>
              <p className="text-xs text-gray-500 mb-1">Your answer: {item.answer}</p>
              <p className="text-xs text-blue-600">{item.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}