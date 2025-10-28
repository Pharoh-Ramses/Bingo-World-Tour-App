"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dropdown } from '@/components/ui/dropdown'

const CreateSessionPage = () => {
  const [revealInterval, setRevealInterval] = useState(5)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const revealIntervalOptions = [
    { value: '2', label: '2 minutes - Fast paced' },
    { value: '5', label: '5 minutes - Standard' },
    { value: '10', label: '10 minutes - Relaxed' },
    { value: '15', label: '15 minutes - Very relaxed' }
  ]

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          revealInterval
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create session')
        setIsCreating(false)
        return
      }

      const { session } = await response.json()
      router.push(`/admin/sessions/${session.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-20 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="heading-1 text-tertiary-500">Create New Game Session</h1>
          <p className="body-1 text-tertiary-300 mt-2">
            Set up a new BINGO World Tour game session for your players
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="heading-3 text-tertiary-500">
              Session Settings
            </CardTitle>
            <CardDescription className="body-1 text-tertiary-300">
              Configure how your game will run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSession} className="space-y-6">
              <div>
                <label className="block body-2 text-tertiary-500 mb-2">
                  Reveal Interval
                </label>
                <p className="body-3 text-tertiary-300 mb-4">
                  How often should new locations be revealed during the game?
                </p>
                <Dropdown
                  value={revealInterval.toString()}
                  onValueChange={(value) => setRevealInterval(Number(value))}
                  options={revealIntervalOptions}
                  disabled={isCreating}
                />
              </div>

              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/admin')}
                  className="flex-1"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="heading-4 text-tertiary-500">
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="body-2 text-tertiary-500 font-medium">1. Session Creation</h4>
              <p className="body-3 text-tertiary-300">
                A unique 6-character code will be generated for players to join
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="body-2 text-tertiary-500 font-medium">2. Player Setup</h4>
              <p className="body-3 text-tertiary-300">
                Players join with the code and select 24 locations for their 5x5 board
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="body-2 text-tertiary-500 font-medium">3. Game Start</h4>
              <p className="body-3 text-tertiary-300">
                You control when to start the game and locations are revealed automatically
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="body-2 text-tertiary-500 font-medium">4. Winner Detection</h4>
              <p className="body-3 text-tertiary-300">
                The system automatically detects BINGO winners and tracks 1st, 2nd, 3rd place
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateSessionPage
