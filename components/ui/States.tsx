import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode | string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  fullScreen?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📦',
  title,
  description,
  action,
  fullScreen = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex flex-col items-center justify-center text-center
        ${fullScreen ? 'min-h-screen' : 'py-12'}
      `}
    >
      {typeof icon === 'string' ? (
        <div className="text-6xl mb-4">{icon}</div>
      ) : (
        <div className="mb-4">{icon}</div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  error?: string
  action?: {
    label: string
    onClick: () => void
  }
  fullScreen?: boolean
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  error,
  action,
  fullScreen = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex flex-col items-center justify-center text-center
        ${fullScreen ? 'min-h-screen' : 'py-12'}
      `}
    >
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-3xl mb-4">
        ⚠️
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-md mb-4">{description}</p>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 max-w-md text-left w-full">
          <p className="text-xs text-red-400 font-mono break-words">{error}</p>
        </div>
      )}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}

// Not found state
interface NotFoundProps {
  fullScreen?: boolean
}

export const NotFound: React.FC<NotFoundProps> = ({ fullScreen = false }) => {
  return (
    <EmptyState
      icon="🔍"
      title="Not Found"
      description="The page or resource you're looking for doesn't exist."
      fullScreen={fullScreen}
    />
  )
}

// No data state
interface NoDataProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const NoData: React.FC<NoDataProps> = ({
  title = 'No data available',
  description = 'There is no data to display at this moment.',
  action,
}) => {
  return (
    <EmptyState
      icon="📊"
      title={title}
      description={description}
      action={action}
    />
  )
}

// Access denied state
interface AccessDeniedProps {
  fullScreen?: boolean
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  fullScreen = false,
}) => {
  return (
    <ErrorState
      title="Access Denied"
      description="You don't have permission to access this resource."
      fullScreen={fullScreen}
    />
  )
}
