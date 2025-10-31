// Example usage of the Textarea component
// This file demonstrates how to use the Textarea component

import { useState } from 'react'
import { Textarea } from './textarea'

export function TextareaExample() {
  const [basicText, setBasicText] = useState('')
  const [limitedText, setLimitedText] = useState('')
  const [errorText, setErrorText] = useState('')
  const [hasError, setHasError] = useState(false)

  return (
    <div className="space-y-6">
      {/* Basic usage */}
      <Textarea
        label="Basic Textarea"
        placeholder="Enter some text..."
        value={basicText}
        onChange={(e) => setBasicText(e.target.value)}
      />

      {/* With character limit */}
      <Textarea
        label="Limited Textarea"
        hint="This field has a character limit"
        placeholder="Enter text with limit..."
        value={limitedText}
        onChange={(e) => setLimitedText(e.target.value)}
        maxLength={100}
        showCharCount={true}
      />

      {/* With error */}
      <Textarea
        label="Required Field"
        error={hasError ? "This field is required" : undefined}
        placeholder="This field shows an error..."
        value={errorText}
        onChange={(e) => {
          setErrorText(e.target.value)
          setHasError(false)
        }}
        onBlur={() => {
          if (!errorText.trim()) {
            setHasError(true)
          }
        }}
        required
      />

      {/* Different sizes */}
      <div className="space-y-4">
        <Textarea
          size="sm"
          label="Small Textarea"
          placeholder="Small size..."
          value=""
          onChange={() => {}}
        />

        <Textarea
          size="default"
          label="Default Textarea"
          placeholder="Default size..."
          value=""
          onChange={() => {}}
        />

        <Textarea
          size="lg"
          label="Large Textarea"
          placeholder="Large size..."
          value=""
          onChange={() => {}}
        />
      </div>

      {/* Disabled */}
      <Textarea
        label="Disabled Textarea"
        placeholder="This is disabled..."
        value="This textarea is disabled"
        disabled
        onChange={() => {}}
      />
    </div>
  )
}