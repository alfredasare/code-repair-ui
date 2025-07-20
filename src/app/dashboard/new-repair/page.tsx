"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUserSettings } from "@/hooks/use-settings";
import {
  useQuery,
  useGenerateRecommendation,
  useGenerateFix,
  useEvaluate,
  useStoreResults,
} from "@/hooks/use-assessment";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { AssessmentAPI } from "@/lib/api/assessment";
import { useRouter } from "next/navigation";

const schema = yup.object({
  cweId: yup
    .string()
    .required("CWE ID is required")
    .matches(/^\d+$/, "CWE ID must be a number"),
  cveId: yup
    .string()
    .required("CVE ID is required")
    .matches(/^\d+-\d+$/, "CVE ID must be two numbers separated by a hyphen"),
  codeSnippet: yup.string().required("Code snippet is required"),
});

export default function NewAssessment() {
  const { data: userSettings } = useUserSettings();
  const queryMutation = useQuery();
  const generateRecommendationMutation = useGenerateRecommendation();
  const generateFixMutation = useGenerateFix();
  const evaluateMutation = useEvaluate();
  const storeResultsMutation = useStoreResults();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: {
    cweId: string;
    cveId: string;
    codeSnippet: string;
  }) => {
    if (!userSettings) {
      console.error("User settings not available");
      return;
    }

    const cweId = `CWE-${data.cweId}`;
    const cveId = `CVE-${data.cveId}`;

    try {
      // Step 1: Query the database
      const queryData = {
        pattern_id: userSettings.pattern_id,
        cwe_id: cweId,
        cve_id: cveId,
        additional_params: {
          top_k: userSettings.retrievalK,
        },
      };

      const queryResult = await queryMutation.mutateAsync(queryData);

      // Step 2: Generate recommendation using the retrieved context
      const recommendationData = {
        model_type: AssessmentAPI.getModelType(userSettings.model_id),
        model_id: userSettings.model_id,
        vulnerable_code: data.codeSnippet,
        cwe_id: cweId,
        cve_id: cveId,
        retrieved_context: queryResult.results.formatted_results || "",
      };

      const recommendationResult =
        await generateRecommendationMutation.mutateAsync(recommendationData);

      // Step 3: Generate fix using the recommendation
      const fixData = {
        model_type: AssessmentAPI.getModelType(userSettings.model_id),
        model_id: userSettings.model_id,
        vulnerable_code: data.codeSnippet,
        cwe_id: cweId,
        cve_id: cveId,
        recommendation: recommendationResult.recommendation,
      };

      const fixResult = await generateFixMutation.mutateAsync(fixData);

      // Step 4: Evaluate the assessment
      const evaluateData = {
        vulnerable_code: data.codeSnippet,
        cwe_id: cweId,
        cve_id: cveId,
        recommendation: recommendationResult.recommendation,
        retrieved_context: queryResult.results.formatted_results || "",
        model: "gpt-4o-mini",
      };

      const evaluateResult = await evaluateMutation.mutateAsync(evaluateData);

      // Step 5: Store the results
      const storeData = {
        scores: evaluateResult.scores,
        recommendation: recommendationResult.recommendation,
        vulnerable_code: data.codeSnippet,
        fixed_code: fixResult.fixed_code,
        cwe_id: cweId,
        cve_id: cveId,
        model_id: userSettings.model_id,
      };

      const storeResult = await storeResultsMutation.mutateAsync(storeData);

      // Redirect to the repair detail page
      router.push(`/dashboard/repair/${storeResult.assessment_id}`);
    } catch (error) {
      console.error("Assessment workflow failed:", error);
    }
  };

  const handleReset = () => {
    reset();
  };

  // Show loading screen with appropriate message
  if (queryMutation.isPending) {
    return <FullScreenLoader text="Querying database for CWE and CVE..." />;
  }

  if (generateRecommendationMutation.isPending) {
    return (
      <FullScreenLoader text="Generating recommendations for vulnerable code..." />
    );
  }

  if (generateFixMutation.isPending) {
    return <FullScreenLoader text="Generating code fix..." />;
  }

  if (evaluateMutation.isPending) {
    return <FullScreenLoader text="Evaluating repair recommendations..." />;
  }

  if (storeResultsMutation.isPending) {
    return <FullScreenLoader text="Finalizing results..." />;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">New Repair</h1>
        <p className="text-md text-gray-600 leading-7">
          Provide a CWE ID, CVE ID, and code snippet to generate an automated
          repair assessment based on our knowledge base data.
        </p>
      </div>

      <form
        id="assessment-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* CWE ID Field */}
        <div>
          <label
            htmlFor="cwe-id"
            className="block text-sm/6 font-medium text-gray-900"
          >
            CWE ID
          </label>
          <div className="mt-2">
            <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-black">
              <div className="shrink-0 text-base text-gray-500 select-none sm:text-sm/6">
                CWE-
              </div>
              <input
                id="cwe-id"
                type="text"
                placeholder="119"
                {...register("cweId")}
                className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
              />
            </div>
            <div className="h-5">
              {errors.cweId && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.cweId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CVE ID Field */}
        <div>
          <label
            htmlFor="cve-id"
            className="block text-sm/6 font-medium text-gray-900"
          >
            CVE ID
          </label>
          <div className="mt-2">
            <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-black">
              <div className="shrink-0 text-base text-gray-500 select-none sm:text-sm/6">
                CVE-
              </div>
              <input
                id="cve-id"
                type="text"
                placeholder="2025-88364"
                {...register("cveId")}
                className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
              />
            </div>
            <div className="h-5">
              {errors.cveId && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.cveId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Code Snippet Field */}
        <div>
          <label
            htmlFor="code-snippet"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Code Snippet
          </label>
          <div className="mt-2">
            <textarea
              id="code-snippet"
              rows={5}
              placeholder="Paste your code snippet here..."
              {...register("codeSnippet")}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
            />
            <div className="h-5">
              {errors.codeSnippet && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.codeSnippet.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="bg-black text-white hover:bg-gray-800 focus:ring-black"
          >
            Submit Assessment
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
