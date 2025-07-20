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
import {
  useModels,
  usePatterns,
  useUserSettings,
  useCreateUserSettings,
  useUpdateUserSettings,
} from "@/hooks/use-settings";
import { Spinner } from "@/components/ui/spinner";
import React from "react";

// We'll set defaults dynamically when data loads

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
    data: modelsData,
    isLoading: modelsLoading,
    error: modelsError,
  } = useModels();
  const {
    data: patternsData,
    isLoading: patternsLoading,
    error: patternsError,
  } = usePatterns();
  const { data: userSettings, isLoading: userSettingsLoading } =
    useUserSettings();

  const createUserSettings = useCreateUserSettings();
  const updateUserSettings = useUpdateUserSettings();

  // Calculate form defaults
  const formDefaults = React.useMemo(() => {
    if (modelsData?.models.length && patternsData?.patterns.length) {
      return {
        llmModel: userSettings?.model_id || modelsData.models[0].model_id,
        pattern:
          userSettings?.pattern_id || patternsData.patterns[0].pattern_id,
        retrievalK: userSettings?.retrievalK || 5,
      };
    }
    return {
      llmModel: "",
      pattern: "",
      retrievalK: 5,
    };
  }, [modelsData, patternsData, userSettings]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: formDefaults,
  });

  // Reset form when defaults change
  React.useEffect(() => {
    if (formDefaults.llmModel && formDefaults.pattern) {
      reset(formDefaults);
    }
  }, [formDefaults, reset]);

  const onSubmit = async (data: {
    llmModel: string;
    pattern: string;
    retrievalK: number;
  }) => {
    const settingsData = {
      model_id: data.llmModel,
      pattern_id: data.pattern,
      retrievalK: data.retrievalK,
    };

    try {
      if (userSettings) {
        // User has existing settings, update them
        await updateUserSettings.mutateAsync(settingsData);
      } else {
        // No existing settings, create new ones
        await createUserSettings.mutateAsync(settingsData);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleReset = () => {
    // Reset to first available options or defaults
    const resetValues = {
      llmModel: modelsData?.models[0]?.model_id || "",
      pattern: patternsData?.patterns[0]?.pattern_id || "",
      retrievalK: 5,
    };
    reset(resetValues);
  };

  // Show loading state while fetching data
  if (modelsLoading || patternsLoading || userSettingsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white min-h-screen">
        <Spinner size="lg" color="black" />
      </div>
    );
  }

  // Show error state if critical requests failed (ignore user settings 404)
  if (modelsError || patternsError) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Failed to load settings data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const isSaving = createUserSettings.isPending || updateUserSettings.isPending;

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
              <Select
                key={`model-${userSettings?.model_id || 'default'}-${field.value}`}
                value={field.value || ""}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full cursor-pointer focus-visible:ring-1">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-white cursor-pointer">
                  {modelsData?.models.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.model_id}
                      className="cursor-pointer"
                    >
                      {model.name}
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
              {patternsData?.patterns.map((pattern) => (
                <label
                  key={pattern.id}
                  aria-label={pattern.name}
                  aria-description={pattern.description}
                  className="group relative block rounded-lg border border-gray-300 bg-white px-6 py-4 has-checked:outline-2 has-checked:-outline-offset-2 has-checked:outline-black has-focus-visible:outline-3 has-focus-visible:-outline-offset-1 sm:flex sm:justify-between cursor-pointer"
                >
                  <input
                    value={pattern.pattern_id}
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
            className="w-full focus-visible:ring-1"
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
            disabled={isSaving}
            className={`bg-black text-white focus:ring-black cursor-pointer ${
              isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
            }`}
          >
            {isSaving ? <Spinner size="sm" color="white" /> : "Save Settings"}
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
