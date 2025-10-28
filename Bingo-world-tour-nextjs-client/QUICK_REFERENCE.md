# Sunset Bingo - Quick Reference Guide

A quick reference for developers and AI agents working with the Sunset Bingo component library.

## 🚀 Quick Start

```tsx
import { Button, Card, Input, Avatar, Badge } from "@/components/ui"

// Basic usage
<Button variant="primary" size="lg">Click me</Button>
<Card variant="elevated" padding="lg">Content</Card>
<Input label="Email" type="email" required />
<Avatar fallback="JS" status="online" showStatus />
<Badge variant="success" removable>Completed</Badge>
```

## 🎨 Design System Tokens

### Typography Classes
```tsx
// Headings (Cormorant Garamond)
<h1 className="heading-1">H1 - 48px/72px</h1>
<h2 className="heading-2">H2 - 40px/60px</h2>
<h3 className="heading-3">H3 - 34px/51px</h4>
<h4 className="heading-4">H4 - 28px/42px</h4>
<h5 className="heading-5">H5 - 24px/36px</h5>
<h6 className="heading-6">H6 - 20px/30px</h6>

// Body (DM Sans)
<p className="body-1">Body 1 - 16px/24px</p>
<p className="body-2">Body 2 - 14px/21px</p>
<p className="body-3">Body 3 - 12px/18px</p>
<p className="body-4">Body 4 - 10px/15px</p>
```

### Color Classes
```tsx
// Text colors
<div className="text-primary-500">Primary text</div>
<div className="text-secondary-500">Secondary text</div>
<div className="text-neutral-1000">Dark text</div>
<div className="text-neutral-600">Muted text</div>
<div className="text-error-500">Error text</div>
<div className="text-success-500">Success text</div>

// Background colors
<div className="bg-primary-500">Primary background</div>
<div className="bg-neutral-100">White background</div>
<div className="bg-error-100">Error background</div>
<div className="bg-success-100">Success background</div>
```

### Shadow Classes
```tsx
// Elevation
<div className="shadow-e0">No shadow</div>
<div className="shadow-e1">Light shadow</div>
<div className="shadow-e2">Medium shadow</div>
<div className="shadow-e3">Strong shadow</div>
<div className="shadow-e4">Strongest shadow</div>

// Inset
<div className="shadow-e5">Light inset</div>
<div className="shadow-e6">Medium inset</div>
<div className="shadow-e7">Strong inset</div>
<div className="shadow-e8">Strongest inset</div>

// Special
<div className="shadow-e9">Glow effect</div>
```

### Border Classes
```tsx
// All sides
<div className="border-s">0px border</div>
<div className="border-m">1px border</div>
<div className="border-l">2px border</div>
<div className="border-xl">3px border</div>
<div className="border-2xl">4px border</div>

// Individual sides
<div className="border-t-m">Top border</div>
<div className="border-r-l">Right border</div>
<div className="border-b-xl">Bottom border</div>
<div className="border-l-2xl">Left border</div>
```

## 🧩 Component Quick Reference

### Button
```tsx
// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// With icons
<Button variant="primary">
  <ArrowRight className="h-4 w-4" />
  Continue
</Button>
```

### Card
```tsx
// Variants
<Card variant="default">Default</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="outlined">Outlined</Card>
<Card variant="filled">Filled</Card>
<Card variant="accent">Accent</Card>

// Padding
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="default">Default padding</Card>
<Card padding="lg">Large padding</Card>
<Card padding="xl">Extra large padding</Card>

// Complete example
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Input
```tsx
// Basic
<Input label="Label" placeholder="Placeholder" />

// Types
<Input type="text" label="Text" />
<Input type="email" label="Email" />
<Input type="password" label="Password" showPasswordToggle />
<Input type="search" label="Search" />
<Input type="tel" label="Phone" />

// States
<Input label="Error" error="Error message" />
<Input label="Success" variant="success" />
<Input label="Warning" variant="warning" />

// With icons
<Input label="Search" icon={<Search className="h-4 w-4" />} />

// Complete example
<Input 
  label="Email Address" 
  type="email" 
  placeholder="Enter your email"
  hint="We'll never share your email"
  required 
/>
```

### Avatar
```tsx
// Sizes
<Avatar size="sm" fallback="JS" />
<Avatar size="default" fallback="JS" />
<Avatar size="lg" fallback="JS" />
<Avatar size="xl" fallback="JS" />
<Avatar size="2xl" fallback="JS" />

// With status
<Avatar fallback="JS" status="online" showStatus />
<Avatar fallback="JS" status="away" showStatus />
<Avatar fallback="JS" status="busy" showStatus />
<Avatar fallback="JS" status="offline" showStatus />

// With image
<Avatar src="/user.jpg" alt="User" fallback="JS" />

// Group
<AvatarGroup max={3}>
  <Avatar fallback="AJ" />
  <Avatar fallback="JS" />
  <Avatar fallback="MW" />
  <Avatar fallback="DK" />
</AvatarGroup>
```

### Badge
```tsx
// Variants
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="accent">Accent</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="outline">Outline</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="default">Default</Badge>
<Badge size="lg">Large</Badge>

// With features
<Badge variant="primary" icon="🇮🇳">India</Badge>
<Badge variant="default" removable>Removable</Badge>
```

## 🎯 Common Patterns

### Form Layout
```tsx
<form className="space-y-4">
  <Input label="Name" required />
  <Input label="Email" type="email" required />
  <Input label="Password" type="password" showPasswordToggle required />
  <div className="flex gap-2">
    <Button variant="primary" type="submit">Submit</Button>
    <Button variant="outline" type="button">Cancel</Button>
  </div>
</form>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card variant="elevated">
    <CardHeader>
      <CardTitle>Card 1</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
  <Card variant="elevated">
    <CardHeader>
      <CardTitle>Card 2</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
</div>
```

### Button Groups
```tsx
<div className="flex gap-2">
  <Button variant="primary">Primary</Button>
  <Button variant="outline">Secondary</Button>
  <Button variant="ghost">Tertiary</Button>
</div>
```

### Status Display
```tsx
<div className="flex items-center gap-2">
  <Avatar fallback="JS" status="online" showStatus />
  <div>
    <p className="body-2 text-neutral-800">John Smith</p>
    <Badge variant="success">Active</Badge>
  </div>
</div>
```

### Page Layout
```tsx
<div className="min-h-screen bg-neutral-100 p-8">
  <div className="max-w-4xl mx-auto space-y-8">
    <h1 className="heading-1 text-neutral-1000">Page Title</h1>
    <p className="body-1 text-neutral-600">Page description</p>
    
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <CardTitle>Section Title</CardTitle>
        <CardDescription>Section description</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  </div>
</div>
```

## 🤖 AI Agent Prompts

### For Component Generation
```
Use the Sunset Bingo component library with these specifications:

Components:
- Button: variant='primary|secondary|accent|outline|ghost|link|destructive|success|warning'
- Card: variant='default|elevated|outlined|filled|accent'
- Input: type='text|password|email|search|tel|number'
- Avatar: size='sm|default|lg|xl|2xl', status='online|away|busy|offline'
- Badge: variant='default|primary|secondary|accent|success|warning|error|outline'

Typography: Use heading-1 through heading-6 and body-1 through body-4
Colors: Use primary-*, secondary-*, accent-*, neutral-*, error-*, warning-*, success-*
Effects: Use shadow-e0 through shadow-e9 and border-s through border-7xl
```

### For Styling
```
Apply Sunset Bingo design system:
- Typography: heading-1, heading-2, body-1, body-2
- Colors: text-primary-500, bg-neutral-100, text-error-500
- Shadows: shadow-e1, shadow-e2, shadow-e3
- Borders: border-m, border-l, border-xl
- Spacing: Use Tailwind spacing classes (p-4, m-2, gap-4)
```

## 📝 Notes

- All components are TypeScript-enabled with proper interfaces
- Components follow accessibility best practices
- Use semantic HTML elements when possible
- Maintain consistent spacing using Tailwind classes
- Test components in the showcase page at `/components`
- Follow the design system specifications for consistency
