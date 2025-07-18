// Sample data for evaluation metrics
const evaluationMetrics = [
  { name: "Relevance", value: 0.87 },
  { name: "Correctness", value: 0.92 },
  { name: "Completeness", value: 0.78 },
  { name: "Id. of Vulnerable Code", value: 0.85 },
  { name: "Code Guidance", value: 0.91 },
];

export default function RepairHistory() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Repair History</h1>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Evaluation Results
        </h2>
        <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-5 border border-gray-900/5 rounded-xl">
          {evaluationMetrics.map((metric, index) => (
            <div
              key={metric.name}
              className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 ${
                index === 0
                  ? "rounded-l-xl"
                  : index === evaluationMetrics.length - 1
                  ? "rounded-r-xl"
                  : ""
              }`}
            >
              <dt className="text-sm/6 font-medium text-gray-500">
                {metric.name}
              </dt>
              <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                {metric.value.toFixed(2)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recommendation
        </h2>
        <div className="bg-white rounded-xl border border-gray-900/5 p-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            Based on the evaluation results, we recommend focusing on improving
            the completeness of your code repairs. The analysis shows strong
            performance in correctness and code guidance, indicating that your
            repair suggestions are accurate and well-directed. Consider
            implementing more comprehensive vulnerability scanning to enhance
            the identification of vulnerable code patterns. This will help
            achieve better coverage of potential security issues in your
            codebase. Continue leveraging the strong relevance scoring to
            maintain focused and contextually appropriate repair suggestions.
            The high correctness rating demonstrates that your current approach
            is effectively addressing the identified issues.
          </p>
        </div>
      </div>
    </div>
  );
}
