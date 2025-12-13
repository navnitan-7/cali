# Centralized Color System Documentation

## Overview

We've successfully migrated from hardcoded color palettes scattered throughout the codebase to a centralized color system inspired by Tailwind CSS naming conventions.

## File Structure

```
utils/
  └── colors.ts          # Main color system
constants/
  └── Colors.ts          # Legacy colors (still used for some components)
```

## Usage

### Basic Usage

```tsx
import { useColors } from '../utils/colors';

function MyComponent() {
  const isDark = useIsDark();
  const colors = useColors(isDark);
  
  return (
    <View style={{ backgroundColor: colors['bg-surface'] }}>
      <Text style={{ color: colors['text-primary'] }}>Hello World</Text>
    </View>
  );
}
```

### Available Color Names

#### Background Colors
- `bg-primary` - Main brand color
- `bg-primary-light` - Light variant of primary
- `bg-primary-dark` - Dark variant of primary
- `bg-success` - Success state color
- `bg-danger` - Error/danger state color
- `bg-warning` - Warning state color
- `bg-info` - Information state color
- `bg-surface` - Main surface background (theme-aware)
- `bg-card` - Card background (theme-aware)
- `bg-secondary` - Secondary background (theme-aware)

#### Text Colors
- `text-primary` - Primary text (theme-aware)
- `text-secondary` - Secondary text (theme-aware)
- `text-muted` - Muted text (theme-aware)
- `text-success` - Success text
- `text-danger` - Error text
- `text-warning` - Warning text
- `text-info` - Info text
- `text-brand` - Brand color text

#### Border Colors
- `border-default` - Default border (theme-aware)
- `border-primary` - Primary border
- `border-success` - Success border
- `border-danger` - Danger border
- `border-muted` - Muted border (theme-aware)

#### Icon Colors
- `icon-primary` - Primary icon color (theme-aware)
- `icon-secondary` - Secondary icon color (theme-aware)
- `icon-muted` - Muted icon color (theme-aware)
- `icon-brand` - Brand icon color
- `icon-success` - Success icon color
- `icon-danger` - Danger icon color

#### State Colors
- `state-hover` - Hover state (theme-aware)
- `state-pressed` - Pressed state (theme-aware)
- `state-disabled` - Disabled state (theme-aware)

#### Absolute Colors
- `white` - Pure white
- `black` - Pure black

## Migration Status

### ✅ Completed Files
- `utils/colors.ts` - New centralized color system
- `app/(tabs)/settings.tsx` - Updated to use centralized colors
- `app/(tabs)/_layout.tsx` - Updated to use centralized colors
- `app/(tabs)/inventory/_layout.tsx` - Updated to use centralized colors
- `components/ui/Button.tsx` - Updated to use centralized colors
- `components/ui/FloatingActionButton.tsx` - Updated to use centralized colors
- `components/ui/DateSelector.tsx` - Updated to use centralized colors
- `components/ui/Card.tsx` - Updated to use centralized colors
- `app/(tabs)/inventory/index.tsx` - Updated to use centralized colors

### ⚠️ Partially Updated Files
- `app/(tabs)/inventory/[id].tsx` - Needs remaining hardcoded colors replaced
- `app/index.tsx` - Has one hardcoded color
- Legacy inventory.tsx file (if exists)

### Remaining Hardcoded Colors to Fix

The following files still contain hardcoded hex colors that should be replaced:

#### `app/(tabs)/inventory/[id].tsx`
```tsx
// Replace these hardcoded colors:
color={isDark ? '#fff' : '#181A20'}          → color={themeColors['icon-primary']}
color="#6C63FF"                              → color={themeColors['icon-brand']}
color={isDark ? '#A0A0B0' : '#A0A0A0'}      → color={themeColors['icon-secondary']}
color={entry.type === 'expense' ? '#EF4444' : '#10B981'} → color={themeColors[entry.type === 'expense' ? 'text-danger' : 'text-success']}
color={isDark ? '#FFFFFF' : '#000000'}      → color={themeColors['icon-primary']}
backgroundColor="#6366F1"                   → backgroundColor={themeColors['bg-primary']}
```

#### `app/index.tsx`
```tsx
// Replace:
color="#FFFFFF" → color={themeColors.white}
```

## Quick Reference

### Adding New Components

1. Import the color system:
```tsx
import { useColors } from '../utils/colors';
import { useIsDark } from '../stores/themeStore';
```

2. Get theme-aware colors:
```tsx
const isDark = useIsDark();
const colors = useColors(isDark);
```

3. Use semantic color names:
```tsx
// Good ✅
<Text style={{ color: colors['text-primary'] }}>
<View style={{ backgroundColor: colors['bg-surface'] }}>

// Bad ❌
<Text style={{ color: '#000000' }}>
<View style={{ backgroundColor: isDark ? '#181A20' : '#FFFFFF' }}>
```

## Benefits

1. **Consistency** - All colors follow the same naming convention
2. **Theme Support** - Automatic light/dark theme switching
3. **Maintainability** - Single source of truth for colors
4. **Scalability** - Easy to add new color variants
5. **Type Safety** - TypeScript support for color names
6. **Accessibility** - Proper contrast ratios maintained

## Color Palette

Our color system is based on modern design systems with proper contrast ratios:

- **Primary**: Blue (#6366F1) - Main brand color
- **Success**: Green (#22C55E) - Success states
- **Danger**: Red (#EF4444) - Error states  
- **Warning**: Orange (#F59E0B) - Warning states
- **Info**: Blue (#3B82F6) - Information states
- **Neutral**: Gray scale for text and UI elements

Each color has 9 variants (50-900) for different use cases, similar to Tailwind CSS. 