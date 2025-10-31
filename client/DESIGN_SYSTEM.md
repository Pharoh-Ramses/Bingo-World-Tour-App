# Sunset Bingo Design System Guide

A comprehensive guide to the design system extracted from Figma specifications, including typography, colors, effects, and component patterns.

## 📋 Table of Contents

- [Typography System](#typography-system)
- [Color System](#color-system)
- [Effects System](#effects-system)
- [Stroke System](#stroke-system)
- [Radius System](#radius-system)
- [Component Patterns](#component-patterns)
- [Usage Guidelines](#usage-guidelines)
- [AI Agent Integration](#ai-agent-integration)

## 🎨 Typography System

### Font Families

Our typography system uses two carefully selected Google Fonts:

- **Cormorant Garamond** - Elegant serif for headings
- **DM Sans** - Clean sans-serif for body text

### Typography Scale

#### Headings (Cormorant Garamond)

| Class | Font Size | Line Height | Weight | Usage |
|-------|-----------|-------------|---------|-------|
| `.heading-1` | 48px | 72px | 700 (Bold) | Main page titles |
| `.heading-2` | 40px | 60px | 700 (Bold) | Section headers |
| `.heading-3` | 34px | 51px | 700 (Bold) | Subsection headers |
| `.heading-4` | 28px | 42px | 700 (Bold) | Card titles |
| `.heading-5` | 24px | 36px | 700 (Bold) | Component titles |
| `.heading-6` | 20px | 30px | 500 (Medium) | Small headers |

#### Body Text (DM Sans)

| Class | Font Size | Line Height | Weight | Usage |
|-------|-----------|-------------|---------|-------|
| `.body-1` | 16px | 24px | 400 (Regular) | Main body text |
| `.body-2` | 14px | 21px | 400 (Regular) | Secondary text |
| `.body-3` | 12px | 18px | 400 (Regular) | Small text |
| `.body-4` | 10px | 15px | 400 (Regular) | Captions |

### Typography Usage Examples

```tsx
// Page structure
<h1 className="heading-1 text-neutral-1000">Page Title</h1>
<h2 className="heading-2 text-neutral-800">Section Header</h2>
<p className="body-1 text-neutral-600">Main content text</p>
<p className="body-2 text-neutral-500">Secondary information</p>

// Component usage
<CardTitle className="heading-5 text-neutral-1000">Card Title</CardTitle>
<CardDescription className="body-2 text-neutral-600">Description</CardDescription>
```

## 🎨 Color System

### Color Palette Structure

Our color system is organized into semantic categories with multiple shades:

#### Primary Colors (Brand)
```css
--primary-100: #e8c4c4  /* Lightest */
--primary-200: #d89b9b
--primary-300: #c87171
--primary-400: #b84848
--primary-500: #8e3838  /* Base */
--primary-600: #652727  /* Darkest */
```

#### Secondary Colors (Supporting)
```css
--secondary-100: #ead2d2
--secondary-200: #d4a5a5
--secondary-300: #c17d7d
--secondary-400: #ae5656
--secondary-500: #884141
--secondary-600: #612e2e
```

#### Accent Colors (Highlights)
```css
--accent-100: #dfd1d1
--accent-200: #bea4a4
--accent-300: #9e7676
--accent-400: #845e5e
--accent-500: #674949
--accent-600: #4a3434
```

#### Neutral Colors (Grays)
```css
--neutral-100: #ffffff   /* White */
--neutral-200: #e8e8e8
--neutral-300: #d2d2d2
--neutral-400: #bbbbbb
--neutral-500: #a4a4a4
--neutral-600: #8e8e8e
--neutral-700: #777777
--neutral-800: #606060
--neutral-900: #4a4a4a
--neutral-1000: #333333  /* Black */
```

#### Feedback Colors

**Error (Red)**
```css
--error-100: #f0baba
--error-200: #e27474
--error-300: #d32f2f
--error-400: #af2525
--error-500: #881d1d
--error-600: #621515
```

**Warning (Orange)**
```css
--warning-100: #fedabc
--warning-200: #feb579
--warning-300: #fd9035
--warning-400: #ed6c02
--warning-500: #b85402
--warning-600: #833c01
```

**Success (Green)**
```css
--success-100: #9cdb9f
--success-200: #6ac86f
--success-300: #40af46
--success-400: #2e7d32
--success-500: #215a24
--success-600: #143616
```

### Color Usage Guidelines

#### Text Colors
```tsx
// Primary text
<h1 className="text-neutral-1000">Main heading</h1>
<p className="text-neutral-800">Primary text</p>
<p className="text-neutral-600">Secondary text</p>
<p className="text-neutral-500">Muted text</p>

// Brand colors
<h2 className="text-primary-500">Brand heading</h2>
<span className="text-secondary-500">Accent text</span>

// Feedback colors
<p className="text-error-500">Error message</p>
<p className="text-warning-500">Warning message</p>
<p className="text-success-500">Success message</p>
```

#### Background Colors
```tsx
// Neutral backgrounds
<div className="bg-neutral-100">White background</div>
<div className="bg-neutral-200">Light gray background</div>

// Brand backgrounds
<div className="bg-primary-500 text-neutral-100">Primary background</div>
<div className="bg-secondary-100 text-secondary-800">Light secondary</div>

// Feedback backgrounds
<div className="bg-error-100 text-error-800">Error background</div>
<div className="bg-success-100 text-success-800">Success background</div>
```

## ✨ Effects System

### Shadow System (Elevation)

Our shadow system provides consistent elevation and depth:

#### Elevation Effects (Raised)
```css
--effect-e0: 0px 0px 0px 0px rgba(27,28,29,0)     /* No shadow */
--effect-e1: 0px 2px 4px 0px rgba(27,28,29,0.04)  /* Light */
--effect-e2: 0px 16px 32px -12px rgba(88,92,95,0.1) /* Medium */
--effect-e3: 0px 16px 40px -8px rgba(88,92,95,0.16) /* Strong */
--effect-e4: 0px 16px 40px 0px rgba(88,92,95,0.16)  /* Strongest */
```

#### Sunken Effects (Inset)
```css
--effect-e5: inset 0px 2px 4px 0px rgba(27,28,29,0.04)     /* Light inset */
--effect-e6: inset 0px 16px 32px -12px rgba(88,92,95,0.1)  /* Medium inset */
--effect-e7: inset 0px 25px 36.5px -7px rgba(88,92,95,0.16) /* Strong inset */
--effect-e8: inset 0px 32px 33.2px -7px rgba(88,92,95,0.16) /* Strongest inset */
```

#### Glow Effect
```css
--effect-e9: 0px 4px 20px -5px rgba(0,146,255,0.12) /* Blue glow */
```

### Shadow Usage

```tsx
// Elevation hierarchy
<div className="shadow-e0">No elevation</div>
<div className="shadow-e1">Light elevation (buttons, inputs)</div>
<div className="shadow-e2">Medium elevation (cards, modals)</div>
<div className="shadow-e3">Strong elevation (dropdowns, popovers)</div>
<div className="shadow-e4">Maximum elevation (overlays, dialogs)</div>

// Sunken effects
<div className="shadow-e5">Light inset (pressed buttons)</div>
<div className="shadow-e6">Medium inset (input focus)</div>
<div className="shadow-e7">Strong inset (active states)</div>
<div className="shadow-e8">Maximum inset (deep pressed)</div>

// Special effects
<div className="shadow-e9">Glow effect (focus, highlights)</div>
```

## 📏 Stroke System

### Border Width Scale

Our stroke system provides consistent border widths:

```css
--stroke-s: 0px   /* No border */
--stroke-m: 1px   /* Thin border */
--stroke-l: 2px   /* Light border */
--stroke-xl: 3px  /* Medium border */
--stroke-2xl: 4px /* Thick border */
--stroke-3xl: 5px /* Heavy border */
--stroke-4xl: 6px /* Very heavy border */
--stroke-5xl: 8px /* Extra heavy border */
--stroke-6xl: 10px /* Maximum border */
--stroke-7xl: 12px /* Ultra thick border */
```

### Border Usage

```tsx
// All sides
<div className="border-s">No border</div>
<div className="border-m">1px border</div>
<div className="border-l">2px border</div>
<div className="border-xl">3px border</div>

// Individual sides
<div className="border-t-m">Top border</div>
<div className="border-r-l">Right border</div>
<div className="border-b-xl">Bottom border</div>
<div className="border-l-2xl">Left border</div>

// With colors
<div className="border-m border-primary-500">Colored border</div>
<div className="border-l border-error-500">Error border</div>
```

## 🧩 Component Patterns

### Button Patterns

```tsx
// Primary actions
<Button variant="primary" size="lg">Primary Action</Button>

// Secondary actions
<Button variant="outline" size="default">Secondary Action</Button>

// Destructive actions
<Button variant="destructive" size="default">Delete</Button>

// Text links
<Button variant="link" size="default">Learn More</Button>

// Icon buttons
<Button variant="ghost" size="icon">
  <Menu className="h-4 w-4" />
</Button>
```

## 🟦 Radius System

Consistent corner rounding across components. Tokens map to utilities already available in `globals.css`.

### Radius Scale

| Token | Utility class | Value |
|-------|----------------|-------|
| xs    | `rounded-xs`   | 3px   |
| sm    | `rounded-sm`   | 8px   |
| md    | `rounded-md`   | 12px  |
| lg    | `rounded-lg`   | 16px  |
| xl    | `rounded-xl`   | 20px  |
| 2xl   | `rounded-2xl`  | 24px  |

### Usage

```tsx
// Cards (default)
<Card className="rounded-md" />

// Inputs
<Input className="rounded-sm" />

// Buttons
<Button size="default" className="rounded-sm">Action</Button>

// Badges/Chips
<Badge className="rounded-sm">Game Ended</Badge>
```

Guideline: Prefer `rounded-sm` for inputs and buttons, `rounded-md` for cards/containers. Increase to `rounded-lg` on hero panels or elevated surfaces for emphasis.

### Card Patterns

```tsx
// Content cards
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Filled cards
<Card variant="filled" padding="default">
  <CardContent>Highlighted content</CardContent>
</Card>

// Outlined cards
<Card variant="outlined" padding="sm">
  <CardContent>Subtle content</CardContent>
</Card>
```

### Input Patterns

```tsx
// Form inputs
<Input 
  label="Email Address" 
  type="email" 
  placeholder="Enter your email"
  required 
/>

// Password with toggle
<Input 
  label="Password" 
  type="password" 
  showPasswordToggle
  hint="Must be at least 8 characters"
  required 
/>

// Search inputs
<Input 
  label="Search" 
  type="search" 
  placeholder="Search..."
  icon={<Search className="h-4 w-4" />}
/>

// Error states
<Input 
  label="Username" 
  error="Username is required"
  required 
/>
```

## 📋 Usage Guidelines

### Do's ✅

- Use semantic color names (`primary-500`, `error-500`)
- Apply consistent typography scales
- Use appropriate shadow levels for hierarchy
- Follow component variant patterns
- Maintain consistent spacing
- Use proper contrast ratios

### Don'ts ❌

- Don't use arbitrary color values
- Don't mix typography scales inconsistently
- Don't overuse high elevation shadows
- Don't create custom component variants without design system integration
- Don't ignore accessibility requirements
- Don't use colors that don't exist in the system

### Accessibility Guidelines

- Maintain minimum 4.5:1 contrast ratio for text
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Use focus indicators consistently

## 🤖 AI Agent Integration

### For AI Agents Working with This System

When generating code, use these patterns:

```tsx
// Import components
import { Button, Card, Input, Avatar, Badge } from "@/components/ui"

// Use design system classes
<div className="heading-1 text-primary-500 bg-neutral-100 shadow-e2 rounded-sm p-4">
  <Button variant="primary" size="lg">Action</Button>
</div>

// Component variants (choose appropriate ones)
<Button variant="primary|secondary|accent|outline|ghost|link|destructive|success|warning" />
<Card variant="default|elevated|outlined|filled|accent" />
<Input type="text|password|email|search|tel|number" />
<Avatar status="online|away|busy|offline" />
<Badge variant="default|primary|secondary|accent|success|warning|error|outline" />

// Typography classes
<h1 className="heading-1">Main Title</h1>
<h2 className="heading-2">Section Title</h2>
<p className="body-1">Main text</p>
<p className="body-2">Secondary text</p>

// Color classes
<div className="bg-primary-500 text-neutral-100">Primary background</div>
<div className="text-error-500">Error text</div>
<div className="bg-success-100 text-success-800">Success background</div>

// Effect classes
<div className="shadow-e1">Light shadow</div>
<div className="shadow-e2">Medium shadow</div>
<div className="border-m border-primary-500">Colored border</div>
```

### Common Patterns for AI Agents

```tsx
// Form patterns
<form className="space-y-4">
  <Input label="Email" type="email" required />
  <Input label="Password" type="password" showPasswordToggle required />
  <Button variant="primary" size="lg" type="submit">Submit</Button>
</form>

// Card layouts
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card variant="elevated">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
</div>

// Button groups
<div className="flex gap-2">
  <Button variant="primary">Primary</Button>
  <Button variant="outline">Secondary</Button>
  <Button variant="ghost">Cancel</Button>
</div>

// Status indicators
<div className="flex items-center gap-2">
  <Avatar fallback="JS" status="online" showStatus />
  <Badge variant="success">Active</Badge>
</div>
```

## 🔧 Customization

### Adding New Colors

To add new colors to the system:

1. Add CSS variables to `globals.css`:
```css
:root {
  --new-color-100: #value;
  --new-color-500: #value;
  --new-color-900: #value;
}
```

2. Add to Tailwind theme:
```css
@theme inline {
  --color-new-color-100: var(--new-color-100);
  --color-new-color-500: var(--new-color-500);
  --color-new-color-900: var(--new-color-900);
}
```

3. Add utility classes:
```css
@layer base {
  .text-new-color-100 { color: var(--new-color-100); }
  .bg-new-color-100 { background-color: var(--new-color-100); }
}
```

### Adding New Components

When creating new components:

1. Follow the existing pattern with `cva` for variants
2. Use design system tokens for styling
3. Include proper TypeScript interfaces
4. Add to the component showcase
5. Update this documentation

## 📚 Resources

- [Component Showcase](/components) - Interactive component examples
- [Figma Design System](https://figma.com/design/cerLLKvfHJp7s0Lc7gVpV7/Sunset-Bingo) - Original design specifications
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility class reference
- [Class Variance Authority](https://cva.style/docs) - Component variant management
