/**
 * Twinstitute UI Components Library
 * Central barrel export for all reusable UI components.
 * Ensures consistent imports and maintains design system cohesion.
 *
 * Usage:
 * import { Button, Card, Input } from '@/components/ui'
 */

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================
export { Button } from './Button'

// ============================================================================
// CARD COMPONENTS
// ============================================================================
export { Card, CardHeader, CardFooter } from './Card'

// ============================================================================
// FORM COMPONENTS
// ============================================================================
export { Form, FormGroup, FormSection, FormActions, Label, FormError } from './Form'

// ============================================================================
// INPUT COMPONENTS
// ============================================================================
export { Input } from './Input'
export { Textarea } from './Input'
export { Select } from './Input'

// ============================================================================
// BADGE & STATUS COMPONENTS
// ============================================================================
export { Badge, StatusBadge } from './Badge'

// ============================================================================
// MODAL & DRAWER COMPONENTS
// ============================================================================
export { Modal, Dialog, Drawer } from './Modal'

// ============================================================================
// ALERT & NOTIFICATION COMPONENTS
// ============================================================================
export { Alert, Toast, ToastContainer } from './Alert'

// ============================================================================
// STATE & EMPTY STATE COMPONENTS
// ============================================================================
export { EmptyState, ErrorState, NotFound, NoData, AccessDenied } from './States'

// ============================================================================
// LOADING & SKELETON COMPONENTS
// ============================================================================
export { Spinner, Loading, Skeleton, Pulse } from './Loading'

// ============================================================================
// DATA DISPLAY COMPONENTS
// ============================================================================
export {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  List,
  ListItem,
  Timeline,
  TimelineItem,
  TimelineDot,
} from './Data'
