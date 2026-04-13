import React from 'react'

// Form wrapper
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  spacing?: 'sm' | 'md' | 'lg'
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ spacing = 'md', className, children, ...props }, ref) => {
    const spacings = {
      sm: 'space-y-3',
      md: 'space-y-4',
      lg: 'space-y-6',
    }

    return (
      <form
        ref={ref}
        className={`${spacings[spacing]} ${className || ''}`}
        {...props}
      >
        {children}
      </form>
    )
  }
)

Form.displayName = 'Form'

// Form group
interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormGroup: React.FC<FormGroupProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

// Form label
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={`
        block text-sm font-medium text-gray-300
        ${className || ''}
      `}
      {...props}
    >
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  )
)

Label.displayName = 'Label'

// Form error
interface FormErrorProps {
  message?: string
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null

  return <p className="text-xs text-red-400">{message}</p>
}

// Form section
interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  className,
  children,
  ...props
}) => {
  return (
    <div className={`space-y-4 ${className || ''}`} {...props}>
      {title && (
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

// Form actions (footer with buttons)
interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'space-between'
}

export const FormActions: React.FC<FormActionsProps> = ({
  align = 'right',
  className,
  children,
  ...props
}) => {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    'space-between': 'justify-between',
  }[align]

  return (
    <div
      className={`
        flex gap-3 items-center
        ${alignClass}
        pt-4 border-t border-gray-800
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
