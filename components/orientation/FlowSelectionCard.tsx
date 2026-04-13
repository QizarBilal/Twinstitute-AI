"use client";

import React from "react";
import { motion } from "framer-motion";
import { IntentType } from "@/lib/orientation/types";

interface FlowOption {
  id: IntentType;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string[];
  footerHint: string;
  aiResponse?: string;
}

interface FlowSelectionCardProps {
  option: FlowOption;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export default function FlowSelectionCard({
  option,
  isSelected,
  isDisabled,
  onClick,
}: FlowSelectionCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const Icon = option.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <button
        onClick={onClick}
        disabled={isDisabled}
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative w-full h-full text-left
          rounded-lg transition-all duration-300
          p-6 flex flex-col
          ${isDisabled ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black
          active:scale-95
        `}
        type="button"
      >
        {/* Card background with gradient */}
        <motion.div
          className={`
            absolute inset-0 rounded-lg
            ${
              isSelected
                ? "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500"
                : isHovered
                  ? "bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500"
                  : "bg-gradient-to-br from-gray-900/50 to-gray-900/30 border border-gray-800/50"
            }
            backdrop-blur-sm transition-all duration-300
          `}
          animate={{
            boxShadow: isSelected
              ? "0 0 30px rgba(59, 130, 246, 0.4)"
              : isHovered
                ? "0 0 20px rgba(0, 217, 255, 0.25)"
                : "0 0 0px rgba(0, 0, 0, 0)",
          }}
          transition={{
            duration: isSelected || isHovered ? 0.3 : 0.6,
          }}
        />

        {/* Content container */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Icon at top */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className={`
              mb-4 p-3 rounded-lg w-fit
              ${
                isSelected
                  ? "bg-blue-500/30"
                  : isHovered
                    ? "bg-cyan-500/20"
                    : "bg-gray-800/50"
              }
              transition-all duration-300
            `}
          >
            <Icon
              className={`
                w-6 h-6 transition-all duration-300
                ${
                  isSelected
                    ? "text-blue-400"
                    : isHovered
                      ? "text-cyan-400"
                      : "text-gray-400"
                }
              `}
            />
          </motion.div>

          {/* Selection indicator dot */}
          {isSelected && (
            <motion.div
              layoutId="selection-indicator"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full"
            />
          )}

          {/* Title */}
          <h3 className={`
            text-lg md:text-xl font-bold mb-2 leading-snug transition-all duration-300
            ${isSelected || isHovered ? "text-white" : "text-gray-100"}
          `}>
            {option.title}
          </h3>

          {/* Subtitle */}
          <p className={`
            text-sm mb-4 transition-all duration-300
            ${isSelected || isHovered ? "text-gray-300" : "text-gray-400"}
          `}>
            {option.subtitle}
          </p>

          {/* Description items */}
          <div className="flex-grow space-y-3 mb-6">
            {option.description.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + 0.08 * index, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <motion.div
                  className={`
                    mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300
                    ${isSelected || isHovered ? "bg-cyan-400" : "bg-gray-700"}
                  `}
                  animate={isSelected || isHovered ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 2, repeat: isSelected || isHovered ? Infinity : 0 }}
                />
                <p className={`
                  text-sm transition-all duration-300
                  ${isSelected || isHovered ? "text-gray-300" : "text-gray-500"}
                `}>
                  {item}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="pt-4 border-t border-gray-800/50">
            <p className="text-xs text-gray-600 uppercase tracking-wider">
              {option.footerHint}
            </p>
          </div>
        </div>

        {/* Top accent line */}
        <motion.div
          className={`
            absolute top-0 left-0 right-0 h-1 rounded-t-lg transition-all duration-300
            ${isSelected ? "bg-blue-500" : isHovered ? "bg-cyan-500" : "bg-transparent"}
          `}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isSelected || isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ originX: 0 }}
        />
      </button>
    </motion.div>
  );
}
