/**
 * ORIENTATION ORCHESTRATION API
 * Complete endpoint that orchestrates the entire orientation system
 */

import { OrientationAgent, type UserInput, type AgentResponse } from '@/lib/orientation/agent'
import { getRoleById, getAllRoles, searchRoles } from '@/lib/orientation/role-database'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Store active agent sessions in-memory (with persistence fallback)
const agentSessions = new Map<string, { agent: OrientationAgent; lastActivity: number }>()

// Clean up old sessions (older than 24 hours)
setInterval(() => {
  const now = Date.now()
  const maxAge = 24 * 60 * 60 * 1000
  for (const [key, value] of agentSessions.entries()) {
    if (now - value.lastActivity > maxAge) {
      agentSessions.delete(key)
    }
  }
}, 60 * 60 * 1000) // Clean every hour

/**
 * POST /api/orientation/agent
 * Process user input through the orientation agent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, input } = body

    if (!action || !input) {
      return NextResponse.json({ error: 'Missing action or input' }, { status: 400 })
    }

    // Get or create agent session
    const userId = session.user.email
    let sessionEntry = agentSessions.get(userId)
    let agent = sessionEntry?.agent

    console.log(`[ORIENTATION] userId=${userId}, action=${action}, agentExists=${!!agent}`)

    if (!agent) {
      console.log(`[ORIENTATION] Creating NEW agent for userId=${userId}`)
      agent = new OrientationAgent(userId)
      agentSessions.set(userId, { agent, lastActivity: Date.now() })
    } else {
      // Update last activity time
      console.log(`[ORIENTATION] Reusing EXISTING agent for userId=${userId}, currentStage=${(agent as any).state.currentStage}`)
      sessionEntry.lastActivity = Date.now()
      agentSessions.set(userId, sessionEntry)
    }

    // Process user input based on action
    let response: AgentResponse

    switch (action) {
      case 'start':
        response = {
          message: `Welcome! I'm your career mentor. Let's explore your path together.
          
I'll customize this journey based on your current situation. Choose:

1. I know my target role - You have a clear goal, let's focus on getting there
2. I'm exploring options - You're curious about multiple paths
3. I have no idea - Let's discover together based on your interests

What's your situation?`,
          ui: {
            type: 'input',
            data: {
              type: 'workflow-selection',
              options: [
                {
                  id: 'clear-goal',
                  label: 'I know my target role',
                  description: 'I have a specific career goal in mind',
                },
                {
                  id: 'confused',
                  label: 'I\'m exploring options',
                  description: 'I want to compare different paths',
                },
                {
                  id: 'exploring',
                  label: 'I have no idea',
                  description: 'Let\'s discover based on my interests',
                },
              ],
            },
          },
          insights: {},
          nextAction: 'select-workflow',
        }
        break

      case 'select-workflow':
        // Force reset to workflow-selection stage to handle workflow switching mid-conversation
        ;(agent as any).state.currentStage = 'workflow-selection'
        response = await agent.processUserInput({
          type: 'workflow-selection',
          content: { workflow: input.workflow },
        })
        break

      case 'workflow-option-select':
        // Handle workflow option selection from UI buttons (alternative routing)
        response = await agent.processUserInput({
          type: 'workflow-selection',
          content: { workflow: input.option },
        })
        break

      case 'submit-target-role':
        // Parse the comma-separated skills string into skill objects
        const skillsString = input.currentSkills || ''
        const skillsArray = skillsString
          .split(',')
          .map((s: string) => ({
            name: s.trim(),
            level: input.skillLevel || 'intermediate',
          }))
          .filter((s: any) => s.name.length > 0)

        response = await agent.processUserInput({
          type: 'skill-entry',
          content: {
            targetRole: input.targetRole,
            skills: skillsArray,
          },
        })
        break

      case 'assess-interests':
        // Convert slider values to interest object - supports both basic (3) and expanded (6) interest assessments
        response = await agent.processUserInput({
          type: 'interest-input',
          content: {
            interests: {
              coding: input.coding || 5,
              creativity: input.creativity || 5,
              systems: input.systems || 5,
              problemSolving: input.problemSolving || 5,
              communication: input.communication || 5,
              learning: input.learning || 5,
            },
            background: input.background || '',
            skills: input.skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
          },
        })
        break

      case 'clarification':
        // Handle user text input OR role selection from comparison - pass it to the agent for processing
        response = await agent.processUserInput({
          type: 'clarification',
          content: {
            text: input.text || input.input || '',
            selectedRole: input.selectedRole || input.selectedRoleId,
          },
        })
        break

      case 'select-roles':
        // Check if this is a single role selection or multiple for comparison
        if (Array.isArray(input.selectedRoles) && input.selectedRoles.length === 1) {
          // Single role - proceed with analysis
          response = await agent.processUserInput({
            type: 'role-selection',
            content: {
              selectedRoleId: input.selectedRoles[0],
            },
          })
        } else {
          // Multiple roles - compare
          response = await agent.processUserInput({
            type: 'role-selection',
            content: {
              selectedRoles: input.selectedRoles,
            },
          })
        }
        break

      case 'finalize-role':
        console.log(`[ORIENTATION] finalize-role: selectedRole=${input.selectedRole}, currentStage=${(agent as any).state.currentStage}`)
        
        // Get the final role from agent state (targetRole or finalRole)
        const agentFinalRole = (agent as any).state.finalRole || (agent as any).state.targetRole
        
        // If already in decision state, don't reprocess - just show completion with redirect
        if ((agent as any).state.currentStage === 'decision') {
          console.log(`[ORIENTATION] Already finalized, returning completion with redirect to dashboard`)
          
          // Save to database if not already saved
          if (agentFinalRole) {
            const roleId = agentFinalRole.id || agentFinalRole.name
            console.log(`[ORIENTATION] Saving from already-finalized decision state: ${roleId}`)
            try {
              await saveOrientationDecision(userId, roleId)
              console.log(`[ORIENTATION] Successfully saved role to DB from decision state`)
            } catch (error) {
              console.error(`[ORIENTATION] Failed to save role to DB:`, error)
            }
          }
          
          return NextResponse.json({
            message: `Perfect! You've chosen ${agentFinalRole?.name || 'your role'}. Redirecting to your personalized dashboard...`,
            ui: {
              type: 'completion',
              data: {
                selectedRole: agentFinalRole,
                redirect: '/dashboard',
              },
            },
            insights: {},
            nextAction: 'navigate-dashboard',
          })
        }
        
        // Process the role selection
        response = await agent.processUserInput({
          type: 'clarification',
          content: {
            selectedRole: input.selectedRole,
          },
        })
        console.log(`[ORIENTATION] finalize-role response.ui.type=${response.ui?.type}, newStage=${(agent as any).state.currentStage}`)
        
        // Save to database if we just transitioned to decision stage
        // Use agent state's finalRole/targetRole if input.selectedRole is not provided
        if ((agent as any).state.currentStage === 'decision') {
          const roleToSave = input.selectedRole || agentFinalRole
          if (roleToSave) {
            const roleId = roleToSave.id || roleToSave.name || roleToSave
            console.log(`[ORIENTATION] Saving role decision to DB: ${roleId}`)
            try {
              await saveOrientationDecision(userId, roleId)
              console.log(`[ORIENTATION] Successfully saved role to DB`)
              // Add redirect to response
              response.ui = {
                ...response.ui,
                data: {
                  ...response.ui?.data,
                  redirect: '/dashboard',
                },
              }
              response.nextAction = 'navigate-dashboard'
            } catch (error) {
              console.error(`[ORIENTATION] Failed to save role to DB:`, error)
            }
          }
        }
        break

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json(response)
  } catch(error) {
    console.error('Orientation agent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/orientation/agent
 * Get roles and information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const domain = searchParams.get('domain')
    const action = searchParams.get('action')

    // Return all roles
    if (action === 'list-roles') {
      const allRoles = getAllRoles()
      return NextResponse.json({
        roles: allRoles.map(r => ({
          id: r.id,
          name: r.name,
          domain: r.domain,
          description: r.description,
          demandLevel: r.demandLevel,
          difficulty: r.difficulty,
          salaryRange: r.salaryRangeIndia,
        })),
        count: allRoles.length,
      })
    }

    // Return single role details
    if (action === 'role-details' && query) {
      const role = getRoleById(query)
      if (!role) {
        return NextResponse.json({ error: 'Role not found' }, { status: 404 })
      }
      return NextResponse.json(role)
    }

    // Return roles by domain
    if (domain) {
      const domainRoles = getAllRoles().filter(r => r.domain === domain)
      return NextResponse.json({
        domain,
        roles: domainRoles,
        count: domainRoles.length,
      })
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  } catch (error) {
    console.error('Orientation GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Save orientation decision to database
 */
async function saveOrientationDecision(userEmail: string, selectedRoleId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) return

    // Try to find the role in the database
    let role = getRoleById(selectedRoleId)
    let domain = 'Software Engineering' // Default domain
    
    // If not found as ID, try searching by name (for free-form roles)
    if (!role) {
      console.log(`[SAVE] Role ID '${selectedRoleId}' not found in database, trying search...`)
      const searchResults = searchRoles(selectedRoleId)
      if (searchResults.length > 0) {
        role = searchResults[0]
        console.log(`[SAVE] Found role by search: ${role.name}`)
      } else {
        // For free-form roles that don't match database, use a generic mapping
        console.log(`[SAVE] Free-form role '${selectedRoleId}', using default domain`)
        // Keep the free-form role name but use a sensible default domain
        domain = 'Software Engineering'
      }
    }
    
    const finalDomain = role?.domain || domain
    const roleToSave = selectedRoleId // Save the exact role name/ID provided

    // Update user orientation session
    await prisma.orientationSession.upsert({
      where: { userId: user.id },
      update: {
        finalRoleId: roleToSave,
        finalDomain: finalDomain,
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        workflowType: 'clear-goal',
        finalRoleId: roleToSave,
        finalDomain: finalDomain,
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    // Update user selected role
    await prisma.user.update({
      where: { id: user.id },
      data: {
        selectedRole: roleToSave,
        selectedDomain: finalDomain,
      },
    })
    
    console.log(`[SAVE] Successfully saved role '${roleToSave}' with domain '${finalDomain}'`)
  } catch (error) {
    console.error('Error saving orientation decision:', error)
  }
}
