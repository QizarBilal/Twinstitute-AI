"use client";

import React, { useState } from "react";
import FlowSelectionScreen from "@/components/orientation/FlowSelectionScreen";
import { IntentType } from "@/lib/orientation/types";

/**
 * Demo page for FlowSelectionScreen component
 * Shows the premium orientation entry experience
 */
export default function FlowSelectionDemo() {
  const [selectedFlow, setSelectedFlow] = useState<IntentType | null>(null);
  const [showDemo, setShowDemo] = useState(true);

  const handleFlowSelected = (flow: IntentType, response: string) => {
    setSelectedFlow(flow);
    console.log("Flow selected:", flow);
    console.log("AI Response:", response);
  };

  // If you want to see the full transition in action, set autoTransition={true}
  // If you want to test manual state management, set autoTransition={false}

  return (
    <main className="w-full">
      {showDemo ? (
        <FlowSelectionScreen
          onFlowSelected={handleFlowSelected}
          autoTransition={true}
        />
      ) : (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
          <h1 className="text-3xl font-bold text-white">
            Flow Selection Demo
          </h1>
          <p className="text-gray-400">
            {selectedFlow ? `Selected: ${selectedFlow}` : "No flow selected"}
          </p>
          <button
            onClick={() => {
              setShowDemo(true);
              setSelectedFlow(null);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Reset Demo
          </button>
        </div>
      )}
    </main>
  );
}
