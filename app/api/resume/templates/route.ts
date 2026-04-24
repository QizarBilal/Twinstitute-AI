/**
 * API: Resume Templates
 * List and manage 10 ATS-friendly resume templates
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RESUME_TEMPLATES } from "@/lib/ai/resume-agent";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return templates sorted by ATS score
    const sortedTemplates = [...RESUME_TEMPLATES].sort(
      (a, b) => b.atsScore - a.atsScore
    );

    return NextResponse.json({
      success: true,
      data: {
        templates: sortedTemplates,
        total: sortedTemplates.length,
        recommendedTemplate: sortedTemplates[0],
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch templates",
      },
      { status: 500 }
    );
  }
}
