"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAssessment } from "@/hooks/use-assessment";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GraphVisualization,
  type GraphData,
} from "@/components/ui/graph-visualization";

// Dynamically import ReactDiffViewer to avoid SSR issues
const ReactDiffViewer = dynamic(() => import("react-diff-viewer"), {
  ssr: false,
});

export default function RepairDetail() {
  const params = useParams();
  const assessmentId = params.id as string;
  const showTooltips = true;
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

  // Helper function to strip markdown code block formatting and normalize indentation
  const stripMarkdownCodeBlock = (code: string) => {
    // Remove opening ```language and closing ```
    const lines = code.split("\n");
    let startIndex = 0;
    let endIndex = lines.length;

    // Find and remove opening ```language line
    if (lines[0] && lines[0].trim().startsWith("```")) {
      startIndex = 1;
    }

    // Find and remove closing ``` line
    if (lines[lines.length - 1] && lines[lines.length - 1].trim() === "```") {
      endIndex = lines.length - 1;
    }

    return lines.slice(startIndex, endIndex).join("\n");
  };

  // Helper function to aggressively normalize whitespace for better diff comparison
  const normalizeWhitespace = (code: string) => {
    const lines = code.split("\n");

    // Process each line to normalize whitespace
    const normalizedLines = lines.map((line) => {
      // If line is empty or only whitespace, keep it as empty
      if (line.trim().length === 0) return "";

      // Replace all sequences of whitespace with single spaces
      // and trim leading/trailing whitespace
      return line.replace(/\s+/g, " ").trim();
    });

    // Remove trailing empty lines
    while (
      normalizedLines.length > 0 &&
      normalizedLines[normalizedLines.length - 1] === ""
    ) {
      normalizedLines.pop();
    }

    // Remove leading empty lines
    while (normalizedLines.length > 0 && normalizedLines[0] === "") {
      normalizedLines.shift();
    }

    return normalizedLines.join("\n");
  };

  // Transform evaluation scores to match the expected format
  // Helper function to get pattern_id without underscore part
  const getPatternIdBase = (patternId: string) => {
    const parts = patternId.split("_");
    return parts.slice(0, -1).join("_");
  };

  const evaluationMetrics = [
    {
      name: "Relevance",
      scoreKey: "Relevance Score",
      value: assessment.evaluation_scores["Relevance Score"] || 0,
      reason: assessment.evaluation_reasons?.["Relevance Score"],
    },
    {
      name: "Correctness",
      scoreKey: "Correctness Score",
      value: assessment.evaluation_scores["Correctness Score"] || 0,
      reason: assessment.evaluation_reasons?.["Correctness Score"],
    },
    {
      name: "Completeness",
      scoreKey: "Completeness Score",
      value: assessment.evaluation_scores["Completeness Score"] || 0,
      reason: assessment.evaluation_reasons?.["Completeness Score"],
    },
    {
      name: "Id. of Vulnerable Code",
      scoreKey: "Identification of Vulnerable Code Score",
      value:
        assessment.evaluation_scores[
          "Identification of Vulnerable Code Score"
        ] || 0,
      reason:
        assessment.evaluation_reasons?.[
          "Identification of Vulnerable Code Score"
        ],
    },
    {
      name: "Code Guidance",
      scoreKey: "Code Guidance Score",
      value: assessment.evaluation_scores["Code Guidance Score"] || 0,
      reason: assessment.evaluation_reasons?.["Code Guidance Score"],
    },
  ];

  return (
    <div className="space-y-8 max-w-8xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900">
        Repair for {assessment.cve_id}
      </h1>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-black text-white text-sm hover:bg-gray-800 font-bold px-3 py-1.5 rounded-3xl">
          {assessment.cve_id.toUpperCase()}
        </Badge>
        <Badge className="bg-black text-white text-sm hover:bg-gray-800 font-bold px-3 py-1.5 rounded-3xl">
          {assessment.cwe_id.toUpperCase()}
        </Badge>
        <Badge className="bg-black text-white text-sm hover:bg-gray-800 font-bold px-3 py-1.5 rounded-3xl">
          {assessment.model_id.toUpperCase()}
        </Badge>
        {assessment.pattern_id && (
          <Badge className="bg-black text-white text-sm hover:bg-gray-800 font-bold px-3 py-1.5 rounded-3xl">
            {getPatternIdBase(assessment.pattern_id).toUpperCase()}
          </Badge>
        )}
      </div>

      <div className="pt-8">
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-fit grid-cols-2 bg-black">
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300 hover:text-white cursor-pointer"
            >
              Results
            </TabsTrigger>
            <TabsTrigger
              value="data"
              disabled={!assessment.graph_visualization}
              className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-500 cursor-pointer"
            >
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-8 mt-6">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Evaluation Results
              </h2>
              <TooltipProvider>
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
                      <dt className="text-md/6 font-medium text-gray-500">
                        {metric.name}
                      </dt>
                      <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                        {showTooltips && metric.reason ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {metric.value.toFixed(2)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="bottom"
                              align="center"
                              sideOffset={10}
                              className="max-w-md bg-gray-900 text-white border border-gray-700 shadow-lg"
                            >
                              <p className="text-sm">{metric.reason}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span>{metric.value.toFixed(2)}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </TooltipProvider>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4 pt-3">
                Recommendation for Repairing {assessment.cve_id}
              </h2>
              <div className="bg-white rounded-xl border border-gray-900/5 p-6">
                <div className="prose prose-gray max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {children}
                        </p>
                      ),
                      code: ({ children, className }) => {
                        return className?.includes("language-") ? (
                          <code className="block bg-gray-100 rounded-md p-4 text-sm overflow-x-auto font-mono">
                            {children}
                          </code>
                        ) : (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 rounded-md overflow-x-auto mb-4">
                          {children}
                        </pre>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-outside text-gray-700 mb-4 space-y-1 pl-6">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-outside text-gray-700 mb-4 space-y-1 pl-6">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-700">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-blue-600 hover:text-blue-800 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {assessment.recommendation}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4 pt-3">
                Repaired Code
              </h2>
              <div className="bg-white rounded-xl border border-gray-900/5 p-6">
                <ReactDiffViewer
                  oldValue={normalizeWhitespace(assessment.vulnerable_code)}
                  newValue={normalizeWhitespace(
                    stripMarkdownCodeBlock(assessment.fixed_code)
                  )}
                  splitView={true}
                  hideLineNumbers={false}
                  showDiffOnly={false}
                  leftTitle="Original Code"
                  rightTitle="Repaired Code"
                  useDarkTheme={true}
                  disableWordDiff={true}
                  styles={{
                    variables: {
                      light: {
                        codeFoldGutterBackground: "#f8f9fa",
                        codeFoldBackground: "#f1f3f4",
                        addedBackground: "#e6ffed",
                        addedColor: "#24292e",
                        removedBackground: "#ffeef0",
                        removedColor: "#24292e",
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
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Knowledge Graph Visualization
              </h2>
              {assessment.graph_visualization ? (
                <div className="bg-white rounded-xl border border-gray-900/5 p-6">
                  <GraphVisualization
                    data={assessment.graph_visualization as GraphData}
                    width={900}
                    height={600}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">
                    No graph visualization data available for this assessment.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
