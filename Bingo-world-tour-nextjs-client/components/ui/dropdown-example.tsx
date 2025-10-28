// Example usage of the Dropdown component
// This file demonstrates how to use the Dropdown component

import { useState } from 'react'
import { Dropdown } from './dropdown'

export function DropdownExample() {
  const [selectedValue, setSelectedValue] = useState('')

  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date', disabled: true }
  ]

  return (
    <div className="space-y-4">
      {/* Basic usage */}
      <Dropdown
        label="Select a fruit"
        placeholder="Choose a fruit..."
        value={selectedValue}
        onValueChange={setSelectedValue}
        options={options}
      />

      {/* With hint */}
      <Dropdown
        label="Select a category"
        hint="This helps organize your items"
        placeholder="Choose a category..."
        value={selectedValue}
        onValueChange={setSelectedValue}
        options={[
          { value: 'food', label: 'Food & Drink' },
          { value: 'tech', label: 'Technology' },
          { value: 'travel', label: 'Travel' }
        ]}
      />

      {/* With error */}
      <Dropdown
        label="Required field"
        error="Please select an option"
        required
        placeholder="Select something..."
        value=""
        onValueChange={() => {}}
        options={options}
      />

      {/* Different sizes */}
      <div className="flex gap-4">
        <Dropdown
          size="sm"
          placeholder="Small"
          value=""
          onValueChange={() => {}}
          options={options}
        />
        <Dropdown
          size="default"
          placeholder="Default"
          value=""
          onValueChange={() => {}}
          options={options}
        />
        <Dropdown
          size="lg"
          placeholder="Large"
          value=""
          onValueChange={() => {}}
          options={options}
        />
      </div>
    </div>
  )
}