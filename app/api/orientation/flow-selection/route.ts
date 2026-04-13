// app/api/orientation/flow-selection/route.ts
// API endpoint for handling flow selection and generating AI responses

import { NextRequest, NextResponse } from "next/server";
import { IntentType } from "@/lib/orientation/types";

// Interface for request body
interface FlowSelectionRequest {
  intentType: IntentType;
  userId?: string;
  timestamp?: string;
}

// Interface for response
interface FlowSelectionResponse {
  success: boolean;
  intentType: IntentType;
  message: string;
  metadata: {
    timestamp: string;
    processingTime: number;
  };
}

/**
 * POST /api/orientation/flow-selection
 *
 * Handles flow selection confirmation and optionally:
 * - Generates dynamic AI response (if GROQ is available)
 * - Saves selection to database
 * - Initiates analytics tracking
 *
 * Request body:
 * {
 *   "intentType": "goal" | "compare" | "explore",
 *   "userId": "user-id-optional",
 *   "timestamp": "ISO-8601-timestamp-optional"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "intentType": "goal",
 *   "message": "AI response message",
 *   "metadata": {
 *     "timestamp": "2026-04-12T...",
 *     "processingTime": 250
 *   }
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<FlowSelectionResponse>> {
  const startTime = Date.now();

  try {
    const body = await request.json() as FlowSelectionRequest;
    const { intentType, userId } = body;

    // Validate intent type
    if (!intentType || !["goal", "compare", "explore"].includes(intentType)) {
      return NextResponse.json(
        {
          success: false,
          intentType: "explore" as IntentType,
          message: "Invalid intent type",
          metadata: {
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
          },
        },
        { status: 400 }
      );
    }

    // Get dynamic response based on intent
    const message = getAIResponseForIntent(intentType);

    // Optional: Save selection to database
    if (userId) {
      await saveFlowSelection(userId, intentType);
    }

    // Optional: Track analytics
    await trackFlowSelection(intentType, userId);

    const processingTime = Date.now() - startTime;

    return NextResponse.json<FlowSelectionResponse>(
      {
        success: true,
        intentType,
        message,
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Flow selection error:", error);

    return NextResponse.json(
      {
        success: false,
        intentType: "explore" as IntentType,
        message: "An error occurred processing your selection",
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get appropriate AI response for each intent type
 */
function getAIResponseForIntent(intentType: IntentType): string {
  const responses = {
    goal: `Good. That means we don't waste time exploring blindly.

Tell me what role you're aiming for — and what you've already done toward it.`,

    compare: `Smart move. Comparing options forces clarity.

What roles are you considering? And what's making you hesitate about each one?`,

    explore: `Good instinct. Starting from scratch means we build real understanding.

Let's start with how you think: Do you prefer solving problems analytically or creatively?`,
  };

  return responses[intentType];
}

/**
 * Helper: Save flow selection to database
 * (Implementation depends on your ORM/database)
 */
async function saveFlowSelection(
  userId: string,
  intentType: IntentType
): Promise<void> {
  try {
    // Example with Prisma:
    // await prisma.orientationSession.create({
    //   data: {
    //     userId,
    //     intentType,
    //     currentStep: "flow-selection",
    //     data: { selectedIntent: intentType },
    //   },
    // });

    console.log(`Saved flow selection: ${userId} -> ${intentType}`);
  } catch (error) {
    console.error("Error saving flow selection:", error);
    // Don't throw - this is non-critical
  }
}

/**
 * Helper: Track analytics event
 * (Implementation depends on your analytics provider)
 */
async function trackFlowSelection(
  intentType: IntentType,
  userId?: string
): Promise<void> {
  try {
    // Example with your analytics service:
    // await analytics.track({
    //   event: "orientation_flow_selected",
    //   userId,
    //   properties: {
    //     intentType,
    //     timestamp: new Date().toISOString(),
    //   },
    // });

    console.log(`Analytics: flow_selected -> ${intentType}`);
  } catch (error) {
    console.error("Error tracking analytics:", error);
    // Don't throw - analytics is non-critical
  }
}

/**
 * GET /api/orientation/flow-selection
 *
 * Returns available flow options and their descriptions
 * Useful for dynamic UI generation
 */
export async function GET(
  request: NextRequest
): Promise<
  NextResponse<{
    flows: Array<{
      id: IntentType;
      title: string;
      subtitle: string;
    }>;
  }>
> {
  return NextResponse.json(
    {
      flows: [
        {
          id: "goal",
          title: "I already know what I want",
          subtitle: "I have a role or domain in mind",
        },
        {
          id: "compare",
          title: "I'm deciding between options",
          subtitle: "I have multiple roles in mind",
        },
        {
          id: "explore",
          title: "I'm starting from scratch",
          subtitle: "I don't know what suits me yet",
        },
      ],
    },
    { status: 200 }
  );
}
