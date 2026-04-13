"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Compass, Lightbulb, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface WorkflowOption {
  id: "goal" | "compare" | "explore";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string[];
  footerHint: string;
}

const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    id: "goal",
    icon: Target,
    title: "Know Your Goal",
    subtitle: "Target a specific role",
    description: [
      "Validate your direction",
      "Analyze your current skills",
      "Identify gaps and strategy",
    ],
    footerHint: "Best if you already have a target role",
  },
  {
    id: "compare",
    icon: Lightbulb,
    title: "Explore Freely",
    subtitle: "Browse 40+ career options",
    description: [
      "Explore multiple roles",
      "Compare difficulty, demand, payoff",
      "Understand trade-offs clearly",
    ],
    footerHint: "Best if you're unsure between paths",
  },
  {
    id: "explore",
    icon: Compass,
    title: "Discover",
    subtitle: "Find roles matching your interests",
    description: [
      "Discover your thinking style",
      "Get role recommendations",
      "Understand everything from zero",
    ],
    footerHint: "Best if you're new or exploring",
  },
];

interface FlowSelectionScreenProps {
  onWorkflowSelect: (workflowId: "goal" | "compare" | "explore") => void;
}

export default function FlowSelectionScreen({
  onWorkflowSelect,
}: FlowSelectionScreenProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showCards, setShowCards] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show cards after brief delay
    const timer = setTimeout(() => setShowCards(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleWorkflowClick = async (workflowId: "goal" | "compare" | "explore") => {
    setSelectedWorkflow(workflowId);
    setIsLoading(true);

    // Trigger parent callback to start workflow
    setTimeout(() => {
      onWorkflowSelect(workflowId);
    }, 300);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <div className="relative z-20 px-6 py-4 border-b border-gray-800 bg-black/80 backdrop-blur-sm flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="Go back"
        >
          <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex-1"></div>

        <div className="w-10 h-10">
          <Image
            src="/Logo.png"
            alt="Twinstitute Logo"
            width={40}
            height={40}
            loading="eager"
            className="rounded-lg w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16 max-w-2xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Your Career Path Awaits
          </h1>
          <p className="text-xl text-gray-300 font-light">
            Let's find the right direction for you. How would you like to begin?
          </p>
        </motion.div>

        {/* Workflow Cards */}
        <AnimatePresence mode="wait">
          {showCards && !isLoading && (
            <motion.div
              key="workflow-cards"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-5xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {WORKFLOW_OPTIONS.map((option, index) => {
                  const Icon = option.icon;
                  const isSelected = selectedWorkflow === option.id;

                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.1 * index,
                        ease: "easeOut",
                      }}
                      onClick={() => handleWorkflowClick(option.id)}
                      disabled={isLoading}
                      className="group relative text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
                    >
                      {/* Card Container */}
                      <div
                        className={`
                          relative h-full rounded-lg p-8 transition-all duration-300
                          ${
                            isSelected
                              ? "bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20"
                              : "bg-gradient-to-br from-gray-900/60 to-gray-900/30 border border-gray-800/50 hover:border-cyan-500/50 hover:from-gray-900/70 hover:to-gray-900/40"
                          }
                          backdrop-blur-sm overflow-hidden
                        `}
                      >
                        {/* Animated border glow on hover/select */}
                        {(isSelected || selectedWorkflow === null) && (
                          <motion.div
                            className={`
                              absolute inset-0 rounded-lg pointer-events-none
                              ${
                                isSelected
                                  ? "shadow-[inset_0_0_30px_rgba(59,130,246,0.3)]"
                                  : "shadow-none"
                              }
                            `}
                            animate={{
                              opacity: isSelected ? [1, 0.8, 1] : 0,
                            }}
                            transition={{
                              duration: 2,
                              repeat: isSelected ? Infinity : 0,
                            }}
                          />
                        )}

                        {/* Icon Section */}
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15 + 0.1 * index, duration: 0.5 }}
                          className={`
                            mb-6 p-4 rounded-lg w-fit transition-all duration-300
                            ${
                              isSelected
                                ? "bg-blue-500/40"
                                : "bg-gray-800/60 group-hover:bg-cyan-500/30"
                            }
                          `}
                        >
                          <Icon
                            className={`w-8 h-8 transition-all duration-300 ${
                              isSelected
                                ? "text-blue-300"
                                : "text-gray-400 group-hover:text-cyan-400"
                            }`}
                          />
                        </motion.div>

                        {/* Title */}
                        <h3
                          className={`
                            text-2xl font-bold mb-2 transition-all duration-300 leading-tight
                            ${
                              isSelected || selectedWorkflow === null
                                ? "text-white"
                                : "text-gray-200 group-hover:text-white"
                            }
                          `}
                        >
                          {option.title}
                        </h3>

                        {/* Subtitle */}
                        <p
                          className={`
                            text-sm mb-6 transition-all duration-300
                            ${
                              isSelected || selectedWorkflow === null
                                ? "text-gray-300"
                                : "text-gray-500 group-hover:text-gray-400"
                            }
                          `}
                        >
                          {option.subtitle}
                        </p>

                        {/* Description List */}
                        <ul className="space-y-3 mb-6">
                          {option.description.map((item, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay:
                                  0.2 + 0.1 * index + 0.05 * idx,
                                duration: 0.4,
                              }}
                              className="flex items-start gap-3"
                            >
                              <motion.div
                                className={`
                                  mt-1.5 w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300
                                  ${
                                    isSelected
                                      ? "bg-blue-400"
                                      : "bg-gray-700 group-hover:bg-cyan-400"
                                  }
                                `}
                                animate={isSelected ? { scale: [1, 1.3, 1] } : {}}
                                transition={{
                                  duration: 2,
                                  repeat: isSelected ? Infinity : 0,
                                }}
                              />
                              <span
                                className={`
                                  text-sm transition-all duration-300
                                  ${
                                    isSelected || selectedWorkflow === null
                                      ? "text-gray-300"
                                      : "text-gray-600 group-hover:text-gray-400"
                                  }
                                `}
                              >
                                {item}
                              </span>
                            </motion.li>
                          ))}
                        </ul>

                        {/* Footer hint */}
                        <div className="pt-4 border-t border-gray-800/50">
                          <p
                            className={`
                              text-xs uppercase tracking-wider transition-all duration-300
                              ${
                                isSelected
                                  ? "text-blue-400/70"
                                  : "text-gray-700 group-hover:text-gray-600"
                              }
                            `}
                          >
                            {option.footerHint}
                          </p>
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div
                            layoutId="selection-check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                            }}
                            className="absolute top-4 right-4 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center"
                          >
                            <ArrowRight className="w-4 h-4 text-white" />
                          </motion.div>
                        )}

                        {/* Top accent line */}
                        <motion.div
                          className={`
                            absolute top-0 left-0 right-0 h-1 rounded-t-lg transition-all duration-300
                            ${
                              isSelected
                                ? "bg-blue-500"
                                : "bg-transparent group-hover:bg-cyan-500"
                            }
                          `}
                          animate={{
                            scaleX: isSelected ? 1 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          style={{ originX: 0 }}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
              <p className="text-gray-300">Preparing your workflow...</p>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
