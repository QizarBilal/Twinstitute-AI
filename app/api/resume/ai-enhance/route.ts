/**
 * API: AI Resume Enhancement
 * Real-time content enhancement while editing resume sections
 * Uses GROQ_RESUME_BUILDER_KEY for AI-powered suggestions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  enhanceResumeContent,
  ResumeEnhancementRequest,
} from "@/lib/ai/resume-agent";

function buildLocalEnhancement(body: ResumeEnhancementRequest) {
  const cleaned = body.currentContent
    .replace(/\s+/g, ' ')
    .trim()

  const enhanced = cleaned.length > 0
    ? cleaned
    : 'Added a concise, ATS-friendly statement focused on measurable outcomes and role-relevant keywords.'

  return {
    enhanced,
    suggestions: [
      'Use strong action verbs and quantify outcomes where possible.',
      'Mirror key terms from the target job description naturally.',
      'Keep statements concise and focused on impact.',
    ],
    atsScore: 82,
    keywords: ['impact', 'ownership', 'delivery', 'optimization'],
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as ResumeEnhancementRequest;

    if (!body.section || !body.currentContent) {
      return NextResponse.json(
        { success: false, error: "Section and content required" },
        { status: 400 }
      );
    }

    const enhancement = await enhanceResumeContent(body);

    if (!enhancement) {
      return NextResponse.json({
        success: true,
        data: buildLocalEnhancement(body),
        fallback: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: enhancement,
    });
  } catch (error) {
    console.error("Error in AI enhancement:", error);
    return NextResponse.json({
      success: true,
      data: buildLocalEnhancement({
        section: 'summary',
        currentContent: '',
      }),
      fallback: true,
      error: error instanceof Error ? error.message : 'Failed to enhance',
    });
  }
}
