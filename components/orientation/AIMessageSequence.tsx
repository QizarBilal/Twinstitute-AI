"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AIMessageSequenceProps {
  onComplete?: () => void;
  delay?: number;
}

const MESSAGES = [
  "Before we begin, I need to understand how you want to approach this.",
  "Not everyone starts from the same place.",
  "Choose how you want me to guide you.",
];

export default function AIMessageSequence({
  onComplete,
  delay = 0.2,
}: AIMessageSequenceProps) {
  const [displayedMessages, setDisplayedMessages] = useState<number[]>([]);

  useEffect(() => {
    const timings = [
      { delay: delay * 1000, count: 1 },
      { delay: (delay + 1.0) * 1000, count: 2 },
      { delay: (delay + 1.8) * 1000, count: 3 },
    ];

    const timers = timings.map((timing) =>
      setTimeout(() => {
        setDisplayedMessages((prev) =>
          prev.length < timing.count
            ? Array.from({ length: timing.count }, (_, i) => i)
            : prev
        );

        if (timing.count === 3 && onComplete) {
          setTimeout(() => onComplete(), 600);
        }
      }, timing.delay)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [delay, onComplete]);

  return (
    <div className="w-full max-w-2xl mb-12">
      <div className="space-y-4">
        {MESSAGES.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={
              displayedMessages.includes(index)
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 10 }
            }
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            className="text-lg md:text-xl text-gray-300 text-center leading-relaxed"
          >
            {message}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
