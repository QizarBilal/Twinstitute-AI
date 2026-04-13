# Twinstitute UI Component System

Comprehensive design system documentation for the Twinstitute platform's reusable UI components library.

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Component Structure](#component-structure)
4. [Installation & Setup](#installation--setup)
5. [Component Categories](#component-categories)
6. [Best Practices](#best-practices)
7. [Theming & Styling](#theming--styling)
8. [Performance Optimization](#performance-optimization)
9. [Accessibility](#accessibility)
10. [Common Patterns](#common-patterns)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Twinstitute UI Component System is a centralized library of reusable, types-safe React components built with:

- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** primitives for accessibility
- **Zod** for form validation

### Goals

✅ **Consistency**: Unified look and feel across the platform
✅ **Reusability**: Write once, use everywhere
✅ **Maintainability**: Single source of truth for UI patterns
✅ **Type Safety**: Full TypeScript support with prop validation
✅ **Accessibility**: WCAG 2.1 AA compliance
✅ **Performance**: Optimized rendering and lazy loading

---

## Core Principles

### 1. Single Responsibility
Each component has one primary purpose. Complex UIs are built by composing simple components.

```tsx
// ✅ Good: Simple, focused component
export const Button = ({ variant = 'primary', ...props }) => (
  <button className={buttonStyles[variant]} {...props} />
)

// ❌ Avoid: Too many responsibilities
export const ComplexButton = ({ /* 15+ props */ }) => {
  // Multiple concerns mixed together
}
```

### 2. Prop-Driven Behavior
Configuration through props, not internal logic variations.

```tsx
// ✅ Good: Transparent behavior through props
<Button variant="primary" size="lg" loading={true} disabled={false} />

// ❌ Avoid: Hidden state changes
<Button setupLargeTheme largeConfLoadingState />
```

### 3. Composition Over Inheritance
Build complex components from simple ones.

```tsx
// ✅ Good: Composition
<Card>
  <CardHeader>Title</CardHeader>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// ❌ Avoid: Nested prop drilling
<Card variant="withHeader" title="Title" footerButton="Action" />
```

### 4. Accessibility First
All components are accessible by default. No special props needed for a11y.

### 5. Styling Consistency
Tailwind utilities + design tokens (colors, spacing, fonts) from `design-system.ts`

---

## Component Structure

### File Organization

```
components/ui/
├── Button/
│   ├── Button.tsx          # Main component
│   ├── Button.types.ts     # TypeScript definitions
│   ├── Button.styles.ts    # Tailwind styles/constants
│   ├── Button.stories.tsx  # Storybook file
│   └── index.ts            # Export
├── Card/
│   ├── Card.tsx
│   ├── CardHeader.tsx
│   ├── CardFooter.tsx
│   ├── Card.types.ts
│   ├── Card.styles.ts
│   └── index.ts
├── Form/
│   ├── Form.tsx
│   ├── FormGroup.tsx
│   ├── FormSection.tsx
│   ├── FormActions.tsx
│   ├── Label.tsx
│   ├── Form.types.ts
│   ├── Form.styles.ts
│   └── index.ts
├── Input/
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Input.types.ts
│   ├── Input.styles.ts
│   └── index.ts
├── index.ts                # Central barrel export
└── README.md              # This file
```

### Module Exports

**Central barrel export** (`components/ui/index.ts`):
```tsx
export { Button } from './Button'
export { Card, CardHeader, CardFooter } from './Card'
export { Form, FormGroup, FormSection, FormActions, Label } from './Form'
// ... all components
```

**Usage:**
```tsx
import { Button, Card, Form } from '@/components/ui'
```

---

## Installation & Setup

### 1. No Installation Required
Components are already integrated. Just import them.

### 2. Basic Usage

```tsx
'use client'

import { Button, Card, Input } from '@/components/ui'

export default function MyPage() {
  return (
    <Card>
      <h2>Sign In</h2>
      <Input placeholder="Email" type="email" />
      <Button>Sign In</Button>
    </Card>
  )
}
```

### 3. Form Example

```tsx
'use client'

import { useState } from 'react'
import { Form, FormGroup, FormSection, Label, Input, Button } from '@/components/ui'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <Form onSubmit={handleSubmit} spacing="lg">
      <FormSection title="Account Credentials">
        <FormGroup>
          <Label required>Email</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label required>Password</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormGroup>
      </FormSection>

      <Button type="submit" fullWidth>
        Sign In
      </Button>
    </Form>
  )
}
```

---

## Component Categories

### 1. **BUTTON COMPONENTS**

#### Button
Primary interactive element for user actions.

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `icon`: React.ReactNode (optional)

**Variants:**
```tsx
<Button variant="primary">Primary Action</Button>        {/* Blue, main CTA */}
<Button variant="secondary">Secondary Action</Button>    {/* Gray, less emphasis */}
<Button variant="danger">Delete</Button>                {/* Red, destructive */}
<Button variant="success">Confirm</Button>              {/* Green, success */}
<Button variant="ghost">Link-like button</Button>       {/* Minimal styling */}
```

**States:**
```tsx
<Button loading>Processing...</Button>                   {/* Spinner + disabled */}
<Button disabled>Disabled</Button>                       {/* Gray, pointer-events: none */}
<Button fullWidth>Full Width</Button>                   {/* Spans container width */}
```

---

### 2. **CARD COMPONENTS**

Container for grouped content.

```tsx
<Card variant="default">
  <CardHeader>
    <h2>Card Title</h2>
  </CardHeader>
  
  <p>Card content goes here</p>
  
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Variants:**
- `default`: Standard card with subtle border
- `gradient`: Gradient background, interactive effect
- `success`: Green accent for positive states
- `danger`: Red accent for error states
- `info`: Blue accent for informational content

**Props:**
- `variant`: CardVariant
- `interactive`: boolean (hover effects)
- `padding`: 'sm' | 'md' | 'lg'
- `clickable`: boolean

---

### 3. **FORM COMPONENTS**

#### Form
Container for form layout with validation integration.

```tsx
<Form onSubmit={handleSubmit} spacing="lg">
  <FormSection title="Personal Info">
    <FormGroup>
      <Label required>Full Name</Label>
      <Input type="text" />
    </FormGroup>
  </FormSection>

  <FormActions align="right">
    <Button variant="secondary">Cancel</Button>
    <Button type="submit">Submit</Button>
  </FormActions>
</Form>
```

**Props:**
- `onSubmit`: (e: FormEvent) => void
- `spacing`: 'sm' | 'md' | 'lg'
- `validation`: Zod schema (optional)

#### FormGroup
Wrapper for a single form field.

```tsx
<FormGroup error="This field is required">
  <Label required>Username</Label>
  <Input />
</FormGroup>
```

#### Label
Form field label with optional required asterisk.

```tsx
<Label required>Email Address</Label>
```

---

### 4. **INPUT COMPONENTS**

#### Input
Text input field with variants.

```tsx
<Input
  type="email"
  placeholder="you@example.com"
  error="Invalid email"
  disabled={false}
  required={true}
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `error`: string (displays error message below)
- `disabled`: boolean
- `required`: boolean
- `maxLength`: number
- `pattern`: string (regex)

#### Textarea
Multi-line text input.

```tsx
<Textarea
  placeholder="Enter your message..."
  rows={5}
  error={error}
/>
```

**Props:**
- `rows`: number
- `maxLength`: number
- `error`: string
- `disabled`: boolean

#### Select
Dropdown selection.

```tsx
<Select
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]}
  value={selected}
  onChange={handleChange}
/>
```

---

### 5. **BADGE COMPONENTS**

#### Badge
Small label/tag for categorization.

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Failed</Badge>
```

**Variants:**
- `default`: Gray background
- `success`: Green background
- `warning`: Yellow background
- `danger`: Red background
- `info`: Blue background

---

### 6. **MODAL COMPONENTS**

#### Modal
Dialog overlay for focused interactions.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure?</p>
  <div className="flex gap-2 justify-end mt-6">
    <Button variant="secondary" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </div>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `closeButton`: boolean (default: true)
- `backdrop`: boolean (default: true)

---

### 7. **ALERT COMPONENTS**

#### Alert
Informational message box.

```tsx
<Alert variant="info" title="Heads Up">
  This is an informational message.
</Alert>

<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>

<Alert variant="warning" title="Warning">
  Please review before proceeding.
</Alert>

<Alert variant="danger" title="Error">
  Something went wrong.
</Alert>
```

**Variants:**
- `info`: Blue, informational
- `success`: Green, positive outcome
- `warning`: Yellow, caution
- `danger`: Red, critical issue

---

### 8. **STATE COMPONENTS**

#### EmptyState
Display when no content available.

```tsx
<EmptyState
  icon="📦"
  title="No items found"
  description="Create your first item to get started"
  action={{
    label: 'Create Item',
    onClick: () => handleCreate(),
  }}
/>
```

#### ErrorState
Display when error occurs.

```tsx
<ErrorState
  title="Something went wrong"
  description="We couldn't load your data. Please try again."
  action={{
    label: 'Retry',
    onClick: () => handleRetry(),
  }}
/>
```

---

### 9. **LOADING COMPONENTS**

#### Spinner
Loading indicator.

```tsx
<Spinner size="md" />
<Spinner size="sm" color="primary" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg'
- `color`: 'primary' | 'secondary' | 'white'

#### Skeleton
Loading placeholder.

```tsx
<Skeleton width="100%" height="20px" />
<Skeleton width="200px" height="12px" className="mb-2" />
```

---

### 10. **DATA DISPLAY COMPONENTS**

#### Table
Structured data display.

```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Email</TableHeader>
      <TableHeader>Status</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.email}</TableCell>
        <TableCell>
          <Badge variant="success">{row.status}</Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### List
Flexible list display.

```tsx
<List>
  {items.map((item) => (
    <ListItem key={item.id} onClick={() => handleSelect(item)}>
      <span>{item.name}</span>
      <Badge>{item.category}</Badge>
    </ListItem>
  ))}
</List>
```

---

## Best Practices

### ✅ DO's

1. **Use TypeScript interfaces**: Fully type your props
   ```tsx
   interface MyComponentProps {
     title: string
     onClose: () => void
     items: Item[]
   }
   ```

2. **Compose over customize**: Build complex UIs from simple components
   ```tsx
   // ✅ Good
   <Card>
     <CardHeader>Title</CardHeader>
     <Button>Action</Button>
   </Card>
   ```

3. **Use design tokens**: Colors, spacing, fonts from design system
   ```tsx
   // In styles
   className="bg-primary-500 text-white p-4 rounded-lg"
   ```

4. **Memoize components**: Prevent unnecessary re-renders
   ```tsx
   export const MyComponent = React.memo(({ prop1, prop2 }) => {
     // ...
   })
   ```

5. **Handle loading states**: Always show feedback
   ```tsx
   <Button loading={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
   ```

### ❌ DON'Ts

1. **Don't override styles**: Use variants instead
   ```tsx
   // ❌ Bad
   <Button className="bg-red-500 p-10">Custom</Button>
   
   // ✅ Good
   <Button variant="danger">Delete</Button>
   ```

2. **Don't prop drill**: Use context for global state
   ```tsx
   // ❌ Bad: passing props through multiple levels
   <Parent prop1={value} prop2={value} prop3={value} />
   
   // ✅ Good: use context
   <ThemeProvider theme={theme}>
     <Child />
   </ThemeProvider>
   ```

3. **Don't mix concerns**: Keep components focused
   ```tsx
   // ❌ Bad: fetching + UI logic in same component
   const ComplexComponent = () => {
     useEffect(() => { fetch(); }, [])
     return <Form /> // + data transformation + validation
   }
   
   // ✅ Good: separate concerns
   const Container = () => {
     const { data } = useFetch()
     return <Form initialData={data} />
   }
   ```

4. **Don't ignore accessibility**: ARIA labels, semantic HTML
   ```tsx
   // ✅ Good
   <button aria-label="Close modal" onClick={onClose}>×</button>
   
   // ❌ Avoid
   <div onClick={onClose}>×</div>
   ```

---

## Theming & Styling

### Design Tokens

All components use design tokens from `lib/design-system.ts`:

```typescript
// Colors
const colors = {
  primary: '#3B82F6',        // Blue
  secondary: '#6B7280',      // Gray
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Amber
  danger: '#EF4444',         // Red
  // ...
}

// Spacing
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  // ...
}

// Typography
const fonts = {
  body: 'system-ui, -apple-system, sans-serif',
  mono: 'Menlo, Monaco, monospace',
}
const fontSizes = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
}
```

### Tailwind Customization

`tailwind.config.ts` extends Tailwind with custom colors and spacing:

```typescript
export default {
  extend: {
    colors: {
      primary: { 500: '#3B82F6' },
      success: { 500: '#10B981' },
    },
    spacing: {
      'medium': '1rem',
    },
  },
}
```

### Dark Mode

All components support dark mode via Tailwind:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Adapts to system theme
</div>
```

---

## Performance Optimization

### 1. Code Splitting
Components are lazy-loaded when possible:

```tsx
const Modal = dynamic(() => import('./Modal'), { ssr: false })
```

### 2. Memoization
Prevent unnecessary re-renders:

```tsx
export const Button = React.memo(
  ({ onClick, children, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
)
```

### 3. Virtualization
For long lists, use virtualization:

```tsx
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={35}
>
  {({ index, style }) => (
    <div style={style}>{items[index]}</div>
  )}
</FixedSizeList>
```

### 4. Image Optimization
Use Next.js `Image` component:

```tsx
import Image from 'next/image'

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={40}
  height={40}
  priority={false}
/>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

All components meet accessibility standards:

1. **Semantic HTML**: Proper heading hierarchy, form labels
2. **ARIA Attributes**: `aria-label`, `aria-describedby`, `aria-live`
3. **Keyboard Navigation**: Tab order, focus management
4. **Color Contrast**: Minimum 4.5:1 ratio for text
5. **Screen Readers**: Compatible with NVDA, JAWS, VoiceOver

### Examples

```tsx
// ✅ Good: Semantic form
<form onSubmit={handleSubmit}>
  <label htmlFor="email">Email</label>
  <input id="email" type="email" aria-required="true" />
  <button type="submit">Submit</button>
</form>

// ✅ Good: Modal with focus trap
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Confirmation</h2>
  {/* Content */}
</Modal>

// ✅ Good: Button with loading indicator
<button
  disabled={isLoading}
  aria-busy={isLoading}
  aria-label={isLoading ? 'Saving...' : 'Save'}
>
  {isLoading ? <Spinner /> : 'Save'}
</button>
```

---

## Common Patterns

### 1. Form with Validation

```tsx
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Form, FormGroup, FormSection, Label, Input, Button } from '@/components/ui'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

type FormData = z.infer<typeof schema>

export default function LoginForm() {
  const [data, setData] = useState<Partial<FormData>>({})
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const result = schema.safeParse(data)
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      return
    }

    // Submit
    setLoading(true)
    try {
      await submitLogin(result.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormSection title="Login">
        <FormGroup>
          <Label required>Email</Label>
          <Input
            type="email"
            value={data.email || ''}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            error={errors.email?.[0]}
          />
        </FormGroup>

        <FormGroup>
          <Label required>Password</Label>
          <Input
            type="password"
            value={data.password || ''}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            error={errors.password?.[0]}
          />
        </FormGroup>
      </FormSection>

      <Button type="submit" loading={loading} fullWidth>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </Form>
  )
}
```

### 2. Modal Dialog Pattern

```tsx
'use client'

import { useState } from 'react'
import { Button, Modal, Alert } from '@/components/ui'

export default function DeleteDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteItem()
      setIsOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete Item
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isDeleting && setIsOpen(false)}
        title="Delete Item"
      >
        <Alert variant="danger" title="This action cannot be undone">
          Are you sure you want to delete this item?
        </Alert>

        <div className="flex gap-2 justify-end mt-6">
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
```

### 3. Data Table with Actions

```tsx
'use client'

import { useState } from 'react'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Badge, Button } from '@/components/ui'

interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  joinDate: string
}

interface Props {
  users: User[]
  onEdit: (userId: string) => void
  onDelete: (userId: string) => void
}

export default function UsersTable({ users, onEdit, onDelete }: Props) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Join Date</TableHeader>
          <TableHeader align="right">Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell fontWeight="medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
            <TableCell align="right">
              <div className="flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(user.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(user.id)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## Troubleshooting

### Issue: Components not rendering

**Solution**: Ensure you're using `'use client'` directive in browser components:
```tsx
'use client'
import { Button } from '@/components/ui'
```

### Issue: Styles not applying

**Solution**: Check that Tailwind CSS is properly included:
```tsx
// In app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Issue: TypeScript errors

**Solution**: Import type definitions:
```tsx
import { ButtonProps } from '@/components/ui'

const MyButton: React.FC<ButtonProps> = (props) => {
  // ...
}
```

### Issue: Modal backdrop not closing

**Solution**: Ensure `onClose` is properly connected:
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}  // Required
  title="Title"
>
  Content
</Modal>
```

### Issue: Form validation not triggering

**Solution**: Wrap form data in state and validate on submit:
```tsx
const [errors, setErrors] = useState({})

const handleSubmit = (e) => {
  e.preventDefault()
  const result = validate(formData)
  if (!result.success) {
    setErrors(result.error.flatten().fieldErrors)
    return
  }
  // Submit
}
```

---

## Migration Guide

### Updating existing components to use UI system

**Before:**
```tsx
// Inline styles, no reusability
<button
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  onClick={handleClick}
>
  Click
</button>
```

**After:**
```tsx
import { Button } from '@/components/ui'

<Button variant="primary" onClick={handleClick}>
  Click
</Button>
```

---

## Contributing

To add a new component to the system:

1. Create component folder: `components/ui/NewComponent/`
2. Implement component file: `NewComponent.tsx`
3. Add TypeScript types: `NewComponent.types.ts`
4. Add Tailwind styles: `NewComponent.styles.ts` (if needed)
5. Create export: `NewComponent/index.ts`
6. Export from barrel: `components/ui/index.ts`
7. Add documentation to this README
8. Create Storybook file: `NewComponent.stories.tsx`

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev)

---

**Last Updated**: 2026
**Maintained By**: Twinstitute Development Team
