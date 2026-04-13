// lib/orientation/workflow-orchestrator.ts
// Orchestrates the 3 different orientation workflows

import { Role, DifficultyLevel, CognitiveType } from "./role-intelligence";

export type WorkflowType = "clear-goal" | "confused" | "exploring";
export type UIType = "input" | "roles" | "comparison" | "decision" | "insights";

export interface UserContext {
  workflowType: WorkflowType;
  targetRole?: string;
  selectedRoles: string[];
  userSkills: string[];
  skillLevels: Record<string, "basic" | "intermediate" | "advanced">;
  interestScores: Record<string, number>; // 0-10 scale
  detectedTraits: CognitiveType[];
  currentStage: string;
}

export interface WorkflowMessage {
  message: string;
  ui: {
    type: UIType;
    data: any;
  };
  insights: {
    skillsMatch?: number;
    suggestedRoles?: Role[];
    detectedTraits?: CognitiveType[];
    gapAnalysis?: string[];
  };
  nextAction: string;
}

export interface SkillMatch {
  roleId: string;
  matchScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
}

interface RoleComparison {
  roles: Array<{
    roleId: string;
    difficulty: string;
    salary: string;
    demand: string;
    learningCurve: string;
    workStyle: string[];
  }>;
  differences: string[];
}

// ====== WORKFLOW 1: CLEAR GOAL ======
export async function orchestrateWorkflow1_ClearGoal(
  targetRole: string,
  currentSkills: string[],
  skillLevels: Record<string, "basic" | "intermediate" | "advanced">
): Promise<WorkflowMessage> {
  // Analyze skill match
  const matchScore = analyzeSkillMatch(targetRole, currentSkills);

  if (matchScore.matchScore >= 75) {
    // High match - show role details
    return {
      message: `Excellent match! Your ${currentSkills.length} skills align well with ${targetRole}. Let me explain what this role looks like daily.`,
      ui: {
        type: "insights",
        data: {
          roleId: targetRole,
          matchScore: matchScore.matchScore,
          matchedSkills: matchScore.matchedSkills,
        },
      },
      insights: {
        skillsMatch: matchScore.matchScore,
        gapAnalysis: [],
      },
      nextAction:
        "Confirm role or ask questions about daily work and growth path",
    };
  } else {
    // Low match - show two paths
    const alternativeRoles = findAlternativeRoles(currentSkills, 5);

    return {
      message: `I see potential, but there's a gap. You have ${matchScore.matchedSkills.length}/${currentSkills.length} relevant skills. Here are two paths:`,
      ui: {
        type: "comparison",
        data: {
          path_a: {
            label: `Continue toward ${targetRole}`,
            missing: matchScore.missingSkills,
            timeToMaster: estimateLearningTime(matchScore.missingSkills),
          },
          path_b: {
            label: "Better suited roles based on your current skills",
            roles: alternativeRoles,
          },
        },
      },
      insights: {
        skillsMatch: matchScore.matchScore,
        suggestedRoles: alternativeRoles,
        gapAnalysis: matchScore.missingSkills,
      },
      nextAction: "Choose path A (pursue gap) or path B (explore alternatives)",
    };
  }
}

// ====== WORKFLOW 2: CONFUSED/MULTI-SELECT ======
export function orchestrateWorkflow2_Confused(
  selectedRoleIds: string[],
  roles: Role[]
): WorkflowMessage {
  const selectedRoles = roles.filter((r) => selectedRoleIds.includes(r.id));

  if (selectedRoles.length < 2) {
    return {
      message:
        "Let's compare roles. Select at least 2 roles to see how they differ.",
      ui: {
        type: "roles",
        data: { action: "multi-select", hint: "Pick 2-5 roles to compare" },
      },
      insights: {},
      nextAction: "Select multiple roles to compare",
    };
  }

  const comparison = compareRoles(selectedRoles);

  return {
    message: `Here's how these ${selectedRoles.length} roles compare. Notice the differences in difficulty, salary, and work style:`,
    ui: {
      type: "comparison",
      data: comparison,
    },
    insights: {
      suggestedRoles: selectedRoles,
    },
    nextAction: "Based on the comparison, which appeals most? Or explore more roles?",
  };
}

// ====== WORKFLOW 3: EXPLORING/NO IDEA ======
export function orchestrateWorkflow3_Exploring(
  interestScores: {
    coding: number;
    creativity: number;
    systems: number;
    academicBackground: string;
  }
): WorkflowMessage {
  // Detect cognitive type
  const detectedType = detectCognitiveType(interestScores);

  // Recommend roles matching cognitive type
  const recommendedRoles = recommendRolesByType(detectedType);

  return {
    message: `Based on your interests, you seem like a "${detectedType}" thinker. Let me show you 5-8 roles that match this style:`,
    ui: {
      type: "roles",
      data: {
        cognitiveType: detectedType,
        roles: recommendedRoles.map((r) => ({
          id: r.id,
          name: r.name,
          whyItFits: matchRoleToType(r, detectedType),
          difficulty: r.difficulty,
        })),
      },
    },
    insights: {
      detectedTraits: [detectedType],
      suggestedRoles: recommendedRoles,
    },
    nextAction:
      "Explore roles, ask questions, or refine your interests further",
  };
}

// ====== HELPER FUNCTIONS ======

function analyzeSkillMatch(
  roleId: string,
  userSkills: string[]
): SkillMatch {
  // Mock implementation - in real system, would use role intelligence
  const matchedSkills = userSkills.slice(0, Math.ceil(userSkills.length * 0.7));
  const missingSkills = ["Advanced System Design", "Microservices", "K8s"];

  return {
    roleId,
    matchScore: (matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100,
    matchedSkills,
    missingSkills,
  };
}

function findAlternativeRoles(userSkills: string[], count: number): Role[] {
  // In real system, would match against role intelligence
  return [];
}

function estimateLearningTime(skills: string[]): string {
  return skills.length > 3 ? "6-12 months" : "3-6 months";
}

function compareRoles(roles: Role[]): RoleComparison {
  const differences = [
    `Difficulty ranges from ${Math.min(...roles.map(r => ({ difficult: r.difficulty })))} to highest`,
    `Salary ranges: ₹${Math.min(4, 6)} LPA to ₹${Math.max(35, 60)} LPA senior level`,
    "Learning curves vary from gradual to steep",
  ];

  return {
    roles: roles.map((r) => ({
      roleId: r.id,
      difficulty: r.difficulty,
      salary: r.salaryRangeIndia.mid,
      demand: r.demandLevel,
      learningCurve: r.learningCurve,
      workStyle: r.workStyle,
    })),
    differences,
  };
}

function detectCognitiveType(interestScores: {
  coding: number;
  creativity: number;
  systems: number;
  academicBackground: string;
}): CognitiveType {
  const { coding, creativity, systems } = interestScores;

  if (coding > 7 && systems > 7) return "Systems";
  if (coding > 7 && creativity > 7) return "Creative";
  if (creativity > 7 && systems < 5) return "Creative";
  if (systems > 7) return "Systems";
  if (coding > 7) return "Analytical";

  return "Builder";
}

function recommendRolesByType(type: CognitiveType): Role[] {
  // In real system, filter role intelligence by cognitive type
  return [];
}

function matchRoleToType(role: Role, type: CognitiveType): string {
  const reasons: Record<CognitiveType, string> = {
    Builder: "You like building things - this role creates tangible products",
    Analytical: "You enjoy logic puzzles - this role is pure problem-solving",
    Creative: "You want to express creativity - this role balances art & tech",
    Systems: "You see systems holistically - this role designs complex systems",
  };

  return reasons[type];
}

// ====== USER MEMORY & STATE MANAGEMENT ======

export interface OrientationDecision {
  userId: string;
  selectedRole: string;
  selectedDomain: string;
  userSkills: string[];
  skillLevels: Record<string, "basic" | "intermediate" | "advanced">;
  detectedTraits: CognitiveType[];
  workflowUsed: WorkflowType;
  decisionTimestamp: Date;
}

export function createDecisionRecord(
  userId: string,
  finalRoleId: string,
  context: UserContext
): OrientationDecision {
  return {
    userId,
    selectedRole: finalRoleId,
    selectedDomain: "", // Would be filled from role
    userSkills: context.userSkills,
    skillLevels: context.skillLevels,
    detectedTraits: context.detectedTraits,
    workflowUsed: context.workflowType,
    decisionTimestamp: new Date(),
  };
}
