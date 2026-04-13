/**
 * Adaptive Task Allocation Engine
 * Manages task queue, sequencing, and intelligent recommendations
 */

import { GeneratedTask } from './taskGenerator'

export interface TaskAllocationStrategy {
  type: 'challenge' | 'remedial' | 'breadth' | 'depth' | 'prerequisite'
  reason: string
  tasks: GeneratedTask[]
}

export interface UserTaskQueue {
  userId: string
  currentTask: GeneratedTask | null
  nextTasks: GeneratedTask[] // 3-5 upcoming tasks
  recommendedTasks: GeneratedTask[] // Alternative suggestions
  completedCount: number
  successStreak: number
  strugglingWith: string[] // Skills causing difficulty
  readyFor: string[] // Skills ready to advance
}

export class TaskAllocator {
  /**
   * Build personalized task queue for user
   */
  static buildTaskQueue(
    userId: string,
    currentCapability: number,
    successRate: number,
    skillGaps: string[],
    performanceHistory: any[]
  ): UserTaskQueue {
    const strategies = this.determineStrategies(
      currentCapability,
      successRate,
      skillGaps,
      performanceHistory
    )

    const queue: UserTaskQueue = {
      userId,
      currentTask: null,
      nextTasks: [],
      recommendedTasks: [],
      completedCount: performanceHistory.filter(p => p.performance > 70).length,
      successStreak: this.calculateSuccessStreak(performanceHistory),
      strugglingWith: this.identifyStruggles(performanceHistory),
      readyFor: this.identifyReadySkills(skillGaps, currentCapability),
    }

    // Apply strategies to build queue
    for (const strategy of strategies) {
      if (strategy.type === 'remedial' && queue.nextTasks.length < 5) {
        queue.nextTasks.push(...strategy.tasks.slice(0, 2))
      } else if (strategy.type === 'challenge' && queue.nextTasks.length < 5) {
        queue.nextTasks.push(...strategy.tasks.slice(0, 1))
      } else if (strategy.type === 'breadth' && queue.nextTasks.length < 5) {
        queue.nextTasks.push(strategy.tasks[0])
      }
    }

    // Add recommendations
    queue.recommendedTasks = strategies
      .filter(s => s.type === 'depth' || s.type === 'prerequisite')
      .flatMap(s => s.tasks.slice(0, 1))
      .slice(0, 3)

    return queue
  }

  /**
   * Determine allocation strategies based on performance
   */
  private static determineStrategies(
    currentCapability: number,
    successRate: number,
    skillGaps: string[],
    performanceHistory: any[]
  ): TaskAllocationStrategy[] {
    const strategies: TaskAllocationStrategy[] = []

    // STRATEGY 1: REMEDIAL (if struggling)
    if (successRate < 0.65) {
      strategies.push({
        type: 'remedial',
        reason: `Success rate low (${(successRate * 100).toFixed(0)}%). Building foundation.`,
        tasks: this.generateRemedialTasks(skillGaps, currentCapability),
      })
    }

    // STRATEGY 2: CHALLENGE (if performing well)
    if (successRate > 0.8 && currentCapability > 60) {
      strategies.push({
        type: 'challenge',
        reason: `Excellent performance. Ready for advanced challenges.`,
        tasks: this.generateChallengeTasks(skillGaps, currentCapability),
      })
    }

    // STRATEGY 3: BREADTH (increase skill diversity)
    if (skillGaps.length > 5) {
      strategies.push({
        type: 'breadth',
        reason: `Multiple skill gaps detected. Expanding breadth.`,
        tasks: this.generateBreadthTasks(skillGaps),
      })
    }

    // STRATEGY 4: DEPTH (master specific skills)
    if (successRate > 0.7) {
      strategies.push({
        type: 'depth',
        reason: `Building depth in core competencies.`,
        tasks: this.generateDepthTasks(skillGaps, performanceHistory),
      })
    }

    // STRATEGY 5: PREREQUISITE (fix critical gaps)
    const criticalGaps = this.identifyCriticalGaps(skillGaps, performanceHistory)
    if (criticalGaps.length > 0) {
      strategies.push({
        type: 'prerequisite',
        reason: `Critical gaps found: ${criticalGaps.join(', ')}`,
        tasks: this.generatePrerequisiteTasks(criticalGaps),
      })
    }

    return strategies
  }

  /**
   * Generate remedial tasks for struggling users
   */
  private static generateRemedialTasks(
    skillGaps: string[],
    currentCapability: number
  ): GeneratedTask[] {
    // Generate simpler versions of tasks targeting weakest skills
    return skillGaps.slice(0, 2).map(skill => ({
      id: `remedial_${skill}_${Date.now()}`,
      title: `Master ${skill}: Step-by-Step`,
      description: `Break down ${skill} into digestible concepts with guided practice`,
      realWorldContext: `Building confidence in ${skill}`,
      skillsFocused: [skill],
      skillsSecondary: [],
      difficulty: Math.max(1, currentCapability / 10 - 2),
      estimatedTime: 60, // 1 hour
      taskType: 'micro',
      domain: 'Foundation',
      expectedOutput: `Demonstrate 3 key concepts of ${skill}`,
      successCriteria: [
        `Explain ${skill} fundamentals`,
        `Implement basic pattern`,
        `Debug sample code`,
      ],
      priority: 1,
      personalizationFactors: {
        targetedSkills: [skill],
        addressesWeakness: true,
        buildsOnStrength: false,
        estimatedCompletion: '1 hour',
      },
    }))
  }

  /**
   * Generate challenging tasks for high performers
   */
  private static generateChallengeTasks(
    skillGaps: string[],
    currentCapability: number
  ): GeneratedTask[] {
    return [
      {
        id: `challenge_${Date.now()}`,
        title: 'Design System Architecture Challenge',
        description:
          'Architect a system to handle millions of requests. Include caching, load balancing, fault tolerance.',
        realWorldContext: 'Design interview level challenge',
        skillsFocused: ['System Design', 'Distributed Systems'],
        skillsSecondary: skillGaps.slice(0, 2),
        difficulty: Math.min(10, currentCapability / 10 + 2),
        estimatedTime: 480, // 8 hours
        taskType: 'mid',
        domain: 'Advanced',
        expectedOutput: 'Complete system design document with trade-offs',
        successCriteria: [
          'Scalability addressed',
          'Fault tolerance included',
          'Trade-offs documented',
          'Performance metrics defined',
        ],
        priority: 2,
        personalizationFactors: {
          targetedSkills: ['System Design'],
          addressesWeakness: false,
          buildsOnStrength: true,
          estimatedCompletion: '8 hours',
        },
      },
    ]
  }

  /**
   * Generate tasks to expand skill breadth
   */
  private static generateBreadthTasks(skillGaps: string[]): GeneratedTask[] {
    return skillGaps.slice(0, 3).map(skill => ({
      id: `breadth_${skill}_${Date.now()}`,
      title: `Introduction to ${skill}`,
      description: `Learn fundamentals of ${skill} through practical project`,
      realWorldContext: `Explore ${skill} in real-world context`,
      skillsFocused: [skill],
      skillsSecondary: [],
      difficulty: 3,
      estimatedTime: 120,
      taskType: 'micro',
      domain: 'Breadth Building',
      expectedOutput: `Working project demonstrating ${skill} concepts`,
      successCriteria: [
        'Understands core concepts',
        'Can implement example',
        'Knows when to use it',
      ],
      priority: 2,
      personalizationFactors: {
        targetedSkills: [skill],
        addressesWeakness: true,
        buildsOnStrength: false,
        estimatedCompletion: '2 hours',
      },
    }))
  }

  /**
   * Generate depth-building tasks for mastery
   */
  private static generateDepthTasks(
    skillGaps: string[],
    performanceHistory: any[]
  ): GeneratedTask[] {
    // Focus on skills user already knows but can deepen
    const strongSkills = this.identifyStrengths(performanceHistory)
    return strongSkills.slice(0, 2).map(skill => ({
      id: `depth_${skill}_${Date.now()}`,
      title: `Master ${skill}: Advanced Patterns`,
      description: `Deep dive into advanced patterns and optimization in ${skill}`,
      realWorldContext: `Production-level expertise in ${skill}`,
      skillsFocused: [skill],
      skillsSecondary: [],
      difficulty: 7,
      estimatedTime: 360,
      taskType: 'mid',
      domain: 'Depth Building',
      expectedOutput: `Production-grade implementation with optimization`,
      successCriteria: [
        'Knows edge cases',
        'Optimized for performance',
        'Follows best practices',
        'Can mentor others',
      ],
      priority: 3,
      personalizationFactors: {
        targetedSkills: [skill],
        addressesWeakness: false,
        buildsOnStrength: true,
        estimatedCompletion: '6 hours',
      },
    }))
  }

  /**
   * Generate prerequisite tasks for critical skills
   */
  private static generatePrerequisiteTasks(criticalGaps: string[]): GeneratedTask[] {
    return criticalGaps.map(skill => ({
      id: `prereq_${skill}_${Date.now()}`,
      title: `Critical: Master ${skill}`,
      description: `This is a prerequisite for your target role. Master ${skill}.`,
      realWorldContext: `Fundamental requirement for your career path`,
      skillsFocused: [skill],
      skillsSecondary: [],
      difficulty: 2,
      estimatedTime: 90,
      taskType: 'micro',
      domain: 'Critical Path',
      expectedOutput: `Demonstrate competency in ${skill}`,
      successCriteria: [
        `Can explain ${skill}`,
        `Can implement basic example`,
        `Understands when to apply`,
      ],
      priority: 1,
      personalizationFactors: {
        targetedSkills: [skill],
        addressesWeakness: true,
        buildsOnStrength: false,
        estimatedCompletion: '1.5 hours',
      },
    }))
  }

  /**
   * Identify critical skill gaps that must be addressed
   */
  private static identifyCriticalGaps(
    skillGaps: string[],
    performanceHistory: any[]
  ): string[] {
    // Skills that appear in failures
    const failureSkills = new Set<string>()
    performanceHistory
      .filter(p => p.performance < 40)
      .forEach(p => {
        // Extract mentioned skills from task context
        // This would normally come from task metadata
      })

    return Array.from(failureSkills).slice(0, 2)
  }

  /**
   * Calculate current success streak
   */
  private static calculateSuccessStreak(performanceHistory: any[]): number {
    let streak = 0
    for (const record of [...performanceHistory].reverse()) {
      if (record.performance > 70) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  /**
   * Identify skills causing struggles
   */
  private static identifyStruggles(performanceHistory: any[]): string[] {
    const skillScores = new Map<string, number[]>()

    performanceHistory.forEach(record => {
      const skills = record.taskSkills || []
      skills.forEach((skill: string) => {
        if (!skillScores.has(skill)) {
          skillScores.set(skill, [])
        }
        skillScores.get(skill)!.push(record.performance)
      })
    })

    const struggles: string[] = []
    skillScores.forEach((scores, skill) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avgScore < 60) {
        struggles.push(skill)
      }
    })

    return struggles.sort(
      (a, b) =>
        (skillScores.get(a)?.reduce((a, b) => a + b, 0) || 0) -
        (skillScores.get(b)?.reduce((a, b) => a + b, 0) || 0)
    )
  }

  /**
   * Identify skills user is ready to advance
   */
  private static identifyReadySkills(
    skillGaps: string[],
    currentCapability: number
  ): string[] {
    // Skills not in gaps and with high capability
    if (currentCapability > 75) {
      return ['System Design', 'Advanced Architecture', 'Leadership']
    }
    return []
  }

  /**
   * Identify user's strong skills
   */
  private static identifyStrengths(performanceHistory: any[]): string[] {
    const skillScores = new Map<string, number[]>()

    performanceHistory.forEach(record => {
      const skills = record.taskSkills || []
      skills.forEach((skill: string) => {
        if (!skillScores.has(skill)) {
          skillScores.set(skill, [])
        }
        skillScores.get(skill)!.push(record.performance)
      })
    })

    const strengths: string[] = []
    skillScores.forEach((scores, skill) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avgScore > 80) {
        strengths.push(skill)
      }
    })

    return strengths
  }
}
