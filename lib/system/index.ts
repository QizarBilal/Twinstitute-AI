/**
 * SYSTEM INDEX
 * Central export for all Twinstitute AI system utilities
 */

// Types
export * from './types'

// API Client
export { apiClient } from './apiClient'

// Data Flow & Orchestration
export {
    initializeUserSession,
    selectDomain,
    initializeUserProfile,
    generatePersonalizedRoadmap,
    generateInitialTasks,
    submitTaskForEvaluation,
    evaluateSubmissionAndUpdate,
    generateProofArtifact,
    consultMentor,
    simulateCareerOutcome,
    getSystemState,
    onDomainSelected,
    onTaskCompleted,
    onSkillUpdated,
    getFlowLog,
    clearFlowLog,
} from './dataFlow'

// Flow Logger (Priority 2: Flow Verification)
export { flowLogger, SystemEventType } from './flowLogger'

// System Engine (Priority 4: Event-Driven Automation)
export { onTaskSubmitted } from './engine'

// Context & Hooks
export {
    SystemProvider,
    useSystem,
    useUserProfile,
    useCapabilityTwin,
    useSkillGenome,
    useRoadmap,
    useDomain,
    useSystemState,
} from './context'

// Data Fetching Hooks
export {
    useDataFetch,
    useUser,
    useTwin,
    useGenome,
    useRoadmap as useRoadmapData,
    useTasks,
    useSubmissions,
    useProofs,
    useSimulation,
    useMutation,
    usePaginatedFetch,
} from './hooks'

// Error Handling & UI
export {
    ErrorBoundary,
    ApiError,
    SkeletonCard,
    SkeletonText,
    SkeletonGrid,
    SkeletonChart,
    EmptyState,
    LoadingOverlay,
    DataStateWrapper,
} from './errorBoundary'
