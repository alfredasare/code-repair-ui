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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const llmModels = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "deepseek", label: "Deepseek" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
  { value: "gemini-pro", label: "Gemini Pro" },
];

const patterns = [
  {
    id: "knn",
    name: "KNN",
    description:
      "K-nearest neighbors similarity matching for code repair patterns",
  },
  {
    id: "metapath",
    name: "MetaPath",
    description:
      "Graph-based semantic path analysis for vulnerability detection",
  },
  {
    id: "pagerank",
    name: "PageRank",
    description: "Ranking algorithm for prioritizing repair recommendations",
  },
];

const defaultValues = {
  llmModel: "gpt-4o",
  pattern: "knn",
  retrievalK: 5,
};

const schema = yup.object({
  llmModel: yup.string().required("LLM Model is required"),
  pattern: yup.string().required("Pattern selection is required"),
  retrievalK: yup
    .number()
    .transform((value, originalValue) => {
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return undefined;
      }
      return isNaN(value) ? undefined : value;
    })
    .required("Retrieval top-K is required")
    .min(1, "Must be at least 1")
    .max(10, "Must be at most 10")
    .integer("Must be a whole number")
    .typeError("Must be a valid number"),
});

export default function Settings() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const onSubmit = (data: {
    llmModel: string;
    pattern: string;
    retrievalK: number;
  }) => {
    console.log(data);
  };

  const handleReset = () => {
    reset(defaultValues);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Settings</h1>
        <p className="text-md text-gray-600 leading-7">
          Configure your repair assessment preferences and model settings.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* LLM Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3 cursor-pointer">
            LLM Model
          </label>
          <Controller
            name="llmModel"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full z-10 cursor-pointer">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-white cursor-pointer">
                  {llmModels.map((model) => (
                    <SelectItem
                      key={model.value}
                      value={model.value}
                      className="cursor-pointer"
                    >
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <div className="h-5">
            {errors.llmModel && (
              <p className="text-sm text-red-600 mt-1">
                {errors.llmModel.message}
              </p>
            )}
          </div>
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
                  className="group relative block rounded-lg border border-gray-300 bg-white px-6 py-4 has-checked:outline-2 has-checked:-outline-offset-2 has-checked:outline-black has-focus-visible:outline-3 has-focus-visible:-outline-offset-1 sm:flex sm:justify-between cursor-pointer"
                >
                  <input
                    value={pattern.id}
                    {...register("pattern")}
                    type="radio"
                    className="absolute inset-0 appearance-none focus:outline-none cursor-pointer"
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
            <div className="h-5">
              {errors.pattern && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.pattern.message}
                </p>
              )}
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
            type="number"
            min={1}
            max={10}
            {...register("retrievalK", { valueAsNumber: true })}
            className="w-full"
          />
          <div className="h-5">
            {errors.retrievalK && (
              <p className="text-sm text-red-600 mt-1">
                {errors.retrievalK.message}
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="bg-black text-white hover:bg-gray-800 focus:ring-black cursor-pointer"
          >
            Save Settings
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Reset to Default
          </Button>
        </div>
      </form>
    </div>
  );
}
