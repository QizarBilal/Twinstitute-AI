/**
 * ORIENTATION AGENT - CORE BRAIN
 * The intelligent decision engine that guides users through their career journey
 */

import { getAllRoles, getRoleById, searchRoles, type Role } from './role-database'
import { compareRolesWithAI, explainRole as explainRoleWithAI, analyzeSkillGap as analyzeSkillGapWithAI } from './groq-integration-fixed'
import { fetchInternalApi } from './api-helpers'

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface CognitiveType {
  primaryStyle: 'creative' | 'analytical' | 'system-focused' | 'collaborative' | 'independent'
  secondaryStyle: 'creative' | 'analytical' | 'system-focused' | 'collaborative' | 'independent'
  reasoning: string
}

export interface SkillMatch {
  matchPercentage: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
}

export interface UserInput {
  type: 'workflow-selection' | 'skill-entry' | 'role-selection' | 'interest-input' | 'clarification'
  content: any
}

export interface OrientationState {
  userId: string
  workflowType: 'clear-goal' | 'confused' | 'exploring' | null
  currentStage: 'workflow-selection' | 'browsing-roles' | 'analysis' | 'comparison' | 'decision' | 'completed'
  userSkills: { name: string; level: 'basic' | 'intermediate' | 'advanced' }[]
  targetRole: Role | null
  candidateRoles: Role[] // Roles shown to user for selection
  exploringRoles: Role[]
  comparisonRoles: Role[]
  detectedTraits: CognitiveType | null
  interestScores: Record<string, number>
  skillMatchScore: number
  finalRole: Role | null
  conversationHistory: ConversationMessage[]
}

export interface ConversationMessage {
  role: 'mentor' | 'user'
  content: string
  timestamp: number
  insights?: any
}

export interface AgentResponse {
  message: string
  ui: {
    type: 'input' | 'roles' | 'comparison' | 'decision' | 'confirmation' | 'completion'
    data: any
  }
  insights: {
    skillsMatch?: SkillMatch
    suggestedRoles?: Role[]
    detectedTraits?: CognitiveType
    nextStep?: string
  }
  nextAction: string
}

/**
 * ORIENTATION AGENT
 * Orchestrates entire user journey through orientation
 */
export class OrientationAgent {
  private state: OrientationState
  private conversationLog: ConversationMessage[] = []

  constructor(userId: string) {
    this.state = {
      userId,
      workflowType: null,
      currentStage: 'workflow-selection',
      userSkills: [],
      targetRole: null,
      candidateRoles: [],
      exploringRoles: [],
      comparisonRoles: [],
      detectedTraits: null,
      interestScores: {},
      skillMatchScore: 0,
      finalRole: null,
      conversationHistory: [],
    }
  }

  /**
   * Process user input and generate response
   */
  async processUserInput(input: UserInput): Promise<AgentResponse> {
    // Add message to conversation
    this.addMessage('user', JSON.stringify(input))

    switch (this.state.currentStage) {
      case 'workflow-selection':
        return this.handleWorkflowSelection(input)
      case 'browsing-roles':
        return this.handleBrowsingRoles(input)
      case 'analysis':
        return this.handleAnalysis(input)
      case 'comparison':
        return this.handleComparison(input)
      case 'decision':
        return await this.handleDecision()
      default:
        return this.createResponse('Invalid state', { type: 'input', data: {} }, {}, 'restart')
    }
  }

  /**
   * Handle workflow selection and route to appropriateinitialization
   */
  private handleWorkflowSelection(input: UserInput): AgentResponse {
    const workflow = input.content.workflow
    
    // Map UI workflow IDs to internal workflow types
    const workflowMap: Record<string, 'clear-goal' | 'confused' | 'exploring'> = {
      'goal': 'clear-goal',
      'compare': 'confused',
      'explore': 'exploring',
      'clear-goal': 'clear-goal',
      'confused': 'confused',
      'exploring': 'exploring',
    }

    const mappedWorkflow = workflowMap[workflow]

    if (!mappedWorkflow) {
      return this.createResponse(
        'I need to understand your current situation better. Which path resonates with you?\n\n1. I know my target role\n2. I want to explore and compare options\n3. I\'m new and want to discover my path',
        { type: 'input', data: { question: 'workflow-choice' } },
        {},
        'clarify'
      )
    }

    // RESET all workflow state when selecting a NEW workflow
    this.state.workflowType = mappedWorkflow
    this.state.currentStage = 'browsing-roles'
    this.state.userSkills = []
    this.state.targetRole = null
    this.state.candidateRoles = []
    this.state.exploringRoles = []
    this.state.comparisonRoles = []
    this.state.detectedTraits = null
    this.state.interestScores = {}
    this.state.skillMatchScore = 0
    this.state.finalRole = null
    
    // Route to correct workflow based on type
    switch (mappedWorkflow) {
      case 'clear-goal':
        return this.initiateWorkflow1_ClearGoal()
      case 'confused':
        return this.initiateWorkflow2_Confused()
      case 'exploring':
        return this.initiateWorkflow3_Exploring()
    }
  }

  /**
   * Handle browsing/selection stage - varies by workflow
   */
  private async handleBrowsingRoles(input: UserInput): Promise<AgentResponse> {
    // Check if user is selecting a role from candidate list
    const { selectedRoles, selectedRoleId, selectedRole: selectedRoleContent, text, input: userText, confirmed, action } = input.content;
    const inputText = (text || userText || '').toLowerCase().trim();

    // Handle confirmation of free-form role
    if (confirmed === true || action === 'confirm-role' || inputText.includes('yes') || inputText.includes('confirm') || inputText.includes('finalize')) {
      if (this.state.targetRole && this.state.targetRole.id?.startsWith('role-')) {
        // User confirmed the AI-generated free-form role
        console.log(`[handleBrowsingRoles] User confirmed free-form role: "${this.state.targetRole.name}"`);

        if (this.state.workflowType === 'clear-goal') {
          // Proceed with skill analysis
          this.state.currentStage = 'analysis';
          const response = await this.analyzeSkillMatch(this.state.targetRole, this.state.userSkills);
          response.message = `Excellent! ${this.state.targetRole.name} is a great choice.\n\n${response.message}`;
          return response;
        } else if (this.state.workflowType === 'exploring') {
          // Direct to finalization
          this.state.finalRole = this.state.targetRole;
          this.state.currentStage = 'decision';
          return this.createResponse(
            `Perfect! ${this.state.targetRole.name} is your chosen path.\n\nYour personalized learning roadmap is ready. Let's build your career!`,
            {
              type: 'completion',
              data: { selectedRole: this.state.targetRole, showFinalizeButton: true },
            },
            { suggestedRoles: [this.state.targetRole] },
            'role-finalized'
          );
        } else if (this.state.workflowType === 'confused') {
          // Add to comparison roles
          this.state.comparisonRoles = [this.state.targetRole];
          this.state.candidateRoles = [this.state.targetRole];
          return this.createResponse(
            `Great! I've added ${this.state.targetRole.name} to your options.\n\nWould you like to:\n1. Learn more about this role\n2. Explore other specializations to compare\n3. Proceed with this role`,
            {
              type: 'roles',
              data: { roles: [this.state.targetRole], hasExplanations: true },
            },
            { suggestedRoles: [this.state.targetRole] },
            'role-confirmed'
          );
        }
      }
    }
    
    // Handle direct role selection (from UI buttons)
    if (selectedRoles?.length > 0 || selectedRoleId || selectedRoleContent) {
      const roleId = selectedRoleId || selectedRoleContent || (selectedRoles?.[0] || null);
      
      if (roleId) {
        // User selected a role from the suggested list
        const selectedRole = this.state.candidateRoles.find(r => r.id === roleId);
        
        if (selectedRole && this.state.workflowType === 'clear-goal') {
          // Workflow 1: Proceed with skill analysis
          this.state.targetRole = selectedRole;
          this.state.currentStage = 'analysis';
          
          const response = await this.analyzeSkillMatch(selectedRole, this.state.userSkills);
          response.message = `Perfect! ${selectedRole.name} is an excellent choice.\n\n${response.message}`;
          return response;
        } else if (selectedRole && this.state.workflowType === 'exploring') {
          // Workflow 3: Direct to decision (no skill analysis needed)
          this.state.targetRole = selectedRole;
          this.state.finalRole = selectedRole;
          this.state.currentStage = 'decision';
          
          return this.createResponse(
            `Excellent! ${selectedRole.name} aligns perfectly with your interests.\n\nYour personalized learning roadmap is ready. Let's build your career path!`,
            {
              type: 'completion',
              data: { selectedRole: selectedRole },
            },
            { suggestedRoles: [selectedRole] },
            'final-role-selected'
          );
        }
      }
    }

    // Handle natural language role selection (e.g., "I want to choose Backend Engineer" or "Software Developer")
    if (inputText && this.state.candidateRoles.length > 0) {
      // Extract role name from common patterns
      let extractedRoleName = null;
      
      // Pattern 1: "I want to choose: X" or "I want to choose, X" or "I want to choose; X" etc
      const chooseMatch = inputText.match(/(?:i want to choose|choose|i want|select|pick)[:;,]?\s*(.+?)(?:\.|$)/i);
      if (chooseMatch) {
        extractedRoleName = chooseMatch[1].trim();
      }
      
      // Pattern 2: Just a role name at the end of message
      if (!extractedRoleName && inputText.length < 100) {
        extractedRoleName = inputText.replace(/^(?:i want to choose|i want|choose|select|pick)[\s:;,]*/i, '').trim();
      }

      // Clean up extracted role name - remove extra punctuation and spaces
      if (extractedRoleName) {
        extractedRoleName = extractedRoleName
          .replace(/[;:,]+$/g, '') // Remove trailing punctuation
          .replace(/^\s*[;:,]+/, '') // Remove leading punctuation
          .trim()
      }

      // Try to match extracted role name against candidate roles first (STRICT matching only)
      let matchedRole: Role | null = null;
      
      if (extractedRoleName) {
        const extractedLower = extractedRoleName.toLowerCase().trim();
        const extractedWords = extractedLower.split(/\s+/);
        console.log(`[handleBrowsingRoles] Attempting to match: "${extractedRoleName}" against candidates: ${this.state.candidateRoles.map(r => r.name).join(', ')}`);
        
        // SPECIAL HANDLING: Check if user selected a generic software role
        // These roles ("Software Developer", "SWE", "SE", "Software Engineer") can be selected directly
        const genericSoftwareRoleMap: Record<string, string> = {
          'software developer': 'software-developer',
          'software engineer': 'software-engineer',
          'swe': 'swe-engineer',
          'se': 'swe-engineer',
          'swe engineer': 'swe-engineer',
        }
        
        const matchedGenericRoleId = genericSoftwareRoleMap[extractedLower];
        if (matchedGenericRoleId) {
          const genericRole = getRoleById(matchedGenericRoleId);
          if (genericRole) {
            console.log(`[handleBrowsingRoles] USER SELECTED GENERIC SOFTWARE ROLE: "${genericRole.name}"`);
            
            // User selected a generic software role - let them finalize it directly
            if (this.state.workflowType === 'clear-goal') {
              this.state.targetRole = genericRole;
              this.state.currentStage = 'analysis';
              
              const response = await this.analyzeSkillMatch(genericRole, this.state.userSkills);
              response.message = `Excellent choice! ${genericRole.name} is a strong foundation.\n\n${response.message}`;
              return response;
            } else if (this.state.workflowType === 'exploring') {
              this.state.targetRole = genericRole;
              this.state.finalRole = genericRole;
              this.state.currentStage = 'decision';
              
              return this.createResponse(
                `Perfect! ${genericRole.name} is a versatile path with many opportunities.\n\nYour personalized learning roadmap is ready. Let's build your career foundation!`,
                {
                  type: 'completion',
                  data: { selectedRole: genericRole, showFinalizeButton: true },
                },
                { suggestedRoles: [genericRole] },
                'role-finalized'
              );
            } else if (this.state.workflowType === 'confused') {
              // For confused workflow, add to comparison roles
              this.state.targetRole = genericRole;
              return this.createResponse(
                `Great! I've added ${genericRole.name} to your options. Would you like to:\n\n1. Learn more about this role\n2. Compare it with other specializations\n3. Proceed with this role`,
                {
                  type: 'roles',
                  data: {
                    roles: [genericRole],
                    hasExplanations: true,
                  },
                },
                { suggestedRoles: [genericRole] },
                'role-selected-generic'
              );
            }
          }
        }
        
        // FIRST PASS: Exact match or clear substring match
        for (const role of this.state.candidateRoles) {
          const roleName = role.name.toLowerCase();
          
          // Match if: exact match OR role name is contained in extracted text
          if (roleName === extractedLower || extractedLower.includes(roleName)) {
            console.log(`[handleBrowsingRoles] FOUND EXACT MATCH: "${role.name}"`);
            matchedRole = role;
            break;
          }
        }
        
        // SECOND PASS: Word-level matching (if all words of role name are in extracted)
        if (!matchedRole) {
          for (const role of this.state.candidateRoles) {
            const roleName = role.name.toLowerCase();
            const roleWords = roleName.split(/\s+/);
            
            // Check if ALL key words of role name appear in extracted
            const allKeysMatch = roleWords.every(word => 
              extractedLower.includes(word) && word.length > 2
            );
            
            if (allKeysMatch) {
              console.log(`[handleBrowsingRoles] FOUND WORD MATCH: "${role.name}"`);
              matchedRole = role;
              break;
            }
          }
        }
        
        // THIRD PASS: Fuzzy match on first keyword (e.g., "software" -> "Software Engineer roles")
        // This helps with "Software Developer" -> "Backend Engineer" confusion
        if (!matchedRole && extractedWords.length > 0) {
          const firstKeyword = extractedWords[0];
          
          // Check if any candidate role contains the first keyword
          for (const role of this.state.candidateRoles) {
            const roleName = role.name.toLowerCase();
            if (roleName.includes(firstKeyword) && firstKeyword.length > 3) {
              console.log(`[handleBrowsingRoles] FOUND KEYWORD MATCH: "${role.name}" (keyword="${firstKeyword}")`);
              matchedRole = role;
              break;
            }
          }
        }
      }

      if (matchedRole) {
        // Natural language match found - select this role
        if (this.state.workflowType === 'clear-goal') {
          this.state.targetRole = matchedRole;
          this.state.currentStage = 'analysis';
          
          const response = await this.analyzeSkillMatch(matchedRole, this.state.userSkills);
          response.message = `Perfect! ${matchedRole.name} is an excellent choice.\n\n${response.message}`;
          return response;
        } else if (this.state.workflowType === 'exploring') {
          this.state.targetRole = matchedRole;
          this.state.finalRole = matchedRole;
          this.state.currentStage = 'decision';
          
          return this.createResponse(
            `Excellent! ${matchedRole.name} aligns perfectly with your interests.\n\nYour personalized learning roadmap is ready. Let's build your career path!`,
            {
              type: 'completion',
              data: { selectedRole: matchedRole },
            },
            { suggestedRoles: [matchedRole] },
            'final-role-selected'
          );
        }
      } else if (extractedRoleName && this.state.candidateRoles.length > 0) {
        // No exact match found - try AI-powered intelligent matching
        console.log(`[handleBrowsingRoles] No exact match for extracted: "${extractedRoleName}", attempting AI matching...`);
        
        try {
          // Use AI to intelligently match user input to candidate roles
          const aiMatchResponse = await fetchInternalApi('/api/ai/match-intent', {
            method: 'POST',
            body: JSON.stringify({
              userInput: extractedRoleName,
              candidateRoles: this.state.candidateRoles,
              context: 'User is trying to select a role from these candidates',
            }),
          });
          
          if (aiMatchResponse?.matchedRole) {
            const aiMatchedRole = this.state.candidateRoles.find(r => r.id === aiMatchResponse.matchedRole);
            if (aiMatchedRole) {
              console.log(`[handleBrowsingRoles] AI matched "${extractedRoleName}" to "${aiMatchedRole.name}"`);
              // Use the AI-matched role
              if (this.state.workflowType === 'clear-goal') {
                this.state.targetRole = aiMatchedRole;
                this.state.currentStage = 'analysis';
                const response = await this.analyzeSkillMatch(aiMatchedRole, this.state.userSkills);
                response.message = `Perfect! ${aiMatchedRole.name} is an excellent choice.\n\n${response.message}`;
                return response;
              } else if (this.state.workflowType === 'exploring') {
                this.state.targetRole = aiMatchedRole;
                this.state.finalRole = aiMatchedRole;
                this.state.currentStage = 'decision';
                return this.createResponse(
                  `Perfect! ${aiMatchedRole.name} aligns with your interests and profile.\n\nYour personalized learning roadmap is ready. Let's build your future!`,
                  {
                    type: 'completion',
                    data: { selectedRole: aiMatchedRole, showFinalizeButton: true },
                  },
                  { suggestedRoles: [aiMatchedRole] },
                  'role-finalized'
                );
              }
            }
          }
        } catch (error) {
          console.log(`[handleBrowsingRoles] AI matching failed, falling back to free-form role explanation:`, error);
        }
        
        // No match in candidates - offer AI-powered free-form role explanation
        // This allows user to choose ANY role they want, not just predefined ones
        console.log(`[handleBrowsingRoles] No candidate match found, attempting AI role explanation for: "${extractedRoleName}"`);
        return await this.explainAndConfirmFreeFormRole(extractedRoleName);
      } else if (extractedRoleName) {
        // User provided a role name but no candidate roles available
        // Use AI to explain ANY role the user wants (free-form role selection)
        console.log(`[handleBrowsingRoles] User provided role: "${extractedRoleName}", attempting AI explanation (free-form)`);
        return await this.explainAndConfirmFreeFormRole(extractedRoleName);
      }
    }

    // Handle explanations or clarifications
    if (inputText && (inputText.includes('explain') || inputText.includes('tell me') || inputText.includes('describe') || inputText.includes('compare'))) {
      if (this.state.candidateRoles.length > 0) {
        return this.handleRoleExplanationRequest(input);
      }
    }

    // If still no match, route based on workflow type to gather more input
    if (this.state.workflowType === 'clear-goal') {
      return this.gatherClearGoalInfo(input);
    } else if (this.state.workflowType === 'confused') {
      return this.gatherConfusedInfo(input);
    } else if (this.state.workflowType === 'exploring') {
      return this.gatherExploringInfo(input);
    }

    return this.createResponse('Please select a workflow first', { type: 'input', data: {} }, {}, 'restart');
  }

  /**
   * Handle analysis stage - skill matching and learning paths
   */
  private async handleAnalysis(input: UserInput): Promise<AgentResponse> {
    const { text, input: userText, selectedRoleId, selectedRole } = input.content;
    const inputText = text || userText || '';

    // If user selected a role from candidates (applies to Workflows 1 & 3)
    if (selectedRoleId || selectedRole) {
      const roleId = selectedRoleId || selectedRole;
      const role = this.state.candidateRoles.find(r => r.id === roleId);
      
      if (role) {
        this.state.targetRole = role;

        // For Workflow 3 (exploring), skip skill analysis - no skills to analyze
        if (this.state.workflowType === 'exploring') {
          this.state.finalRole = role;
          this.state.currentStage = 'decision';
          
          return this.createResponse(
            `Excellent choice! ${role.name} aligns with your interests and thinking style.\n\nYour personalized learning roadmap is ready. Let's build your career path!`,
            {
              type: 'completion',
              data: { selectedRole: role },
            },
            { suggestedRoles: [role] },
            'final-role-selected'
          );
        }

        // For Workflows 1 & 3 with skills, analyze skill match
        if (this.state.userSkills && this.state.userSkills.length > 0) {
          const response = await this.analyzeSkillMatch(role, this.state.userSkills);
          response.message = `Perfect! ${role.name} is an excellent choice.\n\nNow let me analyze your skills against what's needed...\n\n${response.message}`;
          return response;
        }

        // Fallback: no user skills available
        this.state.finalRole = role  // Set finalRole for database save
        this.state.currentStage = 'decision';
        return this.createResponse(
          `Great! ${role.name} is a fantastic path.\n\nYour personalized roadmap is being created to guide you toward this role.`,
          {
            type: 'completion',
            data: { selectedRole: role },
          },
          { suggestedRoles: [role] },
          'role-selected'
        );
      }
    }

    // Try to detect if user is entering a different role name as text
    if (inputText.length > 3 && !inputText.toLowerCase().includes('confirm') && !inputText.toLowerCase().includes('continue')) {
      const searchResults = searchRoles(inputText);
      if (searchResults.length > 0) {
        const newRole = searchResults[0];
        this.state.targetRole = newRole;

        // For Workflow 3 (exploring), skip skill analysis
        if (this.state.workflowType === 'exploring') {
          this.state.finalRole = newRole;
          this.state.currentStage = 'decision';
          
          return this.createResponse(
            `Excellent choice! ${newRole.name} aligns with your interests and thinking style.\n\nYour personalized learning roadmap is ready. Let's build your career path!`,
            {
              type: 'completion',
              data: { selectedRole: newRole },
            },
            { suggestedRoles: [newRole] },
            'final-role-selected'
          );
        }

        // For Workflows 1 & 2 with skills, analyze skill match
        if (this.state.userSkills && this.state.userSkills.length > 0) {
          const response = await this.analyzeSkillMatch(newRole, this.state.userSkills);
          response.message = `Perfect! ${newRole.name} is an excellent choice.\n\nNow let me analyze your skills against what's needed...\n\n${response.message}`;
          return response;
        }

        // Fallback: show role info and ask for confirmation
        this.state.finalRole = newRole
        this.state.currentStage = 'decision';
        return this.createResponse(
          `Great! ${newRole.name} is a fantastic path.\n\nYour personalized roadmap is being created to guide you toward this role.`,
          {
            type: 'completion',
            data: { selectedRole: newRole },
          },
          { suggestedRoles: [newRole] },
          'role-selected'
        );
      }
    }

    // If user is asking for confirmation/continuation
    if (inputText.toLowerCase().includes('confirm') || inputText.toLowerCase().includes('continue') || inputText.toLowerCase().includes('ready')) {
      if (this.state.targetRole) {
        this.state.finalRole = this.state.targetRole  // Set finalRole when confirmed
        this.state.currentStage = 'decision';
        
        return this.createResponse(
          `Excellent! You're ready to start your journey toward ${this.state.targetRole.name}. 

Your personalized learning roadmap is being created based on your goals. Let's begin!`,
          {
            type: 'completion',
            data: { selectedRole: this.state.targetRole },
          },
          { suggestedRoles: [this.state.targetRole] },
          'roadmap-created'
        );
      }
    }

    // Provide more info or ask for confirmation
    if (this.state.targetRole) {
      return this.createResponse(
        `Here's more about ${this.state.targetRole.name}: ${this.state.targetRole.description}\n\nReady to create your learning path? Say "confirm" or "continue".`,
        {
          type: 'input',
          data: { type: 'clarification' },
        },
        {},
        'confirm-role'
      );
    }

    return this.createResponse('Select a role first', { type: 'input', data: {} }, {}, 'restart');
  }

  /**
   * Handle comparison stage - Works for Workflow 2 (confused/compare) AND Workflow 3 (exploring/discover)
   * Allows users to compare multiple roles and select the best fit
   */
  private async handleComparison(input: UserInput): Promise<AgentResponse> {
    console.log(`[handleComparison] input.type=${input.type}, input.content=${JSON.stringify(input.content)}`)
    const { selectedRole, selectedRoleId, text, input: userText } = input.content;
    const inputText = text || userText || '';
    const roleId = selectedRole || selectedRoleId;

    console.log(`[handleComparison] roleId=${roleId}, inputText=${inputText}, workflowType=${this.state.workflowType}`)

    // If selecting a single role from comparison
    if (roleId) {
      // First try candidate roles, then comparison roles, then all roles
      let role = this.state.candidateRoles.find(r => r.id === roleId);
      if (!role) {
        role = this.state.comparisonRoles.find(r => r.id === roleId);
      }
      if (!role) {
        role = getRoleById(roleId);
      }
      console.log(`[handleComparison] found role: ${role?.name || 'NOT FOUND'}`)
      if (role) {
        this.state.finalRole = role;
        this.state.targetRole = role;

        // For Workflow 3 (exploring), complete the flow directly
        if (this.state.workflowType === 'exploring') {
          this.state.currentStage = 'decision';
          return this.createResponse(
            `Perfect! ${role.name} aligns with your interests and profile.\n\nYour personalized learning roadmap is ready. Let's build your future!`,
            {
              type: 'completion',
              data: { selectedRole: role, showFinalizeButton: true },
            },
            { suggestedRoles: [role] },
            'role-finalized'
          );
        }
        
        // For Workflow 2 (confused/compare)
        this.state.currentStage = 'decision';
        return this.createResponse(
          `Great choice! ${role.name} is an excellent path.\n\nYour personalized roadmap is being created based on your interest in this role.`,
          {
            type: 'completion',
            data: { selectedRole: role, showFinalizeButton: true },
          },
          { suggestedRoles: [role] },
          'final-role-selected'
        );
      }
    }

    // If user wants to compare different roles (Workflow 2 only)
    if (inputText.toLowerCase().includes('compare') || inputText.toLowerCase().includes('different') || inputText.toLowerCase().includes('other')) {
      if (this.state.workflowType === 'exploring') {
        // For Workflow 3, show the comparison again with current roles
        return this.createResponse(
          `You can compare these recommended roles using the comparison table. Click on a role to select it, or adjust filters to find more options.`,
          {
            type: 'comparison',
            data: {
              roles: this.state.candidateRoles,
              cognitiveType: this.state.detectedTraits,
            },
          },
          {},
          'compare-roles'
        );
      }
      
      // For Workflow 2, show all roles again
      this.state.currentStage = 'browsing-roles';
      const allRoles = getAllRoles();
      
      return this.createResponse(
        `No problem! Let's find other roles to compare. Select 2–5 roles you'd like to explore.`,
        {
          type: 'roles',
          data: {
            roles: allRoles,
            canMultiSelect: true,
          },
        },
        {},
        'browse-roles'
      );
    }

    // If asking for more details about roles
    if (inputText.toLowerCase().includes('explain') || inputText.toLowerCase().includes('tell me') || inputText.toLowerCase().includes('what')) {
      return this.createResponse(
        `Would you like to know more about a specific role? Select one from the comparison table to get detailed insights.`,
        {
          type: 'input',
          data: { type: 'clarification' },
        },
        {},
        'clarify'
      );
    }

    // If no role matched and input was a role name attempt, provide helpful guidance
    if (inputText.length > 0 && !roleId) {
      // Extract attempted role name for better UX
      const chooseMatch = inputText.match(/(?:i want to choose|choose|i want|select|pick):\s*(.+?)(?:\.|$)/i);
      const mentionedRole = chooseMatch ? chooseMatch[1].trim() : inputText;
      
      if (mentionedRole.length > 0) {
        return this.createResponse(
          `I don't recognize "${mentionedRole}" from the comparison. The roles you're comparing are:\n\n${this.state.comparisonRoles.map(r => `• ${r.name}`).join('\n')}\n\nClick on one to select it or ask for explanations!`,
          {
            type: 'comparison',
            data: {
              roles: this.state.comparisonRoles,
              cognitiveType: this.state.detectedTraits,
            },
          },
          {},
          'clarify-role-selection'
        );
      }
    }

    return this.createResponse(
      `Pick a role from the comparison table to move forward, or let me know if you'd like to see different roles.`,
      { type: 'input', data: { type: 'clarification' } },
      {},
      'pick-role'
    );
  }

  /**
   * Handle decision stage - finalize role choice
   */
  private async handleDecision(): Promise<AgentResponse> {
    const finalRole = this.state.finalRole || this.state.targetRole;
    
    if (!finalRole) {
      return this.createResponse(
        'Select a role to continue',
        { type: 'input', data: {} },
        {},
        'select-role'
      );
    }

    return this.createResponse(
      `Perfect! You've chosen ${finalRole.name}.

Here's your next steps:
1. Start your personalized roadmap
2. Explore required skills in detail
3. Take targeted labs and challenges  
4. Track your progress

Let's build your future!`,
      {
        type: 'completion',
        data: {
          selectedRole: finalRole,
          nextSteps: ['roadmap', 'labs', 'skills'],
        },
      },
      { suggestedRoles: [finalRole] },
      'begin-journey'
    );
  }

  private initiateWorkflow1_ClearGoal(): AgentResponse {
    return this.createResponse(
      `Great! Let's explore your target role path. Tell me:
      
1. What role or domain interests you most?
2. What skills do you currently have?
3. What level (basic/intermediate/advanced) are you at?

I'll show you the gap and the path forward.`,
      {
        type: 'input',
        data: {
          questions: ['target-role', 'skills', 'skill-levels'],
        },
      },
      {},
      'get-target-role'
    )
  }

  /**
   * WORKFLOW 2: USER IS CONFUSED OR EXPLORING MULTIPLE ROLES
   */
  private initiateWorkflow2_Confused(): AgentResponse {
    const allRoles = getAllRoles()
    // Show ALL roles for true exploration - user can scroll/search to find what interests them

    return this.createResponse(
      `Perfect! Let's explore together. Here are all ${allRoles.length}+ career roles we cover. You can:

• Scroll through all roles
• Check difficulty, demand, and salary for each
• Select 2–5 roles you're curious about to compare them side-by-side
• Get AI-powered insights on the key differences

Pick the roles that spark your interest!`,
      {
        type: 'roles',
        data: {
          roles: allRoles, // Show ALL roles, not just preview
          canMultiSelect: true,
          showDomains: true,
        },
      },
      {
        suggestedRoles: allRoles,
      },
      'browse-roles'
    )
  }

  /**
   * WORKFLOW 3: USER HAS NO IDEA - EXPANDED WITH 8 QUESTIONS
   */
  private initiateWorkflow3_Exploring(): AgentResponse {
    return this.createResponse(
      `No problem! Let's discover your perfect path. Answer 8 quick questions about your interests and strengths:

1. How interested are you in coding? (0-10)
2. Creativity/design? (0-10)
3. Systems/logic? (0-10)
4. Problem-solving/puzzles? (0-10)
5. Communication/teamwork? (0-10)
6. Learning new technologies? (0-10)
7. Your academic background? (e.g., Engineering, Business, Self-taught)
8. Any existing skills? (e.g., Python, JavaScript, Design)

This helps me match you with roles that fit your strengths!`,
      {
        type: 'input',
        data: {
          type: 'interest-assessment-expanded',
          scales: ['coding', 'creativity', 'systems', 'problemSolving', 'communication', 'learning'],
        },
      },
      {},
      'assess-interests'
    )
  }

  /**
   * Detect if user is asking for explanations of roles
   */
  private isExplanationRequest(input: UserInput): boolean {
    const content = input.content;
    const textInput = typeof content === 'string' ? content : content.text || content.input || '';
    const lowerText = textInput.toLowerCase();

    return (
      lowerText.includes('explain') ||
      lowerText.includes('tell me') ||
      lowerText.includes('describe') ||
      lowerText.includes('what')
    ) && (
      lowerText.includes('role') ||
      lowerText.includes('job') ||
      lowerText.includes('difference')
    );
  }

  /**
   * Handle requests to explain candidate roles using GROQ AI
   */
  private async handleRoleExplanationRequest(input: UserInput): Promise<AgentResponse> {
    const roles = this.state.candidateRoles;
    if (roles.length === 0) {
      return this.createResponse(
        'No roles to explain. Please select roles first.',
        { type: 'input', data: {} },
        {},
        'clarify'
      );
    }

    try {
      // Get AI explanations for each role
      const roleExplanations = await Promise.all(
        roles.map(async (role) => ({
          role,
          explanation: await explainRoleWithAI(role),
        }))
      );

      // Format explanations for display
      let message = `Here's what each role actually involves:\n\n`;
      roleExplanations.forEach((item, index) => {
        message += `${index + 1}. ${item.role.name}\n${item.explanation.text}\n\n`;
      });
      message += `Which role resonates most with you?`;

      return this.createResponse(
        message,
        {
          type: 'roles',
          data: {
            roles: roles,
            explanations: roleExplanations.map(r => ({
              roleId: r.role.id,
              explanation: r.explanation.text,
            })),
          },
        },
        {},
        'select-role'
      );
    } catch (error) {
      console.error('Error explaining roles:', error);
      // Fallback to basic role info
      let message = `Here's a quick overview of these roles:\n\n`;
      roles.forEach((role, index) => {
        message += `${index + 1}. ${role.name}\n${role.description}\n${role.dailyWork}\n\n`;
      });
      message += `Which one interests you?`;

      return this.createResponse(
        message,
        {
          type: 'roles',
          data: { roles },
        },
        {},
        'select-role'
      );
    }
  }

  /**
   * Proceed with selected role from candidates
   */
  private async proceedWithSelectedRole(selectedRoleId: string): Promise<AgentResponse> {
    const selectedRole = this.state.candidateRoles.find(r => r.id === selectedRoleId);
    if (!selectedRole) {
      return this.createResponse(
        'Role not found. Please select again.',
        { type: 'roles', data: { roles: this.state.candidateRoles } },
        {},
        'retry'
      );
    }

    this.state.targetRole = selectedRole;
    this.state.currentStage = 'analysis';

    const response = await this.analyzeSkillMatch(selectedRole, this.state.userSkills);
    response.message = `Perfect! ${selectedRole.name} is an excellent choice.\n\n${response.message}`;
    return response;
  }

  /**
   * Handle free-form role selection with AI explanation
   * Allows users to choose ANY job role - no predefined limitations
   */
  private async explainAndConfirmFreeFormRole(roleName: string): Promise<AgentResponse> {
    console.log(`[explainAndConfirmFreeFormRole] Generating AI explanation for: "${roleName}"`);

    try {
      // Call AI to generate comprehensive role information using internal API helper
      const response = await fetchInternalApi('/api/ai/explain-role', {
        method: 'POST',
        body: JSON.stringify({ roleTitle: roleName }),
      });

      if (!response?.success || !response?.roleInfo) {
        console.log(`[explainAndConfirmFreeFormRole] AI failed to explain role, asking for clarification`);
        return this.createResponse(
          `I had trouble understanding "${roleName}". Could you clarify or tell me more about this role? What does a ${roleName} do?`,
          { type: 'input', data: { type: 'role-clarification' } },
          {},
          'clarify-role'
        );
      }

      const roleInfo = response.roleInfo as any;
      console.log(`[explainAndConfirmFreeFormRole] Generated role info for: "${roleInfo.name}"`);

      // Create a temporary role object from AI response
      const generatedRole: Role = {
        id: roleInfo.id,
        name: roleInfo.name,
        domain: roleInfo.domain || 'Software Engineering',
        description: roleInfo.description,
        dailyWork: roleInfo.dailyWork,
        requiredSkills: roleInfo.requiredSkills,
        optionalSkills: roleInfo.optionalSkills,
        difficulty: roleInfo.difficulty,
        demandLevel: roleInfo.demandLevel,
        salaryRangeIndia: roleInfo.salaryRangeIndia,
        growthPath: roleInfo.growthPath,
        workStyle: roleInfo.workStyle,
        marketOutlook: roleInfo.marketOutlook,
        companiesHiring: roleInfo.companiesHiring,
        typicalCompanies: roleInfo.typicalCompanies,
        averageExperience: roleInfo.averageExperience,
      };

      // Format role information for display
      const roleExplanation = `
🎯 **${generatedRole.name}**

**What you'll do:**
${generatedRole.dailyWork.map((task: string) => `• ${task}`).join('\n')}

**Required Skills:**
${generatedRole.requiredSkills.map((skill: any) => `• ${skill.name} (${skill.level})`).join('\n')}

**Salary in India:**
• Entry: ₹${generatedRole.salaryRangeIndia.entry} LPA
• Mid-Level: ₹${generatedRole.salaryRangeIndia.mid} LPA  
• Senior: ₹${generatedRole.salaryRangeIndia.senior} LPA

**Growth Path:**
${generatedRole.growthPath.map((path: string) => `→ ${path}`).join('\n')}

**Market Outlook:**
${generatedRole.marketOutlook}

Company hiring: ${generatedRole.companiesHiring.join(', ')}
`;

      // Store the generated role temporarily
      this.state.targetRole = generatedRole;

      // Ask user to confirm this is the role they want
      return this.createResponse(
        `Perfect! I found comprehensive information about **${generatedRole.name}**.\n\n${roleExplanation}\n\n**Is this the role you want to pursue?** You can finalize it, or ask me to explain another role if you'd like.`,
        {
          type: 'confirmation',
          data: {
            role: generatedRole,
            message: `Confirm ${generatedRole.name}?`,
          },
        },
        { suggestedRoles: [generatedRole] },
        'confirm-free-form-role'
      );
    } catch (error) {
      console.error(`[explainAndConfirmFreeFormRole] Error:`, error);
      return this.createResponse(
        `I had trouble generating information about "${roleName}". Could you provide more details about this role or try another one?`,
        { type: 'input', data: { type: 'role-details-request' } },
        {},
        'ask-for-details'
      );
    }
  }

  /**
   * Extract and validate clear goal workflow info
   */
  private async gatherClearGoalInfo(input: UserInput): Promise<AgentResponse> {
    const { targetRole, skills } = input.content

    // Validate input
    if (!targetRole || !skills || skills.length === 0) {
      return this.createResponse(
        'I need both your target role and current skills. Could you provide those?',
        { type: 'input', data: { questions: ['target-role', 'skills'] } },
        {},
        'clarify'
      )
    }

    // First try local search (now with smart abbreviation mapping and fuzzy matching)
    let foundRoles = searchRoles(targetRole)

    // If local search doesn't find roles, use GROQ AI for intelligent matching
    if (foundRoles.length === 0) {
      try {
        const skillsString = Array.isArray(skills)
          ? skills.map(s => typeof s === 'string' ? s : s.name).join(', ')
          : String(skills)

        const aiResponse = await fetch('/api/orientation/ai-match-roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userInput: targetRole,
            skills: skillsString,
            context: 'User is searching for their target role',
          }),
        }).then(r => r.json())

        if (aiResponse.success && aiResponse.roles?.length > 0) {
          foundRoles = aiResponse.roles
        }
      } catch (error) {
        console.error('GROQ role matching failed:', error)
        // Fall back to showing all roles if GROQ fails
      }
    }

    // If still no roles found, show all roles
    if (foundRoles.length === 0) {
      return this.createResponse(
        `I couldn't find an exact match for "${targetRole}", but here are roles in similar directions. Which interests you?`,
        {
          type: 'roles',
          data: {
            roles: getAllRoles().slice(0, 8),
          },
        },
        {},
        'select-role'
      )
    }

    // If multiple roles found, show top 3-5 for user to choose
    if (foundRoles.length > 1) {
      const topRoles = foundRoles.slice(0, 5);
      this.state.candidateRoles = topRoles; // Store for later explanation requests
      this.state.userSkills = skills; // Store skills for later analysis

      return this.createResponse(
        `Great! I found ${foundRoles.length} roles matching "${targetRole}".\n\nWould you like me to explain each role so you can compare, or just pick one to analyze?`,
        {
          type: 'roles',
          data: {
            roles: topRoles,
            hasExplanations: false,
          },
        },
        {},
        'select-role'
      )
    }

    // Only one role found - proceed with analysis
    const selectedRole = foundRoles[0]
    this.state.targetRole = selectedRole
    this.state.userSkills = skills
    this.state.candidateRoles = [selectedRole] // Store for consistency
    this.state.currentStage = 'analysis'

    const response = await this.analyzeSkillMatch(selectedRole, skills)
    // Prepend message to analysis
    response.message = `Perfect! ${selectedRole.name} is an excellent choice.\n\n${response.message}`

    return response
  }

  /**
   * Analyze skill match for clear goal workflow
   */
  private async analyzeSkillMatch(role: Role, userSkills: any[]): Promise<AgentResponse> {
    const match = calculateSkillMatch(role, userSkills)
    this.state.skillMatchScore = match.matchPercentage

    // Get AI explanation for skill gap
    const userSkillNames = userSkills.map(s => typeof s === 'string' ? s : s.name || '').filter(Boolean);
    const missingSkillNames = match.missingSkills;
    const gapAnalysis = await analyzeSkillGapWithAI(role, userSkillNames, missingSkillNames);

    const baseMessage =
      match.matchPercentage >= 70
        ? `Excellent! You're well-prepared for ${role.name}.`
        : match.matchPercentage >= 40
          ? `You have solid fundamentals. Here's the path to bridge the gap.`
          : `You're interested in ${role.name}. Let me show you the learning path.`

    const message = `${baseMessage}

${gapAnalysis.text}

About ${role.name}:
- Market Demand: ${role.demandLevel}
- Difficulty Level: ${role.difficulty}
- Salary Range: ${role.salaryRangeIndia.entry}L – ${role.salaryRangeIndia.senior}L
- Companies Hiring: ${role.companiesHiring.slice(0, 3).join(', ')}`

    return this.createResponse(
      message,
      {
        type: 'comparison',
        data: {
          role,
          userSkills,
          skillMatch: match,
          suggestedLearningPath: generateLearningPath(role, userSkills),
        },
      },
      {
        skillsMatch: match,
      },
      match.matchPercentage >= 70 ? 'confirm-role' : 'show-path'
    )
  }

  /**
   * Handle confused workflow - multi-role exploration
   */
  private async gatherConfusedInfo(input: UserInput): Promise<AgentResponse> {
    const { selectedRoles } = input.content

    // Handle single or multiple role selection
    if (!selectedRoles || selectedRoles.length === 0) {
      return this.createResponse(
        'Select at least 2 roles to compare. What interests you?',
        {
          type: 'roles',
          data: {
            roles: getAllRoles(),
            canMultiSelect: true,
          },
        },
        {},
        'select-compare-roles'
      )
    }

    // If only 1 role selected, ask for more
    if (selectedRoles.length === 1) {
      return this.createResponse(
        'Select at least one more role to compare. Which roles interest you?',
        {
          type: 'roles',
          data: {
            roles: getAllRoles(),
            canMultiSelect: true,
          },
        },
        {},
        'select-compare-roles'
      )
    }

    // 2+ roles selected - proceed to comparison
    const selectedRoleObjects = selectedRoles.map((id: string) => getRoleById(id)).filter(Boolean)
    this.state.comparisonRoles = selectedRoleObjects
    this.state.candidateRoles = selectedRoleObjects // Also set candidateRoles for consistency
    this.state.currentStage = 'comparison'

    return this.compareRoles(selectedRoleObjects)
  }

  /**
   * Compare selected roles
   */
  private async compareRoles(roles: Role[]): Promise<AgentResponse> {
    // Build comprehensive comparison table data
    const comparisonTableData = {
      roleObjects: roles, // Original role objects (not transformed)
      roles: roles.map(r => ({
        id: r.id,
        name: r.name,
        domain: r.domain,
        description: r.description,
        workType: r.workStyle.join(', '),
        workload: r.difficulty === 'advanced' ? 'High - Complex problems' : r.difficulty === 'intermediate' ? 'Medium - Balanced' : 'Medium - Learning focus',
        avgExperience: r.averageExperience,
        salaryEntry: r.salaryRangeIndia.entry,
        salaryMid: r.salaryRangeIndia.mid,
        salarySenior: r.salaryRangeIndia.senior,
        salaryCtc: `${r.salaryRangeIndia.entry}L - ${r.salaryRangeIndia.senior}L`,
        trend: r.marketOutlook.includes('growing') ? 'Growing' : r.marketOutlook.includes('stable') ? 'Stable' : 'Emerging',
        demand: r.demandLevel === 'high' ? 'Very High' : r.demandLevel === 'medium' ? 'Medium' : 'Growing',
        difficulty: r.difficulty,
        requiredSkills: r.requiredSkills.map(s => s.name).join(', '),
        optionalSkills: r.optionalSkills.join(', '),
        growthPath: r.growthPath.join(' → '),
        companies: r.typicalCompanies.slice(0, 3).join(', '),
      })),
      headers: ['Role', 'Domain', 'Work Type', 'Workload', 'CTC Range', 'Demand', 'Trend', 'Required Skills', 'Growth Path'],
    }

    // Get detailed AI comparison
    const aiComparison = await compareRolesWithAI(roles)
    
    // Clean any asterisks from AI response
    const cleanAiText = aiComparison.text.replace(/\*+/g, '')

    const message = `In-depth Career Role Comparison

${cleanAiText}

Below is a detailed comparison table of all selected roles. Use this to understand key differences in salary, skills, workload, and growth potential.`

    return this.createResponse(
      message,
      {
        type: 'comparison',
        data: {
          roles: comparisonTableData.roleObjects, // Use original role objects for UI
          comparisonTable: comparisonTableData,
          aiInsights: cleanAiText,
        },
      },
      {
        suggestedRoles: roles,
      },
      'pick-role'
    )
  }

  /**
   * Handle exploring workflow - interest-based with comparison feature
   */
  private async gatherExploringInfo(input: UserInput): Promise<AgentResponse> {
    const { interests, background, skills } = input.content

    // Detect cognitive type based on 6+ interest dimensions
    const cognitiveType = detectCognitiveType(interests)
    this.state.detectedTraits = cognitiveType
    this.state.interestScores = interests

    // Recommend 6-8 roles based on comprehensive profile
    let recommendedRoles = this.recommendRolesByProfile(cognitiveType, interests)
    
    // Store for later comparison in Workflow 3
    this.state.exploringRoles = recommendedRoles
    this.state.comparisonRoles = recommendedRoles // Enable comparison feature
    this.state.candidateRoles = recommendedRoles // Store for later use
    this.state.currentStage = 'comparison' // Move to comparison stage so users can compare before selecting

    let message = `Excellent! Based on your interests and thinking style (${cognitiveType.primaryStyle}), here are roles that match your profile:

${recommendedRoles.slice(0, 8).map(r => `• ${r.name} (${r.domain}): ${r.description}`).join('\n\n')}

You can now compare these roles side-by-side to understand the differences, or select one directly to start your personalized roadmap!`

    return this.createResponse(
      message,
      {
        type: 'comparison',
        data: {
          roles: recommendedRoles,
          cognitiveType,
          shouldShowDetails: true,
          canMultiSelect: false, // Single selection for explore workflow
        },
      },
      {
        detectedTraits: cognitiveType,
        suggestedRoles: recommendedRoles,
      },
      'explore-roles'
    )
  }

  /**
   * Recommend roles based on cognitive type and interests
   */
  private recommendRolesByProfile(cognitiveType: CognitiveType, interests: Record<string, number>): Role[] {
    const allRoles = getAllRoles()

    return allRoles
      .map(role => {
        let score = 0

        // Match work style (primary: 30 points, secondary: 15 points)
        if (role.workStyle.includes(cognitiveType.primaryStyle)) score += 30
        if (role.workStyle.includes(cognitiveType.secondaryStyle)) score += 15

        // Match core interests to domain
        if (interests.coding >= 6 && ['Software Engineering', 'Data & AI'].includes(role.domain)) score += 25
        if (interests.creativity >= 6 && ['Product & Design', 'Mobile & Game Dev'].includes(role.domain)) score += 25
        if (interests.systems >= 6 && ['Cloud & DevOps', 'Cybersecurity', 'Software Engineering'].includes(role.domain)) score += 25

        // Match secondary interests
        if (interests.problemSolving >= 7 && ['Data & AI', 'Cybersecurity', 'Software Engineering'].includes(role.domain)) score += 10
        if (interests.communication >= 7 && ['Product & Design', 'Technical Program Management'].includes(role.domain)) score += 10
        if (interests.learning >= 8) score += 5 // Always slightly boost roles for high learners

        return { role, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.role)
  }

  // ─────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────

  private addMessage(role: 'mentor' | 'user', content: string) {
    this.conversationLog.push({
      role,
      content,
      timestamp: Date.now(),
    })
  }

  private createResponse(
    message: string,
    ui: AgentResponse['ui'],
    insights: AgentResponse['insights'],
    nextAction: string
  ): AgentResponse {
    this.addMessage('mentor', message)
    return {
      message,
      ui,
      insights,
      nextAction,
    }
  }

  getState() {
    return this.state
  }

  getConversationLog() {
    return this.conversationLog
  }
}

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS & HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Detect user's cognitive type based on interest scores
 */
function detectCognitiveType(interests: Record<string, number>): CognitiveType {
  const { 
    coding = 5, 
    creativity = 5, 
    systems = 5,
    problemSolving = 5,
    communication = 5,
    learning = 5
  } = interests;
  
  let primaryStyle: CognitiveType['primaryStyle'] = 'analytical';
  let secondaryStyle: CognitiveType['secondaryStyle'] = 'collaborative';
  
  // Determine primary style from core dimensions
  if (creativity > coding && creativity > systems) {
    primaryStyle = 'creative';
    if (communication > 6) secondaryStyle = 'collaborative';
  } else if (systems > coding && systems > creativity) {
    primaryStyle = 'system-focused';
    if (problemSolving > 6) secondaryStyle = 'analytical';
  } else if (coding >= 6) {
    primaryStyle = 'analytical';
    if (problemSolving > 6) secondaryStyle = 'independent';
  }
  
  // Adjust based on secondary dimensions
  if (communication > 7) primaryStyle = 'collaborative';
  if (learning > 8) primaryStyle = 'analytical'; // Learning-oriented
  
  return {
    primaryStyle,
    secondaryStyle,
    reasoning: `Based on your interests: Coding ${coding}/10, Creativity ${creativity}/10, Systems ${systems}/10, Problem-Solving ${problemSolving}/10, Communication ${communication}/10, Learning ${learning}/10`,
  };
}

/**
 * Calculate skill match between user skills and role requirements
 */
function calculateSkillMatch(role: Role, userSkills: any[]): SkillMatch {
  const userSkillNames = userSkills.map(s => typeof s === 'string' ? s : s.name || '').filter(Boolean);
  const requiredSkillNames = role.requiredSkills.map(s => s.name.toLowerCase());
  
  const matchedSkills = userSkillNames.filter(skill =>
    requiredSkillNames.some(req => req.includes(skill.toLowerCase()) || skill.toLowerCase().includes(req))
  );
  
  const missingSkills = requiredSkillNames.filter(skill =>
    !userSkillNames.some(userSkill => userSkill.toLowerCase().includes(skill) || skill.includes(userSkill.toLowerCase()))
  );
  
  const matchPercentage = Math.round((matchedSkills.length / requiredSkillNames.length) * 100);
  
  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    recommendations: missingSkills.slice(0, 3),
  };
}

/**
 * Generate learning path for user
 */
function generateLearningPath(role: Role, userSkills: any[]): string[] {
  const match = calculateSkillMatch(role, userSkills);
  
  if (match.matchPercentage >= 70) {
    return ['Polish existing skills', 'Learn role-specific tools', 'Practice with projects'];
  } else if (match.matchPercentage >= 40) {
    return ['Master core fundamentals', 'Learn missing skills', 'Build portfolio projects'];
  } else {
    return ['Start with foundations', 'Complete bootcamp/course', 'Gain practical experience'];
  }
}

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

function getDifficultyScore(difficulty: string): number {
  const scores: Record<string, number> = {
    foundation: 1,
    intermediate: 2,
    advanced: 3,
  }
  return scores[difficulty] || 1
}
