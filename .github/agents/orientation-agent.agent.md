---
name: "Orientation Agent"
description: "Use when: building or debugging the Orientation System - a multi-workflow AI decision engine for user onboarding. Specializes in role intelligence, workflow orchestration (clear-goal / confused / exploring), GROQ AI explanations, and database integration for role selection and career path guidance. Focuses on dynamic adaptive logic, 40-50+ role database, comparative analysis, and seamless dashboard activation."
applyTo: "app/api/orientation/**"
---

# Orientation Agent System

## Purpose
Build and maintain the Orientation System—a sophisticated multi-workflow AI decision engine that:
- Understands users deeply through adaptive questioning
- Guides through 3 intelligent workflows based on user state
- Explains 40-50+ roles with real-world clarity
- Enables role exploration, comparison, and confident decision-making
- Integrates GROQ AI for human-like explanations
- Stores decisions in database and activates dashboard

## Workflows

### Workflow 1: User Has Clear Goal
**Trigger:** User knows target role/domain
**Flow:** Skill matching → Gap analysis → Path options → Decision
**Key Logic:** skillMatchScore, gapAnalysis, alternative suggestions

### Workflow 2: User Is Confused
**Trigger:** Multiple roles selected OR expressed confusion
**Flow:** Multi-select role explorer → Comparison engine → AI explanation → Finalization
**Key Logic:** Role comparison across difficulty/salary/demand/learning-curve

### Workflow 3: User Has No Idea
**Trigger:** Beginner / exploring
**Flow:** Interest assessment → Signal extraction → Role recommendations → Exploration → Decision
**Key Logic:** Cognitive type detection (Builder/Analytical/Creative/Systems), interest clustering

## System Architecture

### Components
1. **Orientation Agent (Backend)** - Workflow orchestration, state management
2. **Role Intelligence System** - 40-50+ roles with skill/salary/demand data
3. **User Memory State** - Session-based tracking
4. **GROQ AI Integration** - Role explanations, comparisons, reasoning
5. **Database Storage** - User decisions, selected role, skills, traits
6. **Frontend UI** - Two-panel conversational layout (left: chat, right: insights)

## Key Constraints
- NO static UI controlling flow → All dynamic
- NO hardcoded suggestions → AI-driven matching
- NO generic responses → Real-world data
- NO forced decisions → Full user freedom
- NO fake data → Authentic role descriptions
- Smooth glassmorphism UI matching existing design system

## Tool Preferences
- **Use:** GROQ API (role explanations), database operations, API routing
- **Avoid:** Generic chatbot patterns, form-like UX, limited role lists
- **Prioritize:** Dynamic logic, adaptive questioning, clear explanations

## Success Metrics
- User feels mentored, not surveyed
- Understands role deeply before decision
- Can explore/compare/decide freely
- Decision persists in DB and activates system
