// app/api/orientation/explain/route.ts
// Get AI explanations for roles

import { getRoleById } from "@/lib/orientation/role-intelligence";
import { 
  explainRole, 
  explainGrowthPath,
  analyzeSkillGap 
} from "@/lib/orientation/groq-integration";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface ExplanationRequest {
  roleId: string;
  type: "role" | "growth" | "gap";
  missingSkills?: string[];
  userSkills?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ExplanationRequest = await request.json();
    const { roleId, type, missingSkills = [], userSkills = [] } = body;

    // Get role
    const role = getRoleById(roleId);

    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Check cache first
    const cachedExplanation = await prisma.orientationRoleExplanation.findUnique({
      where: { roleId },
    });

    let explanation;

    if (type === "role") {
      if (cachedExplanation?.explanation) {
        return NextResponse.json({
          roleId,
          type: "role-explanation",
          text: cachedExplanation.explanation,
          fromCache: true,
        });
      }

      explanation = await explainRole(role);

      // Cache it
      await prisma.orientationRoleExplanation.upsert({
        where: { roleId },
        update: { explanation: explanation.text },
        create: {
          roleId,
          roleName: role.name,
          explanation: explanation.text,
        },
      });

      return NextResponse.json({
        roleId,
        type: "role-explanation",
        text: explanation.text,
        fromCache: false,
      });
    }

    if (type === "growth") {
      if (cachedExplanation?.growthPath) {
        return NextResponse.json({
          roleId,
          type: "growth-path",
          text: cachedExplanation.growthPath,
          fromCache: true,
        });
      }

      explanation = await explainGrowthPath(role);

      // Cache it
      await prisma.orientationRoleExplanation.upsert({
        where: { roleId },
        update: { growthPath: explanation.text },
        create: {
          roleId,
          roleName: role.name,
          growthPath: explanation.text,
        },
      });

      return NextResponse.json({
        roleId,
        type: "growth-path",
        text: explanation.text,
        fromCache: false,
      });
    }

    if (type === "gap") {
      explanation = await analyzeSkillGap(role, userSkills, missingSkills);

      return NextResponse.json({
        roleId,
        type: "skill-gap",
        text: explanation.text,
        fromCache: false,
      });
    }

    return NextResponse.json(
      { error: "Invalid explanation type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Explanation generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
