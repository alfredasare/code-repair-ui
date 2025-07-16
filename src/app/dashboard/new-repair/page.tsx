"use client";

import { Button } from "@/components/ui/button";

export default function NewAssessment() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleReset = () => {
    const form = document.getElementById("assessment-form") as HTMLFormElement;
    form?.reset();
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          New Repair
        </h1>
        <p className="text-md text-gray-600 leading-7">
          Provide a CWE ID, CVE ID, and code snippet to generate an automated
          repair assessment based on our knowledge base data.
        </p>
      </div>

      <form id="assessment-form" onSubmit={handleSubmit} className="space-y-6">
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
                name="cwe-id"
                type="text"
                placeholder="119"
                className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
              />
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
                name="cve-id"
                type="text"
                placeholder="2025-88364"
                className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
              />
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
              name="code-snippet"
              rows={5}
              placeholder="Paste your code snippet here..."
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
            />
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
