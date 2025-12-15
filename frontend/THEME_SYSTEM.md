# RepX Unified Theme System

## Overview

The RepX app uses a **dual-tone theme system**:
- **Primary Blue** (#4A90E2): Global app color for navigation, CTAs, and main actions
- **Tournament Accent**: Dynamic color per tournament for contextual identity

## Theme Application Rules

### A) Outside Tournament Screens (Global Level)
- Use **ONLY** primary blue
- No tournament accent colors
- Clean, neutral, minimal design

### B) Inside Tournament Screens
- Use **BOTH**:
  - Primary blue (for essential actions, buttons, navigation)
  - Tournament accent color (for visuals, contextual identity, subtle highlights)

## Centralized Theme Hook

```typescript
import { useTournamentTheme } from '@/hooks/useTournamentTheme';

const { accent, primary, getAccentWithOpacity } = useTournamentTheme(tournament);
```

### Returns:
- `primary`: Primary blue color (always available)
- `accent`: Tournament accent color (null if outside tournament)
- `accentLight`: Light variant of accent
- `accentDark`: Dark variant of accent
- `accentBg`: Very light background tint
- `getAccentWithOpacity(opacity)`: Helper to get accent with opacity (0-1)

## Where Tournament Accent Appears

### 1. Tournament Header
- Abstract background shapes (soft blur blobs)
- Accent border at bottom (30-40% opacity)
- Subtle gradient overlays

### 2. Tabs (Events / Participants)
- Selected underline: Uses accent color
- Section dividers: Accent tint (15% opacity)
- Icons/text: Softly tinted with accent

### 3. Event Cards
- Left accent bar (3px border)
- Category tags: Accent color background
- Soft accent gradient in backgrounds

### 4. Participant List
- Accent dot indicators on avatars
- Avatar backgrounds: Accent color
- Selected row: Accent stroke

### 5. Forms (All Forms)
- **Input focus ring**: Accent color
- **Labels**: Accent tint (80% opacity)
- **Buttons**: Primary blue (always)
- **Section headers**: Accent tint
- **Icons**: Neutral or blue
- **Selected options**: Accent background

Forms that use accent:
- Add Participant Form
- Create Event Form
- Metrics Form
- Upload Video UI
- All modals/sheets

### 6. Event Details & Leaderboard
- Accent tint in row separators
- Accent for category markers
- Small accent for leaderboard rank highlights
- Top 1/2/3 medals: Standard (gold/silver/bronze)

## Design Tokens

### Colors
- Primary Blue: `#4A90E2` (light) / `#5A9FE8` (dark)
- Accent Colors: Generated per tournament (muted, 40-65% saturation)
- Background: `#FAFAFA` (light) / `#121212` (dark)
- Cards: `#FFFFFF` (light) / `#1E1E1E` (dark)

### Spacing
- Consistent rhythm: 8px, 12px, 16px
- Card padding: 12-16px
- Section gaps: 8-12px

### Typography
- Headings: 16-18px (semibold/bold)
- Body: 14-15px (regular/medium)
- Labels: 13-14px (medium)
- Small: 11-12px (regular)

### Elevation
- Minimal shadows: 1-2px
- Subtle borders: 1px
- Accent borders: 2-3px

## Implementation Examples

### Form Input with Accent
```typescript
<TextInput
  style={{
    borderWidth: 1.5,
    borderColor: focused && accent ? accent : colors['border-default'],
    backgroundColor: focused && accent 
      ? getAccentWithOpacity(0.05)
      : colors['bg-secondary'],
  }}
  onFocus={() => setFocused(true)}
/>
```

### Section Header with Accent
```typescript
<Text style={{
  color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
}}>
  Section Title
</Text>
```

### Card with Accent Bar
```typescript
<View style={{
  borderLeftWidth: accent ? 3 : 0,
  borderLeftColor: accent,
}}>
  {/* Card content */}
</View>
```

## Consistency Checklist

✅ All forms use accent for focus states
✅ All labels use accent tint
✅ All buttons use primary blue
✅ All headers have accent background shapes
✅ All tabs use accent for active state
✅ All cards have accent indicators
✅ All participant avatars have accent dots
✅ All section dividers use accent tint

## Files Modified

1. `RepX/hooks/useTournamentTheme.ts` - Centralized theme hook
2. `RepX/utils/tournamentAccent.ts` - Accent color generator
3. `RepX/app/(tabs)/tournaments/[id]/index.tsx` - Tournament detail
4. `RepX/app/(tabs)/tournaments/[id]/events/[eventId].tsx` - Event detail
5. `RepX/app/(tabs)/tournaments/[id]/participants/create.tsx` - Add participant form
6. `RepX/app/(tabs)/tournaments/[id]/events/create.tsx` - Create event form
7. `RepX/components/ui/TabSwitch.tsx` - Tab component with accent support

