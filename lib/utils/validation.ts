import { z } from 'zod'

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  studentId: z.string().optional(),
  role: z.enum(['admin', 'student']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  studentId: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

// Base poll schema without refinements
const basePollSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  options: z.array(z.string().min(1, 'Option cannot be empty').max(200, 'Option must be less than 200 characters'))
    .min(2, 'Poll must have at least 2 options')
    .max(10, 'Poll cannot have more than 10 options'),
  allowMultipleVotes: z.boolean(),
  startTime: z.date().nullable().optional(),
  endTime: z.date().nullable().optional(),
})

// Poll validation schemas with refinements
export const createPollSchema = basePollSchema.refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime
  }
  return true
}, {
  message: "End time must be after start time",
  path: ["endTime"],
}).refine((data) => {
  if (data.startTime) {
    return data.startTime >= new Date()
  }
  return true
}, {
  message: "Start time cannot be in the past",
  path: ["startTime"],
})

export const updatePollSchema = basePollSchema.extend({
  status: z.enum(['draft', 'active', 'closed']).optional(),
}).partial().refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime
  }
  return true
}, {
  message: "End time must be after start time",
  path: ["endTime"],
}).refine((data) => {
  // Don't allow changing times for active/closed polls
  if (data.status && data.status !== 'draft') {
    return !data.startTime && !data.endTime
  }
  return true
}, {
  message: "Cannot change times for active or closed polls",
})

export const voteSchema = z.object({
  pollId: z.string().uuid('Invalid poll ID'),
  optionId: z.string().uuid('Invalid option ID'),
})

// Search and filter schemas
export const pollFiltersSchema = z.object({
  status: z.enum(['draft', 'active', 'closed']).optional(),
  creatorId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type CreatePollFormData = z.infer<typeof createPollSchema>
export type UpdatePollFormData = z.infer<typeof updatePollSchema>
export type VoteFormData = z.infer<typeof voteSchema>
export type PollFiltersFormData = z.infer<typeof pollFiltersSchema>