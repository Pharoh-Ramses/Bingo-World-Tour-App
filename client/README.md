# Sunset Bingo - Component Library

A comprehensive React component library built with Next.js, TypeScript, and Tailwind CSS, following a complete design system extracted from Figma specifications.

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd sunset-bingo

# Install dependencies
npm install
# or
yarn install
# or
bun install

# Start development server
npm run dev
# or
yarn dev
# or
bun dev
```

### Basic Usage

```tsx
import { Button, Card, Input, Avatar, Badge } from "@/components/ui"

function MyComponent() {
  return (
    <div className="space-y-4">
      <Button variant="primary" size="lg">
        Primary Button
      </Button>
      
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>My Card</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          <Input label="Email" type="email" required />
        </CardContent>
      </Card>
      
      <div className="flex items-center gap-4">
        <Avatar fallback="JS" status="online" showStatus />
        <Badge variant="success" removable>Completed</Badge>
      </div>
    </div>
  )
}
```

## 📚 Component Library

Visit the [Component Showcase](/components) to see all components in action.

### Available Components

- **[Button](#button)** - Interactive buttons with multiple variants
- **[Card](#card)** - Content containers with flexible layouts
- **[Input](#input)** - Form input fields with validation states
- **[Avatar](#avatar)** - User avatars with status indicators
- **[Badge](#badge)** - Labels and tags for categorization

## 🎨 Design System

### Typography

Our typography system uses two carefully selected Google Fonts:

- **Cormorant Garamond** - For headings (elegant serif)
- **DM Sans** - For body text (clean sans-serif)

#### Typography Classes

```tsx
// Headings (Cormorant Garamond)
<h1 className="heading-1">Heading 1 - 48px/72px</h1>
<h2 className="heading-2">Heading 2 - 40px/60px</h2>
<h3 className="heading-3">Heading 3 - 34px/51px</h3>
<h4 className="heading-4">Heading 4 - 28px/42px</h4>
<h5 className="heading-5">Heading 5 - 24px/36px</h5>
<h6 className="heading-6">Heading 6 - 20px/30px</h6>

// Body Text (DM Sans)
<p className="body-1">Body 1 - 16px/24px</p>
<p className="body-2">Body 2 - 14px/21px</p>
<p className="body-3">Body 3 - 12px/18px</p>
<p className="body-4">Body 4 - 10px/15px</p>
```

### Color System

Our color palette is organized into semantic categories:

#### Primary Colors
```tsx
// Primary brand colors
<div className="bg-primary-100 text-primary-800">Light Primary</div>
<div className="bg-primary-500 text-neutral-100">Primary</div>
<div className="bg-primary-600 text-neutral-100">Dark Primary</div>
```

#### Secondary Colors
```tsx
// Secondary brand colors
<div className="bg-secondary-100 text-secondary-800">Light Secondary</div>
<div className="bg-secondary-500 text-neutral-100">Secondary</div>
<div className="bg-secondary-600 text-neutral-100">Dark Secondary</div>
```

#### Neutral Colors
```tsx
// Neutral grays
<div className="bg-neutral-100 text-neutral-1000">White</div>
<div className="bg-neutral-500 text-neutral-100">Medium Gray</div>
<div className="bg-neutral-1000 text-neutral-100">Black</div>
```

#### Feedback Colors
```tsx
// Status colors
<div className="bg-success-500 text-neutral-100">Success</div>
<div className="bg-warning-500 text-neutral-100">Warning</div>
<div className="bg-error-500 text-neutral-100">Error</div>
```

### Effects System

#### Shadows (Elevation)
```tsx
// Elevation effects
<div className="shadow-e0">No shadow</div>
<div className="shadow-e1">Light shadow</div>
<div className="shadow-e2">Medium shadow</div>
<div className="shadow-e3">Strong shadow</div>
<div className="shadow-e4">Strongest shadow</div>

// Sunken effects
<div className="shadow-e5">Light inset</div>
<div className="shadow-e6">Medium inset</div>
<div className="shadow-e7">Strong inset</div>
<div className="shadow-e8">Strongest inset</div>

// Glow effect
<div className="shadow-e9">Blue glow</div>
```

#### Strokes (Borders)
```tsx
// Border widths
<div className="border-s">0px border</div>
<div className="border-m">1px border</div>
<div className="border-l">2px border</div>
<div className="border-xl">3px border</div>
<div className="border-2xl">4px border</div>
<div className="border-3xl">5px border</div>
<div className="border-4xl">6px border</div>
<div className="border-5xl">8px border</div>
<div className="border-6xl">10px border</div>
<div className="border-7xl">12px border</div>
```

## 🧩 Component Documentation

### Button

Interactive buttons with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui/button"

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

**Props:**
- `variant`: `'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link' | 'destructive' | 'success' | 'warning'`
- `size`: `'sm' | 'default' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'`
- `asChild`: `boolean` - Render as child component
- `icon`: `React.ReactNode` - Optional icon element

### Card

Flexible content containers with multiple variants.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card variant="elevated" padding="lg" radius="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

**Props:**
- `variant`: `'default' | 'elevated' | 'outlined' | 'filled' | 'accent'`
- `padding`: `'none' | 'sm' | 'default' | 'lg' | 'xl'`
- `radius`: `'none' | 'sm' | 'default' | 'lg' | 'xl' | 'full'`

### Input

Form input fields with validation states and icons.

```tsx
import { Input } from "@/components/ui/input"

// Basic input
<Input label="Email" type="email" placeholder="Enter your email" required />

// With validation
<Input 
  label="Password" 
  type="password" 
  showPasswordToggle 
  hint="Must be at least 8 characters"
  required 
/>

// With error state
<Input 
  label="Username" 
  error="Username is required"
  required 
/>

// With icon
<Input 
  label="Search" 
  type="search" 
  placeholder="Search..."
  icon={<Search className="h-4 w-4" />}
/>
```

**Props:**
- `label`: `string` - Input label
- `hint`: `string` - Helper text
- `error`: `string` - Error message
- `required`: `boolean` - Required field indicator
- `icon`: `React.ReactNode` - Optional icon
- `showPasswordToggle`: `boolean` - Show password visibility toggle
- `type`: `'text' | 'password' | 'email' | 'search' | 'tel' | 'number'`
- `variant`: `'default' | 'error' | 'success' | 'warning'`
- `size`: `'sm' | 'default' | 'lg'`

### Avatar

User avatars with status indicators and fallback initials.

```tsx
import { Avatar, AvatarGroup } from "@/components/ui/avatar"

// Basic avatar
<Avatar fallback="JS" />

// With image
<Avatar src="/user.jpg" alt="John Smith" fallback="JS" />

// With status
<Avatar fallback="JS" status="online" showStatus />

// Different sizes
<Avatar size="sm" fallback="JS" />
<Avatar size="lg" fallback="JS" />
<Avatar size="2xl" fallback="JS" />

// Avatar group
<AvatarGroup max={3}>
  <Avatar fallback="AJ" />
  <Avatar fallback="JS" />
  <Avatar fallback="MW" />
  <Avatar fallback="DK" />
</AvatarGroup>
```

**Props:**
- `src`: `string` - Image source URL
- `alt`: `string` - Image alt text
- `fallback`: `string` - Fallback initials
- `status`: `'online' | 'offline' | 'away' | 'busy'`
- `showStatus`: `boolean` - Show status indicator
- `size`: `'sm' | 'default' | 'lg' | 'xl' | '2xl'`
- `variant`: `'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'`

### Badge

Labels and tags for categorization and status.

```tsx
import { Badge } from "@/components/ui/badge"

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>

// With icon
<Badge variant="primary" icon="🇮🇳">India</Badge>

// Removable
<Badge variant="default" removable onRemove={() => console.log('removed')}>
  Removable
</Badge>

// Different sizes
<Badge size="sm">Small</Badge>
<Badge size="default">Default</Badge>
<Badge size="lg">Large</Badge>
```

**Props:**
- `variant`: `'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'outline'`
- `size`: `'sm' | 'default' | 'lg'`
- `removable`: `boolean` - Show remove button
- `onRemove`: `() => void` - Remove handler
- `icon`: `React.ReactNode` - Optional icon

## 🛠️ Development

### Project Structure

```
sunset-bingo/
├── app/                    # Next.js app directory
│   ├── components/         # Component showcase page
│   ├── globals.css        # Global styles and design system
│   ├── layout.tsx         # Root layout with fonts
│   └── page.tsx           # Home page
├── components/            # Component library
│   └── ui/               # UI components
│       ├── button.tsx    # Button component
│       ├── card.tsx      # Card component
│       ├── input.tsx     # Input component
│       ├── avatar.tsx    # Avatar component
│       ├── badge.tsx     # Badge component
│       └── index.ts      # Component exports
├── lib/                  # Utility functions
└── public/               # Static assets
```

### Key Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Class Variance Authority** - Component variants
- **Radix UI** - Accessible primitives
- **Lucide React** - Icons

### Design System Integration

All components are built using our custom design system:

- **Typography**: Cormorant Garamond + DM Sans with proper scales
- **Colors**: Semantic color palette with multiple shades
- **Effects**: Shadow system (E0-E9) and stroke system (0px-12px)
- **Spacing**: Consistent spacing scale
- **Border Radius**: Rounded corners with multiple sizes

## 📖 For AI Agents

When working with this component library, use these patterns:

```tsx
// Import components
import { Button, Card, Input, Avatar, Badge } from "@/components/ui"

// Use design system classes
<div className="heading-1 text-primary-500 bg-neutral-100 shadow-e2 rounded-sm p-4">
  <Button variant="primary" size="lg">Action</Button>
</div>

// Component variants
<Button variant="primary|secondary|accent|outline|ghost|link|destructive|success|warning" />
<Card variant="default|elevated|outlined|filled|accent" />
<Input type="text|password|email|search|tel|number" />
<Avatar status="online|away|busy|offline" />
<Badge variant="default|primary|secondary|accent|success|warning|error|outline" />
```

## 🤝 Contributing

1. Follow the existing component patterns
2. Use TypeScript for all new components
3. Include proper JSDoc documentation
4. Test components in the showcase page
5. Follow the design system specifications

## 📄 License

MIT License - see LICENSE file for details.