"use client";

import { useRouter } from "next/navigation";

import { SIGN_UP_URL } from "@/features/auth/constants";
import { PromptComposer } from "@/features/projects/components/prompt-composer";
import { savePendingPrompt } from "@/features/projects/utils/pending-prompt";
import { ComposerFrame } from "@/components/composer-frame";
import { LandingModelPicker } from "./landing-model-picker";

/**
 * The dashboard's prompt box for signed-out visitors: the prompt is kept
 * across sign-up and the dashboard creates its project afterwards. The
 * dashboard's model chip and Enhance need an account, so this box has its own
 * signed-out model picker instead.
 */
export const LandingPromptComposer = ({
  showStarters = false,
  className,
}: {
  showStarters?: boolean;
  className?: string;
}) => {
  const router = useRouter();

  const handleSubmit = async (prompt: string) => {
    savePendingPrompt(prompt);
    router.push(SIGN_UP_URL);
    return true;
  };

  return (
    <ComposerFrame actions={<LandingModelPicker />} className={className}>
      <PromptComposer
        onSubmit={handleSubmit}
        showStarters={showStarters}
        showModelSelect={false}
        showEnhance={false}
      />
    </ComposerFrame>
  );
};
