"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const llmModels = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "deepseek", label: "Deepseek" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
  { value: "gemini-pro", label: "Gemini Pro" },
];

const patterns = [
  {
    id: "metapath",
    name: "MetaPath",
    description:
      "Graph-based semantic path analysis for vulnerability detection",
  },
  {
    id: "knn",
    name: "KNN",
    description:
      "K-nearest neighbors similarity matching for code repair patterns",
  },
  {
    id: "pagerank",
    name: "PageRank",
    description: "Ranking algorithm for prioritizing repair recommendations",
  },
];

export default function Settings() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Settings</h1>
        <p className="text-md text-gray-600 leading-7">
          Configure your repair assessment preferences and model settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* LLM Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            LLM Model
          </label>
          <Select defaultValue="gpt-4o">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {llmModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pattern Selection */}
        <div>
          <fieldset aria-label="Pattern selection">
            <legend className="block text-sm font-medium text-gray-900 mb-3">
              Pattern
            </legend>
            <div className="space-y-4">
              {patterns.map((pattern) => (
                <label
                  key={pattern.id}
                  aria-label={pattern.name}
                  aria-description={pattern.description}
                  className="group relative block rounded-lg border border-gray-300 bg-white px-6 py-4 has-checked:outline-2 has-checked:-outline-offset-2 has-checked:outline-black has-focus-visible:outline-3 has-focus-visible:-outline-offset-1 sm:flex sm:justify-between"
                >
                  <input
                    defaultValue={pattern.id}
                    defaultChecked={pattern.id === "metapath"}
                    name="pattern"
                    type="radio"
                    className="absolute inset-0 appearance-none focus:outline-none"
                  />
                  <span className="flex items-center">
                    <span className="flex flex-col text-sm">
                      <span className="font-medium text-gray-900">
                        {pattern.name}
                      </span>
                      <span className="text-gray-500">
                        <span className="block sm:inline">
                          {pattern.description}
                        </span>
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Retrieval top-K */}
        <div>
          <label
            htmlFor="retrieval-k"
            className="block text-sm font-medium text-gray-900 mb-3"
          >
            Retrieval top-K
          </label>
          <Input
            id="retrieval-k"
            name="retrieval-k"
            type="number"
            min={1}
            max={10}
            defaultValue={5}
            className="w-full"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="bg-black text-white hover:bg-gray-800 focus:ring-black"
          >
            Save Settings
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset to Default
          </Button>
        </div>
      </form>
    </div>
  );
}
