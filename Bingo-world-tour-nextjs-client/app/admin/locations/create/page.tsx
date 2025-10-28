"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dropdown } from '@/components/ui/dropdown'

const CreateLocationPage = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          category: category || undefined
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create location')
        setIsCreating(false)
        return
      }

      await response.json()
      router.push('/admin/locations')
    } catch {
      setError('Something went wrong. Please try again.')
      setIsCreating(false)
    }
  }

  const categories = [
    { value: '', label: 'Select a category (optional)' },
    { value: 'city', label: 'City' },
    { value: 'natural', label: 'Natural Wonder' },
    { value: 'cultural', label: 'Cultural Site' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'unique', label: 'Unique Experience' }
  ]

  return (
    <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="heading-1 text-tertiary-500">Create New Location</h1>
          <p className="body-1 text-tertiary-300 mt-2">
            Add a new travel location for players to discover in BINGO games
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="heading-3 text-tertiary-500">
              Location Details
            </CardTitle>
            <CardDescription className="body-1 text-tertiary-300">
              Fill in the information for the new location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLocation} className="space-y-6">
              <div>
                <Input
                  label="Location Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Paris, Grand Canyon, Machu Picchu"
                  required
                  hint="Must be unique and descriptive"
                />
              </div>

              <Textarea
                label="Description"
                hint="A brief description of the location (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what makes this location special..."
                maxLength={500}
                showCharCount={true}
              />

              <div>
                <Dropdown
                  label="Category"
                  hint="Choose a category to help organize locations (optional)"
                  value={category}
                  onValueChange={setCategory}
                  options={categories}
                  placeholder="Select a category (optional)"
                />
              </div>

              <div>
                <Input
                  label="Image URL"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  hint="Optional: URL to an image representing the location"
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
                  onClick={() => router.push('/admin/locations')}
                  className="flex-1"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isCreating || !name.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Location'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="heading-4 text-tertiary-500">
              Tips for Great Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="body-2 text-tertiary-500 font-medium">Choose Popular Destinations</h4>
              <p className="body-3 text-tertiary-300">
                Select well-known travel locations that players are likely to have visited or want to visit
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="body-2 text-tertiary-500 font-medium">Use Clear Names</h4>
              <p className="body-3 text-tertiary-300">
                Use the most common name for the location (e.g., &ldquo;New York&rdquo; instead of &ldquo;New York City&rdquo;)
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="body-2 text-tertiary-500 font-medium">Add Descriptive Details</h4>
              <p className="body-3 text-tertiary-300">
                Include what makes the location special in the description to help players identify it
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="body-2 text-tertiary-500 font-medium">High-Quality Images</h4>
              <p className="body-3 text-tertiary-300">
                Use clear, recognizable images that represent the location well
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

export default CreateLocationPage