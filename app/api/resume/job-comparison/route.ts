/**
 * API: Job Description Comparison
 * Compare resume with job description and provide insights
 * Uses GROQ_RESUME_BUILDER_KEY for intelligent analysis
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  compareResumeWithJob,
  JobComparisonRequest,
} from "@/lib/ai/resume-agent";

function buildLocalComparison(body: JobComparisonRequest) {
  const resumeText = body.resumeContent.toLowerCase()
  const jdText = body.jobDescription.toLowerCase()

  const candidateKeywords = Array.from(
    new Set(
      jdText
        .split(/[^a-z0-9+#.]+/)
        .filter((word) => word.length > 3)
    )
  ).slice(0, 40)

  const matchedSkills = candidateKeywords.filter((word) => resumeText.includes(word)).slice(0, 12)
  const missingSkills = candidateKeywords.filter((word) => !resumeText.includes(word)).slice(0, 12)

  const matchScore = Math.min(
    99,
    Math.max(35, Math.round((matchedSkills.length / Math.max(candidateKeywords.length, 1)) * 100))
  )

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    suggestedImprovements: [
      'Add role-specific keywords in summary and experience sections.',
      'Prioritize measurable outcomes aligned with the job requirements.',
      'Highlight relevant skills earlier in the resume for better ATS parsing.',
    ],
    atsRecommendations: [
      'Use standard headings and simple formatting.',
      'Mirror job-description terminology where relevant.',
      'Keep bullet points concise and impact-oriented.',
    ],
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

    const body = (await req.json()) as JobComparisonRequest;

    if (!body.resumeContent || !body.jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume content and job description required",
        },
        { status: 400 }
      );
    }

    const comparison = await compareResumeWithJob(body);

    if (!comparison) {
      return NextResponse.json({
        success: true,
        data: buildLocalComparison(body),
        fallback: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    console.error("Error in job comparison:", error);
    return NextResponse.json({
      success: true,
      data: buildLocalComparison({
        resumeContent: '',
        jobDescription: '',
      }),
      fallback: true,
      error: error instanceof Error ? error.message : 'Failed to compare resume',
    });
  }
}
