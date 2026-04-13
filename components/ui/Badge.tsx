import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'primary'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  children,
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-gray-800 text-gray-300 border border-gray-700',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    primary: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded',
    md: 'px-3 py-1 text-sm font-medium rounded-lg',
  }

  return (
    <span
      className={`
        inline-block font-semibold
        ${variants[variant]}
        ${sizes[size]}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

// Status badge with dot
interface StatusBadgeProps extends BadgeProps {
  status?: 'online' | 'offline' | 'idle' | 'busy'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'online',
  children,
  ...props
}) => {
  const statusColors = {
    online: 'emerald',
    offline: 'gray',
    idle: 'amber',
    busy: 'red',
  }

  const color = statusColors[status]

  return (
    <Badge
      variant="default"
      className={`bg-${color}-500/10 border-${color}-500/30 flex items-center gap-2`}
      {...props}
    >
      <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
      {children}
    </Badge>
  )
}
