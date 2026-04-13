import React from 'react'
import { motion } from 'framer-motion'

// Table components
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  hover?: boolean
  striped?: boolean
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ hover = true, striped = true, className, ...props }, ref) => (
    <div className="overflow-x-auto border border-gray-800 rounded-lg">
      <table
        ref={ref}
        className={`w-full ${className || ''}`}
        {...props}
      />
    </div>
  )
)

Table.displayName = 'Table'

// Table header
export const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={`bg-gray-900/50 border-b border-gray-800 ${className || ''}`}
    {...props}
  />
))

TableHead.displayName = 'TableHead'

// Table body
export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={className || ''} {...props} />
))

TableBody.displayName = 'TableBody'

// Table row
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ hover = true, className, ...props }, ref) => (
    <tr
      ref={ref}
      className={`
        border-b border-gray-800 last:border-b-0
        ${hover ? 'hover:bg-gray-800/50 transition-colors' : ''}
        ${className || ''}
      `}
      {...props}
    />
  )
)

TableRow.displayName = 'TableRow'

// Table cell (header)
export const TableHeader = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={`
      px-6 py-3 text-left text-sm font-semibold text-gray-300
      ${className || ''}
    `}
    {...props}
  />
))

TableHeader.displayName = 'TableHeader'

// Table cell
export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={`px-6 py-4 text-sm text-gray-400 ${className || ''}`}
    {...props}
  />
))

TableCell.displayName = 'TableCell'

// List components
interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  divided?: boolean
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ divided = false, className, ...props }, ref) => (
    <ul
      ref={ref}
      className={`
        space-y-2
        ${divided ? 'divide-y divide-gray-800' : ''}
        ${className || ''}
      `}
      {...props}
    />
  )
)

List.displayName = 'List'

// List item
interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
}

export const ListItem = React.forwardRef<
  HTMLLIElement,
  ListItemProps
>(({ leadingIcon, trailingIcon, className, children, ...props }, ref) => (
  <li
    ref={ref}
    className={`
      flex items-center gap-3 py-2 px-3 rounded-lg
      hover:bg-gray-800/30 transition-colors
      ${className || ''}
    `}
    {...props}
  >
    {leadingIcon && <div className="flex-shrink-0">{leadingIcon}</div>}
    <div className="flex-1">{children}</div>
    {trailingIcon && <div className="flex-shrink-0">{trailingIcon}</div>}
  </li>
))

ListItem.displayName = 'ListItem'

// Timeline components
interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Timeline: React.FC<TimelineProps> = ({
  className,
  ...props
}) => (
  <div className={`space-y-6 ${className || ''}`} {...props} />
)

// Timeline item
interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dot?: React.ReactNode
  active?: boolean
  completed?: boolean
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  dot,
  active = false,
  completed = false,
  className,
  children,
  ...props
}) => {
  const dotColor = completed
    ? 'bg-emerald-500'
    : active
    ? 'bg-blue-500'
    : 'bg-gray-700'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-4 ${className || ''}`}
      {...(props as any)}
    >
      <div className="flex flex-col items-center">
        <div
          className={`
            w-3 h-3 rounded-full
            ${dot ? '' : dotColor}
          `}
        >
          {dot}
        </div>
        <div className="w-0.5 h-12 bg-gray-700" />
      </div>
      <div className="pb-8 flex-1">{children}</div>
    </motion.div>
  )
}

// Timeline dot component
interface TimelineDotProps {
  variant?: 'default' | 'completed' | 'active'
  icon?: React.ReactNode
}

export const TimelineDot: React.FC<TimelineDotProps> = ({
  variant = 'default',
  icon,
}) => {
  const variants = {
    default: 'bg-gray-700',
    completed: 'bg-emerald-500',
    active: 'bg-blue-500',
  }

  return (
    <div
      className={`
        w-3 h-3 rounded-full flex items-center justify-center
        ${variants[variant]}
      `}
    >
      {icon}
    </div>
  )
}
