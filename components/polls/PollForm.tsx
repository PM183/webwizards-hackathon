'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Minus } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { usePolls } from '../../lib/hooks/usePolls'
import { createPollSchema } from '../../lib/utils/validation'
import { PollWithOptions } from '../../lib/types/polls'

interface PollFormData {
  title: string
  description?: string
  options: string[]
  allowMultipleVotes: boolean
  status?: 'draft' | 'active' | 'closed'
  startTime?: Date | null
  endTime?: Date | null
}

interface PollFormProps {
  poll?: PollWithOptions
  onSuccess?: () => void
  onCancel?: () => void
}

export function PollForm({ poll, onSuccess, onCancel }: PollFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { createPoll, updatePoll } = usePolls()
  const router = useRouter()
  const isEditing = !!poll

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<PollFormData>({
    // resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: poll?.title || '',
      description: poll?.description || '',
      options: poll?.poll_options?.map(option => option.text) || ['', ''],
      allowMultipleVotes: poll?.allow_multiple_votes || false,
      status: poll?.status || 'draft',
      startTime: poll?.start_time ? new Date(poll.start_time) : null,
      endTime: poll?.end_time ? new Date(poll.end_time) : null,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: control as any,
    name: 'options',
  })

  const onSubmit = async (data: PollFormData) => {
    try {
      setIsLoading(true)

      if (isEditing && poll) {
        await updatePoll(poll.id, {
          title: data.title,
          description: data.description,
          options: data.options,
          allowMultipleVotes: data.allowMultipleVotes,
          status: data.status,
          startTime: data.startTime,
          endTime: data.endTime,
        })
      } else {
        const pollId = await createPoll({
          title: data.title,
          description: data.description,
          options: data.options,
          allowMultipleVotes: data.allowMultipleVotes,
          startTime: data.startTime,
          endTime: data.endTime,
        })
        router.push(`/admin/polls`)
      }

      onSuccess?.()
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Failed to save poll',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addOption = () => {
    if (fields.length < 10) {
      append('')
    }
  }

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Poll' : 'Create New Poll'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update your poll details and options' : 'Create a new poll for students to vote on'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Poll Title *
            </label>
            <Input
              id="title"
              placeholder="Enter poll title"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Enter poll description"
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Poll Options *</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={fields.length >= 10}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      error={errors.options?.[index]?.message}
                      {...register(`options.${index}`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    disabled={fields.length <= 2}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {errors.options && (
              <p className="text-sm text-red-600">{errors.options.message}</p>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Poll Settings</h3>

            {/* Status Selection - only show when editing */}
            {isEditing && (
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Poll Status
                </label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register('status')}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowMultipleVotes"
                className="rounded border-gray-300"
                {...register('allowMultipleVotes')}
              />
              <label htmlFor="allowMultipleVotes" className="text-sm">
                Allow multiple votes per user
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-sm font-medium">
                  Start Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register('startTime', {
                    valueAsDate: true,
                  })}
                />
                {errors.startTime && (
                  <p className="text-sm text-red-600">{errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="endTime" className="text-sm font-medium">
                  End Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register('endTime', {
                    valueAsDate: true,
                  })}
                />
                {errors.endTime && (
                  <p className="text-sm text-red-600">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              {isEditing ? 'Update Poll' : 'Create Poll'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}