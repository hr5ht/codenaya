"use client";

import { useRouter } from "next/navigation";

import { SIGN_UP_URL } from "@/features/auth/constants";
import { PromptComposer } from "@/features/projects/components/prompt-composer";
import { savePendingPrompt } from "@/features/projects/utils/pending-prompt";
import { LandingModelPicker } from "./landing-model-picker";

/**
 * The dashboard's prompt box for signed-out visitors: the prompt is kept
 * across sign-up and the dashboard creates its project afterwards. The
 * dashboard's model chip and Enhance need an account, so this box has its own
 * signed-out model picker instead.
 */
export const LandingPromptComposer = ({ className }: { className?: string }) => {
  const router = useRouter();

  const handleSubmit = async (prompt: string) => {
    savePendingPrompt(prompt);
    router.push(SIGN_UP_URL);
    return true;
  };

  return (
    <PromptComposer
      onSubmit={handleSubmit}
      showModelSelect={false}
      showEnhance={false}
      tools={<LandingModelPicker />}
      className={className}
    />
  );
};
