"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAssessment } from "@/hooks/use-assessment";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import ReactDiffViewer to avoid SSR issues
const ReactDiffViewer = dynamic(() => import("react-diff-viewer"), {
  ssr: false,
});

export default function RepairDetail() {
  const params = useParams();
  const assessmentId = params.id as string;
  const {
    data: assessment,
    isLoading,
    error,
    isFetched,
  } = useAssessment(assessmentId);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Page Title Skeleton */}
        <Skeleton className="h-9 w-80 bg-gray-200" />

        {/* Evaluation Results Section */}
        <div>
          <Skeleton className="h-7 w-48 mb-4 bg-gray-200" />
          <div className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-5 border border-gray-900/5 rounded-xl">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`flex flex-wrap flex-col items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8 ${
                  index === 0
                    ? "rounded-l-xl"
                    : index === 4
                    ? "rounded-r-xl"
                    : ""
                }`}
              >
                <Skeleton className="h-4 w-20 bg-gray-200" />
                <Skeleton className="h-8 w-12 bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Section */}
        <div>
          <Skeleton className="h-7 w-40 mb-4 bg-gray-200" />
          <div className="bg-white rounded-xl border border-gray-900/5 p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-3/4 bg-gray-200" />
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-5/6 bg-gray-200" />
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-2/3 bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Repaired Code Section */}
        <div>
          <Skeleton className="h-7 w-36 mb-4 bg-gray-200" />
          <div className="bg-white rounded-xl border border-gray-900/5 p-6">
            <Skeleton className="h-64 w-full bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Assessment Not Found
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Failed to load assessment details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (isFetched && !assessment) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Assessment Not Found
        </h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">
            The requested assessment could not be found.
          </p>
        </div>
      </div>
    );
  }

  // TypeScript guard - this should never happen given our state management above
  if (!assessment) {
    return null;
  }

  // Transform evaluation scores to match the expected format
  const evaluationMetrics = [
    {
      name: "Relevance",
      value: assessment.evaluation_scores["Relevance Score"] || 0,
    },
    {
      name: "Correctness",
      value: assessment.evaluation_scores["Correctness Score"] || 0,
    },
    {
      name: "Completeness",
      value: assessment.evaluation_scores["Completeness Score"] || 0,
    },
    {
      name: "Id. of Vulnerable Code",
      value:
        assessment.evaluation_scores[
          "Identification of Vulnerable Code Score"
        ] || 0,
    },
    {
      name: "Code Guidance",
      value: assessment.evaluation_scores["Code Guidance Score"] || 0,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Repair for {assessment.cve_id}
      </h1>

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
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {assessment.recommendation}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Repaired Code
        </h2>
        <div className="bg-white rounded-xl border border-gray-900/5 p-6">
          <ReactDiffViewer
            oldValue={assessment.vulnerable_code}
            newValue={assessment.fixed_code}
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
