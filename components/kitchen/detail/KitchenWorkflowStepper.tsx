"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { CookingStatus } from "@/types/kitchen";

interface KitchenWorkflowStepperProps {
    currentStatus: CookingStatus;
    onStepClick?: (stepStatus: CookingStatus) => void;
    canNavigate: boolean;
}

const steps: { status: CookingStatus; label: string }[] = [
    { status: "cooking", label: "台本作成" },
    { status: "image_upload", label: "画像UP" },
    { status: "image_selection", label: "画像採用" },
    { status: "download", label: "完成" },
];

export default function KitchenWorkflowStepper({
    currentStatus,
    onStepClick,
    canNavigate,
}: KitchenWorkflowStepperProps) {
    const currentIndex = steps.findIndex((s) => s.status === currentStatus);

    return (
        <div className="w-full py-4 px-2 overflow-x-auto">
            <nav aria-label="Progress">
                <ol role="list" className="flex items-center">
                    {steps.map((step, stepIdx) => {
                        const effectiveIndex = currentStatus === 'archived' ? steps.length : currentIndex;
                        const isCompletedEffective = stepIdx < effectiveIndex;
                        const isCurrentEffective = stepIdx === effectiveIndex || (currentStatus === 'archived' && step.status === 'download'); // Archived stays at end

                        return (
                            <li key={step.label} className={cn("relative", stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "")}>
                                {stepIdx !== steps.length - 1 && (
                                    <div
                                        className="absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-full bg-gray-200"
                                        aria-hidden="true"
                                    >
                                        <div
                                            className={cn(
                                                "h-full bg-[var(--md-sys-color-primary)] transition-all duration-500",
                                                isCompletedEffective ? "w-full" : "w-0"
                                            )}
                                        />
                                    </div>
                                )}
                                <button
                                    className="group relative flex flex-col items-center cursor-pointer disabled:cursor-default"
                                    onClick={() => canNavigate && onStepClick?.(step.status)}
                                    disabled={!canNavigate}
                                >
                                    <span className="flex h-9 items-center">
                                        <span
                                            className={cn(
                                                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300",
                                                isCompletedEffective || isCurrentEffective
                                                    ? "bg-[var(--md-sys-color-primary)]"
                                                    : "bg-gray-200 group-hover:bg-gray-300"
                                            )}
                                        >
                                            {isCompletedEffective ? (
                                                <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                            ) : (
                                                <span
                                                    className={cn(
                                                        "h-2.5 w-2.5 rounded-full",
                                                        isCurrentEffective ? "bg-white" : "bg-transparent"
                                                    )}
                                                />
                                            )}
                                        </span>
                                    </span>
                                    <span
                                        className={cn(
                                            "mt-2 text-xs font-medium uppercase transition-colors duration-300",
                                            isCurrentEffective
                                                ? "text-[var(--md-sys-color-primary)]"
                                                : "text-gray-500"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
}
