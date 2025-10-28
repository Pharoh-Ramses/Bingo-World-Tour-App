"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const JoinGamePage = () => {
  const [sessionCode, setSessionCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validate session code format
      if (!/^[A-Z0-9]{6}$/.test(sessionCode)) {
        setError('Please enter a valid 6-character session code')
        setIsLoading(false)
        return
      }

      // Check if session exists and is joinable
      const response = await fetch(`/api/game/${sessionCode}/status`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Session not found. Please check your code.')
        } else {
          setError('Unable to join session. Please try again.')
        }
        setIsLoading(false)
        return
      }

      const session = await response.json()
      
      if (session.status === 'ENDED') {
        setError('This game session has already ended.')
        setIsLoading(false)
        return
      }

      // Redirect to board setup
      router.push(`/game/${sessionCode}/setup`)
    } catch {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 lg:py-16">
      <div className="max-w-md mx-auto w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="heading-2 text-tertiary-500">
              Join BINGO World Tour
            </CardTitle>
            <CardDescription className="body-1 text-tertiary-300">
              Enter the 6-character session code provided by your game host
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinGame} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Enter session code (e.g., ABC123)"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-sm text-error mt-2 text-center">{error}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full h-12"
                disabled={isLoading || sessionCode.length !== 6}
              >
                {isLoading ? 'Joining...' : 'Join Game'}
              </Button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="body-2 text-tertiary-300 mb-4">
                Don&apos;t have a session code?
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin')}
                className="w-full"
              >
                Host a Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default JoinGamePage
