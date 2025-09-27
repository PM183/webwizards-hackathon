'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { usePolls } from '../../lib/hooks/usePolls'
import { useAuth } from '../../lib/hooks/useAuth'
import { PollWithOptions, PollResult } from '../../lib/types/polls'
import { formatDate, formatPercentage } from '../../lib/utils/helpers'

interface PollResultsProps {
  poll: PollWithOptions
}

const COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#6B7280', // gray-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#84CC16', // lime-500
]

export function PollResults({ poll }: PollResultsProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')
  const { results, fetchResults, userVote, fetchUserVote } = usePolls()
  const { user } = useAuth()

  useEffect(() => {
    if (poll.id) {
      fetchResults(poll.id)
      if (user) {
        fetchUserVote(poll.id)
      }
    }
  }, [poll.id, user])


  const totalVotes = results.reduce((sum, result) => sum + result.vote_count, 0)

  const chartData = results.map((result, index) => ({
    name: result.option_text,
    votes: result.vote_count,
    percentage: result.percentage,
    color: COLORS[index % COLORS.length],
  }))

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [`${value} votes`, 'Votes']}
          labelFormatter={(label) => `Option: ${label}`}
        />
        <Bar dataKey="votes" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="votes"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value} votes`, 'Votes']} />
      </PieChart>
    </ResponsiveContainer>
  )

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          {poll.description && (
            <CardDescription>{poll.description}</CardDescription>
          )}

          <div className="flex flex-col space-y-2 text-sm text-gray-600">
            <div>Created by {poll.creator?.full_name || 'Unknown'}</div>
            {poll.start_time && (
              <div>Started: {formatDate(poll.start_time, 'PPp')}</div>
            )}
            {poll.end_time && (
              <div>Ends: {formatDate(poll.end_time, 'PPp')}</div>
            )}
            <div className="font-medium text-gray-900">
              Total Votes: {totalVotes}
            </div>
          </div>

          {userVote && (
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm text-blue-800">
                Your vote: <strong>{userVote.option_text}</strong>
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Results</h3>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                Bar Chart
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                Pie Chart
              </Button>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No votes yet. Be the first to vote!
            </div>
          ) : (
            <>
              {chartType === 'bar' ? renderBarChart() : renderPieChart()}

              <div className="mt-6 space-y-3">
                {results
                  .sort((a, b) => b.vote_count - a.vote_count)
                  .map((result, index) => (
                    <div
                      key={result.option_id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border
                        ${userVote?.option_id === result.option_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{result.option_text}</span>
                        {userVote?.option_id === result.option_id && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Your vote
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold">{result.vote_count} votes</div>
                          <div className="text-sm text-gray-500">
                            {formatPercentage(result.percentage)}
                          </div>
                        </div>

                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(result.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}