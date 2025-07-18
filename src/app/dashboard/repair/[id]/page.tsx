"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import ReactDiffViewer to avoid SSR issues
const ReactDiffViewer = dynamic(() => import("react-diff-viewer"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded"></div>,
});

// Sample data for evaluation metrics
const evaluationMetrics = [
  { name: "Relevance", value: 0.87 },
  { name: "Correctness", value: 0.92 },
  { name: "Completeness", value: 0.78 },
  { name: "Id. of Vulnerable Code", value: 0.85 },
  { name: "Code Guidance", value: 0.91 },
];

// Sample code data for diff viewer
const oldCode = `const a = 10
const b = 10
const c = () => console.log('foo')

if(a > 10) {
  console.log('bar')
}

console.log('done')`;

const newCode = `const a = 10
const boo = 10

if(a === 10) {
  console.log('bar')
}`;

export default function RepairDetail() {
  const params = useParams();
  const repairId = params.id as string;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Repair {repairId}</h1>

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

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Repaired Code
        </h2>
        <div className="bg-white rounded-xl border border-gray-900/5 p-6">
          <ReactDiffViewer
            oldValue={oldCode}
            newValue={newCode}
            splitView={true}
            hideLineNumbers={false}
            showDiffOnly={false}
            leftTitle="Original Code"
            rightTitle="Repaired Code"
            useDarkTheme={true}
            styles={{
              variables: {
                light: {
                  codeFoldGutterBackground: "#f8f9fa",
                  codeFoldBackground: "#f1f3f4",
                  addedBackground: "#e6ffed",
                  addedColor: "#24292e",
                  removedBackground: "#ffeef0",
                  removedColor: "#24292e",
                  wordAddedBackground: "#acf2bd",
                  wordRemovedBackground: "#fdb8c0",
                  addedGutterBackground: "#cdffd8",
                  removedGutterBackground: "#fdbbc4",
                  gutterBackground: "#f6f8fa",
                  gutterBackgroundDark: "#f0f0f0",
                  highlightBackground: "#fffbdd",
                  highlightGutterBackground: "#fff5b4",
                },
                // dark: {
                //   codeFoldGutterBackground: "#2d333b",
                //   codeFoldBackground: "#22272e",
                //   addedBackground: "#238636",
                //   addedColor: "#aff5b4",
                //   removedBackground: "#da3633",
                //   removedColor: "#ffdcd7",
                //   wordAddedBackground: "#2ea043",
                //   wordRemovedBackground: "#da3633",
                //   addedGutterBackground: "#033a16",
                //   removedGutterBackground: "#67060c",
                //   gutterBackground: "#2d333b",
                //   gutterBackgroundDark: "#22272e",
                //   highlightBackground: "#373e47",
                //   highlightGutterBackground: "#444c56",
                //   diffViewerBackground: "#0d1117",
                //   diffViewerColor: "#f0f6fc",
                // },
              },
              line: {
                padding: "8px 2px",
                fontSize: "13px",
                fontFamily:
                  "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                "&:hover": {
                  background: "#444c56",
                },
              },
              marker: {
                fontSize: "11px",
              },
              contentText: {
                fontSize: "13px",
                lineHeight: "1.45",
                fontFamily:
                  "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
              },
              gutter: {
                fontSize: "12px",
                fontFamily:
                  "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
