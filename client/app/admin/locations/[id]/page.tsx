"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dropdown } from '@/components/ui/dropdown'
import { Trash2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  category: string | null
}

const EditLocationPage = () => {
  const router = useRouter()
  const params = useParams()
  const locationId = params.id as string

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [originalName, setOriginalName] = useState('')

  const fetchLocation = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/locations/${locationId}`)
      if (response.ok) {
        const data = await response.json()
        const location: Location = data.location
        setName(location.name)
        setDescription(location.description || '')
        setImageUrl(location.imageUrl || '')
        setCategory(location.category || '')
        setOriginalName(location.name)
      } else {
        setError('Location not found')
      }
    } catch (error) {
      console.error('Failed to fetch location:', error)
      setError('Failed to load location')
    } finally {
      setIsLoading(false)
    }
  }, [locationId])

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/locations/${locationId}`, {
        method: 'PUT',
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
        setError(errorData.error || 'Failed to update location')
        setIsSaving(false)
        return
      }

      router.push('/admin/locations')
    } catch {
      setError('Something went wrong. Please try again.')
      setIsSaving(false)
    }
  }

  const handleDeleteLocation = async () => {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/locations/${locationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/locations')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete location')
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      setError('Something went wrong. Please try again.')
      setIsDeleting(false)
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

  if (isLoading) {
    return (
      <div className="text-center p-6">
        <p className="body-1 text-tertiary-300">Loading location...</p>
      </div>
    )
  }

  if (error && !name) {
    return (
      <div className="text-center p-6">
        <p className="body-1 text-error mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push('/admin/locations')}>
          Back to Locations
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-20 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="heading-1 text-tertiary-500">Edit Location</h1>
          <p className="body-1 text-tertiary-300 mt-2">
            Update the details for &ldquo;{originalName}&rdquo;
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="heading-3 text-tertiary-500">
              Location Details
            </CardTitle>
            <CardDescription className="body-1 text-tertiary-300">
              Modify the information for this location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateLocation} className="space-y-6">
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
                  disabled={isSaving || isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isSaving || isDeleting || !name.trim()}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8 border-error/20">
          <CardHeader>
            <CardTitle className="heading-4 text-error">
              Danger Zone
            </CardTitle>
            <CardDescription className="body-1 text-tertiary-300">
              Permanently delete this location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="body-3 text-tertiary-300 mb-4">
              Once you delete this location, there is no going back. This action cannot be undone.
              The location will be removed from all future games, but existing games that have already revealed this location will keep it.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteLocation}
              disabled={isSaving || isDeleting}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Location'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EditLocationPage