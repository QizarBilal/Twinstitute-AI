// hooks/useFlowSelection.ts
// Custom hook for managing flow selection state and logic

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IntentType } from "@/lib/orientation/types";

interface FlowSelectionState {
  selectedFlow: IntentType | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

interface UseFlowSelectionOptions {
  onSuccess?: (intent: IntentType, message: string) => void;
  onError?: (error: string) => void;
  autoNavigate?: boolean;
  navigatePath?: string;
  enableAnalytics?: boolean;
  enableDatabase?: boolean;
}

/**
 * useFlowSelection Hook
 *
 * Manages the flow selection logic including:
 * - State management for selected flow
 * - API communication
 * - Error handling
 * - Optional analytics and database persistence
 * - Optional auto-navigation
 *
 * @example
 * ```tsx
 * const { selectedFlow, selectFlow, isLoading } = useFlowSelection({
 *   onSuccess: (intent) => console.log('Selected:', intent),
 *   autoNavigate: true,
 *   navigatePath: '/orientation/conversation'
 * });
 *
 * return (
 *   <button onClick={() => selectFlow('goal')} disabled={isLoading}>
 *     Select Goal Flow
 *   </button>
 * );
 * ```
 */
export function useFlowSelection(
  options: UseFlowSelectionOptions = {}
) {
  const {
    onSuccess,
    onError,
    autoNavigate = false,
    navigatePath = "/orientation/conversation",
    enableAnalytics = true,
    enableDatabase = true,
  } = options;

  const router = useRouter();

  const [state, setState] = useState<FlowSelectionState>({
    selectedFlow: null,
    isLoading: false,
    error: null,
    message: null,
  });

  /**
   * Select a flow and handle post-selection logic
   */
  const selectFlow = useCallback(
    async (intentType: IntentType) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        // Call API to confirm selection
        const response = await fetch(
          "/api/orientation/flow-selection",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              intentType,
              timestamp: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to select flow: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Update state with success
        setState({
          selectedFlow: intentType,
          isLoading: false,
          error: null,
          message: data.message,
        });

        // Store in session storage
        sessionStorage.setItem("orientationIntent", intentType);

        // Call success callback
        if (onSuccess) {
          onSuccess(intentType, data.message);
        }

        // Auto-navigate if enabled
        if (autoNavigate) {
          setTimeout(() => {
            router.push(`${navigatePath}?intent=${intentType}`);
          }, 2500); // Give time to read the message
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        if (onError) {
          onError(errorMessage);
        }

        console.error("Flow selection error:", error);
      }
    },
    [onSuccess, onError, autoNavigate, navigatePath, router]
  );

  /**
   * Reset the selection state
   */
  const resetSelection = useCallback(() => {
    setState({
      selectedFlow: null,
      isLoading: false,
      error: null,
      message: null,
    });
    sessionStorage.removeItem("orientationIntent");
  }, []);

  /**
   * Get the selected flow from session storage on mount
   */
  useEffect(() => {
    const stored = sessionStorage.getItem("orientationIntent");
    if (stored && (["goal", "compare", "explore"] as IntentType[]).includes(stored as IntentType)) {
      setState((prev) => ({
        ...prev,
        selectedFlow: stored as IntentType,
      }));
    }
  }, []);

  return {
    // State
    selectedFlow: state.selectedFlow,
    isLoading: state.isLoading,
    error: state.error,
    message: state.message,

    // Actions
    selectFlow,
    resetSelection,

    // Computed
    isSelected: state.selectedFlow !== null,
  };
}

/**
 * useFlowSelectionAnalytics Hook
 *
 * Tracks flow selection analytics
 * Integrates with your analytics provider
 *
 * @example
 * ```tsx
 * const { trackSelection } = useFlowSelectionAnalytics();
 *
 * const handleSelect = async (intent) => {
 *   await trackSelection(intent, { userId: 'user-123' });
 * };
 * ```
 */
export function useFlowSelectionAnalytics() {
  const trackSelection = useCallback(
    async (
      intentType: IntentType,
      metadata: Record<string, any> = {}
    ) => {
      try {
        // Example: Send to your analytics service
        await fetch("/api/analytics/flow-selection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "orientation_flow_selected",
            intentType,
            timestamp: new Date().toISOString(),
            ...metadata,
          }),
        });
      } catch (error) {
        console.error("Analytics tracking failed:", error);
        // Silently fail - don't disrupt user experience
      }
    },
    []
  );

  return { trackSelection };
}

/**
 * useFlowSelectionSession Hook
 *
 * Manages orientation session data
 * Coordinates between flow selection and subsequent steps
 *
 * @example
 * ```tsx
 * const { session, updateSession } = useFlowSelectionSession();
 *
 * // After flow selection
 * updateSession({ intentType: 'goal', startedAt: new Date() });
 * ```
 */
export function useFlowSelectionSession() {
  const [session, setSession] = useState<{
    intentType: IntentType | null;
    startedAt: Date | null;
    step: "flow-selection" | "input" | "analysis" | "recommendation";
  }>({
    intentType: null,
    startedAt: null,
    step: "flow-selection",
  });

  const updateSession = useCallback(
    (updates: Partial<typeof session>) => {
      setSession((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const initializeSession = useCallback((intentType: IntentType) => {
    setSession({
      intentType,
      startedAt: new Date(),
      step: "input",
    });
  }, []);

  const resetSession = useCallback(() => {
    setSession({
      intentType: null,
      startedAt: null,
      step: "flow-selection",
    });
  }, []);

  return {
    session,
    updateSession,
    initializeSession,
    resetSession,
  };
}
