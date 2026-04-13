/**
 * EXAMPLE REFACTORED COMPONENT
 * Shows how to use the new UI component system
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Button,
  Card,
  CardHeader,
  CardFooter,
  Input,
  Textarea,
  Select,
  Badge,
  Modal,
  Alert,
  Form,
  FormGroup,
  Label,
  FormSection,
  FormActions,
  Spinner,
  EmptyState,
  ErrorState,
} from '@/components/ui'
import { useToast } from '@/hooks/useToast'

// Example form state
interface FormData {
  email: string
  message: string
  priority: string
}

export default function ExampleRefactoredPage() {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    message: '',
    priority: 'medium',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const { success, error } = useToast()

  // Validation
  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.message) newErrors.message = 'Message is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      error('Please fix validation errors')
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      success('Message sent successfully!')
      setFormData({ email: '', message: '', priority: 'medium' })
      setIsModalOpen(false)
    } catch (err) {
      error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Example Refactored Page
        </h1>
        <p className="text-gray-400">
          Demonstrates the new reusable UI component system
        </p>
      </div>

      {/* Info Alert */}
      <Alert variant="info" title="Pro Tip">
        This page uses the new UI component system. All components are
        reusable and consistent across the app.
      </Alert>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Basic Card */}
        <Card variant="default">
          <CardHeader>
            <h3 className="font-semibold text-white">Card 1</h3>
          </CardHeader>
          <p className="text-gray-400 text-sm mb-4">
            Basic card with default styling
          </p>
          <CardFooter>
            <Button variant="secondary" size="sm" fullWidth>
              Action
            </Button>
          </CardFooter>
        </Card>

        {/* Gradient Card */}
        <Card variant="gradient" interactive>
          <CardHeader>
            <h3 className="font-semibold text-white">Card 2</h3>
          </CardHeader>
          <p className="text-gray-400 text-sm mb-4">
            Gradient card with interactive hover
          </p>
          <div className="flex gap-2">
            <Badge variant="success">Active</Badge>
            <Badge variant="info">6 days</Badge>
          </div>
        </Card>

        {/* Success Card */}
        <Card variant="success">
          <CardHeader>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span>✓</span> Card 3
            </h3>
          </CardHeader>
          <p className="text-gray-400 text-sm">
            Success variant for positive states
          </p>
        </Card>
      </div>

      {/* Form Section */}
      <Card variant="default">
        <CardHeader>
          <h2 className="text-xl font-bold text-white">Contact Form</h2>
        </CardHeader>

        <Form onSubmit={handleSubmit} spacing="lg">
          <FormSection title="Contact Information">
            <FormGroup>
              <Label required>Email Address</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
              />
            </FormGroup>

            <FormGroup>
              <Label>Priority</Label>
              <Select
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              />
            </FormGroup>
          </FormSection>

          <FormSection title="Message">
            <FormGroup>
              <Label required>Your Message</Label>
              <Textarea
                placeholder="Tell us what you think..."
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                error={errors.message}
              />
            </FormGroup>
          </FormSection>

          <FormActions align="right">
            <Button
              variant="secondary"
              onClick={() => {
                setFormData({ email: '', message: '', priority: 'medium' })
                setErrors({})
              }}
              disabled={loading}
            >
              Reset
            </Button>
            <Button type="submit" loading={loading}>
              Send Message
            </Button>
          </FormActions>
        </Form>
      </Card>

      {/* Button Variants */}
      <Card variant="default">
        <CardHeader>
          <h2 className="text-xl font-bold text-white">Button Variants</h2>
        </CardHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" size="sm">
              Primary
            </Button>
            <Button variant="secondary" size="sm">
              Secondary
            </Button>
            <Button variant="danger" size="sm">
              Danger
            </Button>
            <Button variant="success" size="sm">
              Success
            </Button>
            <Button variant="ghost" size="sm">
              Ghost
            </Button>
          </div>

          <div className="space-y-2">
            <Button fullWidth loading>
              Loading State
            </Button>
            <Button fullWidth disabled>
              Disabled State
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal Example */}
      <Card variant="default">
        <CardHeader>
          <h2 className="text-xl font-bold text-white">Modal Example</h2>
        </CardHeader>
        <p className="text-gray-400 text-sm mb-4">
          Click the button to open a modal dialog
        </p>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
        >
          Open Modal
        </Button>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal Title"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            This is a modal component. Click outside or the close button to
            dismiss.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Empty State Example */}
      <Card variant="default">
        <CardHeader>
          <h2 className="text-xl font-bold text-white">Empty State</h2>
        </CardHeader>
        <EmptyState
          icon="📦"
          title="No items found"
          description="Create your first item to get started"
          action={{
            label: 'Create Item',
            onClick: () => success('Item created!'),
          }}
        />
      </Card>
    </motion.div>
  )
}
