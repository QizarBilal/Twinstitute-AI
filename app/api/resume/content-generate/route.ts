/**
 * API: Resume Content Generation
 * AI-powered content generation for resume sections
 * Used while user is building/editing their resume
 * Uses GROQ_RESUME_BUILDER_KEY
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  generateResumeContent,
} from "@/lib/ai/resume-agent";

interface ContentGenerationRequest {
  role: string;
  targetPosition: string;
  yearsExperience: number;
  skills: string[];
}

function buildLocalGeneratedContent(body: ContentGenerationRequest) {
  const cleanSkills = (body.skills || []).filter(Boolean).slice(0, 8)
  const skillSentence = cleanSkills.length
    ? `Core strengths include ${cleanSkills.join(', ')}.`
    : 'Core strengths include cross-functional collaboration, execution discipline, and measurable delivery.'

  const yearsText = body.yearsExperience > 0 ? `${body.yearsExperience}+ years` : 'hands-on'

  return {
    summary: `${body.role} with ${yearsText} of experience building high-impact outcomes aligned with ${body.targetPosition}. ${skillSentence} Consistently improves quality, delivery speed, and stakeholder confidence through structured problem solving and clear communication.`,
    keywords: [
      body.role,
      body.targetPosition,
      ...cleanSkills,
      'ATS optimized',
      'impact-driven',
      'cross-functional',
    ].filter(Boolean),
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

    const body = (await req.json()) as ContentGenerationRequest;

    if (!body.role || !body.targetPosition) {
      return NextResponse.json(
        {
          success: false,
          error: "Role and targetPosition required",
        },
        { status: 400 }
      );
    }

    const generated = await generateResumeContent({
      role: body.role,
      targetPosition: body.targetPosition,
      yearsExperience: body.yearsExperience || 0,
      skills: body.skills || [],
    });

    if (!generated) {
      return NextResponse.json({
        success: true,
        data: buildLocalGeneratedContent(body),
        fallback: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: generated,
    });
  } catch (error) {
    console.error("Error generating content:", error);
    const body = {
      role: 'Professional',
      targetPosition: 'Target Role',
      yearsExperience: 0,
      skills: [],
    }

    return NextResponse.json({
      success: true,
      data: buildLocalGeneratedContent(body),
      fallback: true,
      error: error instanceof Error ? error.message : 'Failed to generate content',
    });
  }
}
