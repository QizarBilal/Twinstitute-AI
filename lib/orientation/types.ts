// lib/orientation/types.ts
// Core types for Twinstitute orientation system

export type IntentType = "goal" | "compare" | "explore";

export interface Role {
  id: string;
  name: string;
  domain: string;
  dailyWork: string;
  challenges: string;
  salaryRangeIndia: {
    junior: string;
    mid: string;
    senior: string;
  };
  difficulty: "junior" | "mid" | "senior";
  demandLevel: "high" | "medium" | "emerging";
  growthPath: string[];
  requiredSkills: string[];
  transferableSkills: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  cognitiveType: string;
  preferenceStyle: "analytical" | "creative" | "balanced";
  currentSkills: string[];
  targetRole?: string;
  consideringRoles?: string[];
  orientationIntent: IntentType;
}

export interface OrientationSession {
  id: string;
  userId: string;
  intentType: IntentType;
  startedAt: Date;
  currentStep: "flow-selection" | "input" | "analysis" | "recommendation";
  data: {
    selectedRole?: string;
    selectedRoles?: string[];
    userInput?: string;
    aiInsights?: string;
  };
}

export interface AIInsight {
  type: "explanation" | "comparison" | "gap-analysis" | "recommendation";
  content: string;
  roleId?: string;
  generatedAt: Date;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  messageType?: "input" | "insight" | "question" | "recommendation";
}
