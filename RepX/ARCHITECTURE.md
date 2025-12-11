# RepX - Complete Architecture Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack & Libraries](#technology-stack--libraries)
3. [Application Architecture](#application-architecture)
4. [File Structure](#file-structure)
5. [Design Patterns & Principles](#design-patterns--principles)
6. [State Management](#state-management)
7. [Navigation System](#navigation-system)
8. [Styling System](#styling-system)
9. [Form Handling & Validation](#form-handling--validation)
10. [Data Models & Schemas](#data-models--schemas)
11. [Component Architecture](#component-architecture)
12. [Utilities & Helpers](#utilities--helpers)
13. [Configuration Files](#configuration-files)
14. [Development Workflow](#development-workflow)

---

## Project Overview

**RepX** is a modern fitness competition management mobile application built with React Native and Expo. The app enables event organizers to manage fitness/calisthenics competitions, track participants, record metrics, and maintain leaderboards.

### Key Features
- **Event Management**: Create and manage fitness competitions with multiple divisions
- **Participant Tracking**: Add participants, track their metrics (time, weight, reps)
- **Leaderboard System**: Real-time rankings with neon-styled top 3 highlights
- **Video & Metrics**: Upload attempt videos and record performance metrics
- **Theme System**: Dark mode with black/grey theme and neon accents
- **Modern UI**: Glassmorphism effects, smooth animations, and Gen-Z aesthetic

---

## Technology Stack & Libraries

### Core Framework & Runtime
| Library | Version | Purpose |
|---------|---------|---------|
| **react** | `19.0.0` | Core React library for UI components |
| **react-native** | `0.79.4` | Mobile app framework for iOS/Android |
| **react-dom** | `19.0.0` | React DOM renderer for web support |
| **expo** | `~53.0.13` | Development platform, build tools, and native modules |
| **expo-router** | `~5.1.1` | File-based routing system (replaces React Navigation setup) |

### Navigation & Routing
| Library | Version | Purpose |
|---------|---------|---------|
| **@react-navigation/native** | `^7.1.6` | Core navigation library |
| **@react-navigation/bottom-tabs** | `^7.3.10` | Bottom tab navigation component |
| **@react-navigation/elements** | `^2.3.8` | Navigation UI elements |
| **react-native-screens** | `~4.11.1` | Native screen components for navigation |
| **react-native-safe-area-context** | `5.4.0` | Safe area handling for notched devices |
| **react-native-gesture-handler** | `~2.24.0` | Native gesture recognition |

### State Management & Data
| Library | Version | Purpose |
|---------|---------|---------|
| **zustand** | `^5.0.6` | Lightweight state management (replaces Redux) |
| **@react-native-async-storage/async-storage** | `^2.2.0` | Persistent local storage |
| **react-hook-form** | `^7.59.0` | Performant form handling with minimal re-renders |
| **@hookform/resolvers** | `^5.1.1` | Validation resolvers for React Hook Form |
| **zod** | `^3.25.67` | Schema validation and TypeScript type inference |

### Styling & UI
| Library | Version | Purpose |
|---------|---------|---------|
| **nativewind** | `^4.1.23` | Tailwind CSS for React Native |
| **tailwindcss** | `^3.4.17` | Utility-first CSS framework |
| **@expo/vector-icons** | `^14.1.0` | Comprehensive icon library (Ionicons, MaterialCommunityIcons) |
| **expo-blur** | `~14.1.5` | Blur effects for modals and overlays |
| **expo-image** | `~2.3.0` | Optimized image component |

### Expo Modules & Utilities
| Library | Version | Purpose |
|---------|---------|---------|
| **expo-font** | `~13.3.1` | Custom font loading (Poppins family) |
| **expo-splash-screen** | `~0.30.9` | Splash screen management |
| **expo-status-bar** | `~2.2.3` | Status bar styling |
| **expo-constants** | `~17.1.6` | App constants and device info |
| **expo-linking** | `~7.1.5` | Deep linking and URL handling |
| **expo-system-ui** | `~5.0.9` | System UI appearance control |
| **expo-web-browser** | `~14.2.0` | In-app browser functionality |
| **expo-haptics** | `~14.1.4` | Haptic feedback (vibration) |
| **expo-symbols** | `~0.4.5` | SF Symbols support (iOS) |

### Animation & Interactions
| Library | Version | Purpose |
|---------|---------|---------|
| **react-native-reanimated** | `~3.17.4` | High-performance animations |

### Web Support
| Library | Version | Purpose |
|---------|---------|---------|
| **react-native-web** | `~0.20.0` | React Native components for web |
| **react-native-webview** | `13.13.5` | WebView component for web content |

### Development Tools
| Library | Version | Purpose |
|---------|---------|---------|
| **typescript** | `~5.8.3` | Type safety and developer experience |
| **@types/react** | `~19.0.10` | TypeScript definitions for React |
| **eslint** | `^9.25.0` | Code linting and quality enforcement |
| **eslint-config-expo** | `~9.2.0` | Expo-specific ESLint configuration |
| **@babel/core** | `^7.25.2` | JavaScript compiler and transpiler |

---

## Application Architecture

### Architecture Pattern
The app follows a **Feature-Based Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    App Entry Point                      │
│                  (app/_layout.tsx)                       │
│  - Theme Provider                                        │
│  - Font Loading                                          │
│  - Splash Screen Management                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Navigation Layer                        │
│              (Expo Router File-Based)                     │
│  - Stack Navigation (Root)                               │
│  - Tab Navigation (Main Features)                         │
│  - Stack Navigation (Feature Details)                     │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Inventory   │  │  Customers   │  │   Settings   │
│   Feature    │  │   Feature    │  │   Feature    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│              Component Layer                             │
│  - UI Components (Button, Card, etc.)                    │
│  - Form Components (Inputs, Selectors)                   │
│  - Feature-Specific Components (Modals, Lists)           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Business Logic Layer                        │
│  - Zustand Stores (Theme, State)                        │
│  - Zod Schemas (Validation)                              │
│  - Utility Functions (Colors, Fonts)                     │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **File-Based Routing (Expo Router)**
   - Eliminates manual route configuration
   - Type-safe navigation with typed routes
   - Automatic code splitting

2. **Zustand for State Management**
   - Lightweight alternative to Redux
   - Minimal boilerplate
   - Optimized selectors prevent unnecessary re-renders

3. **React Hook Form + Zod**
   - Performance: Minimal re-renders
   - Type Safety: Schema-driven validation with TypeScript inference
   - Developer Experience: Declarative form handling

4. **NativeWind (Tailwind CSS)**
   - Utility-first styling
   - Consistent design system
   - Theme-aware classes

5. **Centralized Theme System**
   - Single source of truth for colors
   - Theme-aware color functions
   - Easy dark/light mode switching

---

## File Structure

```
RepX/
│
├── app/                              # Expo Router Pages (File-Based Routing)
│   ├── _layout.tsx                   # Root layout (theme, fonts, splash)
│   ├── index.tsx                     # Landing/Splash screen
│   ├── modal.tsx                     # Global modal route
│   ├── global.css                    # Global styles (NativeWind)
│   └── (tabs)/                       # Tab Navigation Group
│       ├── _layout.tsx               # Tab navigation configuration
│       ├── inventory/                # Inventory Feature
│       │   ├── _layout.tsx           # Inventory stack layout
│       │   ├── index.tsx             # Inventory dashboard
│       │   ├── [id].tsx              # Dynamic route: Island details
│       │   ├── products.tsx          # Products management screen
│       │   └── inventoryStock/       # Inventory Stock Sub-feature
│       │       ├── _layout.tsx       # Stock stack layout
│       │       ├── index.tsx         # Stock list screen
│       │       └── [id].tsx         # Dynamic route: Stock details
│       ├── customer/                 # Customer Feature
│       │   ├── _layout.tsx           # Customer stack layout
│       │   ├── index.tsx             # Customer list screen
│       │   ├── [id].tsx              # Dynamic route: Customer details
│       │   └── CustomerList.tsx      # Customer list component
│       └── settings.tsx              # Settings screen
│
├── components/                       # Reusable Components
│   ├── ui/                          # Core UI Components
│   │   ├── Button.tsx               # Button component (5 variants)
│   │   ├── Card.tsx                 # Card component
│   │   ├── CustomerCard.tsx         # Customer-specific card
│   │   ├── DateSelector.tsx         # Date picker component
│   │   ├── FloatingActionButton.tsx # FAB component
│   │   ├── TabSwitch.tsx            # Tab switcher component
│   │   └── TestComponent.tsx        # Development component
│   │
│   ├── commonInputComponents/       # Form Input Components
│   │   ├── FormTextInput.tsx        # Text input with validation
│   │   ├── FormNumericInput.tsx     # Numeric input with validation
│   │   ├── FormSelectableButtons.tsx # Button group selector
│   │   ├── FormToggleSwitch.tsx     # Toggle switch input
│   │   └── index.ts                 # Barrel export
│   │
│   ├── inventorySpecific/           # Inventory Feature Components
│   │   ├── CreateCashflowModal.tsx  # Cashflow creation modal
│   │   ├── EditCashflowModal.tsx     # Cashflow editing modal
│   │   ├── CreateSalesModal.tsx      # Sales creation modal
│   │   ├── EditSalesModal.tsx        # Sales editing modal
│   │   ├── productsSpecific/         # Product-specific components
│   │   │   └── createModals/
│   │   │       ├── CreateProductModal.tsx
│   │   │       ├── EditProductModal.tsx
│   │   │       └── index.ts
│   │   └── inventoryStock/          # Stock-specific components
│   │       ├── AddTransactionModal.tsx
│   │       ├── CreateInventoryStockModal.tsx
│   │       ├── EditInventoryStockModal.tsx
│   │       ├── LinkedSalesUnitSelector.tsx
│   │       └── index.ts
│   │
│   └── customerSpecific/            # Customer Feature Components
│       └── createModals/            # Customer modals (future)
│
├── schemas/                         # Zod Validation Schemas
│   ├── productModal.ts              # Product data schema
│   ├── inventoryStockModal.ts       # Inventory stock schema
│   ├── salesModal.ts               # Sales transaction schema
│   ├── cashflowModal.ts            # Cashflow entry schema
│   └── transactionModal.ts          # Stock movement schema
│
├── stores/                          # Zustand State Stores
│   └── themeStore.ts               # Theme state management
│
├── utils/                           # Utility Functions
│   ├── colors.ts                   # Color system and theme utilities
│   └── fonts.ts                    # Font family utilities
│
├── constants/                       # App Constants
│   ├── Colors.ts                   # Legacy color constants
│   └── mockData.ts                 # Mock data for development
│
├── assets/                          # Static Assets
│   ├── fonts/                      # Poppins font family
│   │   ├── Poppins-Regular.ttf
│   │   ├── Poppins-Medium.ttf
│   │   ├── Poppins-SemiBold.ttf
│   │   ├── Poppins-Bold.ttf
│   │   └── ... (all variants)
│   └── images/                     # App images and icons
│       ├── icon.png
│       ├── adaptive-icon.png
│       ├── splash-icon.png
│       └── ...
│
├── docs/                            # Documentation
│   └── COLOR_SYSTEM.md             # Color system documentation
│
├── scripts/                         # Build Scripts
│   └── reset-project.js            # Project reset utility
│
├── src/                            # Additional Source (Future)
│   ├── navigation/                 # Navigation utilities (if needed)
│   ├── screens/                    # Screen components (if needed)
│   └── types/                      # TypeScript type definitions
│
├── Configuration Files
│   ├── package.json                # Dependencies and scripts
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── babel.config.js             # Babel transpilation config
│   ├── metro.config.js             # Metro bundler configuration
│   ├── eslint.config.js            # ESLint configuration
│   ├── app.json                    # Expo app configuration
│   ├── expo-env.d.ts               # Expo TypeScript definitions
│   └── nativewind-env.d.ts         # NativeWind TypeScript definitions
│
└── README.md                        # Project README
```

---

## Design Patterns & Principles

### 1. Component Composition
- **Pattern**: Build complex UIs from simple, reusable components
- **Example**: `FormTextInput` + `FormNumericInput` compose into modal forms
- **Benefit**: Reusability, testability, maintainability

### 2. Container/Presentational Pattern
- **Pattern**: Separate data logic from presentation
- **Example**: Screens (containers) use components (presentational)
- **Benefit**: Clear separation of concerns

### 3. Custom Hooks Pattern
- **Pattern**: Extract reusable logic into custom hooks
- **Example**: `useTheme()`, `useIsDark()`, `useColors()`
- **Benefit**: Logic reuse, cleaner components

### 4. Schema-Driven Development
- **Pattern**: Define data structures with Zod schemas
- **Example**: `productSchema` defines both validation and TypeScript types
- **Benefit**: Single source of truth, type safety, runtime validation

### 5. Provider Pattern
- **Pattern**: Context providers for global state
- **Example**: Theme store accessible throughout app
- **Benefit**: Avoid prop drilling, centralized state

### 6. Factory Pattern
- **Pattern**: Utility functions that return configured objects
- **Example**: `getThemeColors(isDark)` returns theme-aware color object
- **Benefit**: Consistent object creation, easy configuration

---

## State Management

### Zustand Store Architecture

#### Theme Store (`stores/themeStore.ts`)
```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean; // Computed property
}
```

**Usage Pattern:**
```typescript
// Optimized selectors prevent unnecessary re-renders
const theme = useTheme();        // Only re-renders on theme change
const isDark = useIsDark();      // Computed selector
const setTheme = useSetTheme();  // Action selector
```

**Benefits:**
- Minimal boilerplate compared to Redux
- Optimized selectors prevent unnecessary re-renders
- Simple API for state updates
- No provider wrapping required

### Local State Management
- **React `useState`**: Component-specific state
- **React Hook Form**: Form state management
- **React `useRef`**: Mutable values without re-renders

### Future State Management
- **AsyncStorage Integration**: Persist theme preference
- **Additional Stores**: User preferences, app settings, cached data

---

## Navigation System

### Expo Router (File-Based Routing)

#### Route Structure
```
app/
├── _layout.tsx          # Root Stack Navigator
│   ├── index            # Splash/Landing
│   ├── (tabs)           # Tab Navigator
│   └── modal            # Modal Stack
│
└── (tabs)/
    ├── inventory/       # Inventory Stack
    │   ├── index        # Dashboard
    │   ├── [id]         # Dynamic: Island details
    │   ├── products     # Products list
    │   └── inventoryStock/
    │       ├── index    # Stock list
    │       └── [id]     # Dynamic: Stock details
    │
    ├── customer/        # Customer Stack
    │   ├── index        # Customer list
    │   └── [id]         # Dynamic: Customer details
    │
    └── settings         # Settings screen
```

#### Navigation Patterns

**1. Stack Navigation**
```typescript
// Root Stack (app/_layout.tsx)
<Stack>
  <Stack.Screen name="index" />
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="modal" presentation="modal" />
</Stack>
```

**2. Tab Navigation**
```typescript
// Tab Navigator (app/(tabs)/_layout.tsx)
<Tabs>
  <Tabs.Screen name="inventory" />
  <Tabs.Screen name="customer" />
  <Tabs.Screen name="settings" />
</Tabs>
```

**3. Nested Stack Navigation**
```typescript
// Feature Stack (app/(tabs)/inventory/_layout.tsx)
<Stack>
  <Stack.Screen name="index" />
  <Stack.Screen name="[id]" />
  <Stack.Screen name="products" />
  <Stack.Screen name="inventoryStock" />
</Stack>
```

**4. Programmatic Navigation**
```typescript
import { router } from 'expo-router';

// Navigate to route
router.push('/(tabs)/inventory/products');

// Navigate with params
router.push(`/(tabs)/inventory/${islandId}`);

// Replace current route
router.replace('/(tabs)/inventory');

// Go back
router.back();
```

#### Dynamic Routes
- `[id].tsx`: Dynamic route parameter
- Access via `useLocalSearchParams()` hook

---

## Styling System

### NativeWind (Tailwind CSS for React Native)

#### Configuration (`tailwind.config.js`)
```javascript
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins-Regular'],
        'poppins-medium': ['Poppins-Medium'],
        'poppins-semibold': ['Poppins-SemiBold'],
        'poppins-bold': ['Poppins-Bold'],
      },
    },
  },
};
```

#### Usage Patterns

**1. Utility Classes**
```tsx
<View className="flex-1 bg-white dark:bg-gray-900">
  <Text className="text-lg font-poppins-bold text-gray-900">
    Hello World
  </Text>
</View>
```

**2. Theme-Aware Colors (Utility Function)**
```tsx
const colors = useColors(isDark);
<View style={{ backgroundColor: colors['bg-surface'] }}>
  <Text style={{ color: colors['text-primary'] }}>Text</Text>
</View>
```

**3. Hybrid Approach (Recommended)**
```tsx
// Use NativeWind for layout, utility functions for theme colors
<View className="flex-1 p-4" style={{ backgroundColor: colors['bg-surface'] }}>
  <Text className="text-lg font-poppins-semibold" style={{ color: colors['text-primary'] }}>
    Content
  </Text>
</View>
```

### Color System (`utils/colors.ts`)

#### Color Palette Structure
```typescript
colorPalette = {
  primary: { 50-900 },    // Brand colors
  success: { 50-900 },     // Success states
  danger: { 50-900 },      // Error states
  warning: { 50-900 },     // Warning states
  info: { 50-900 },        // Info states
  neutral: { 50-900 },     // Grayscale
  dark: { ... },           // Dark theme specific
  light: { ... },          // Light theme specific
}
```

#### Theme-Aware Color Functions
```typescript
// Get all theme colors
const colors = useColors(isDark);

// Available color keys:
colors['bg-primary']        // Primary background
colors['bg-surface']         // Main surface (theme-aware)
colors['bg-card']            // Card background (theme-aware)
colors['text-primary']       // Primary text (theme-aware)
colors['text-secondary']     // Secondary text (theme-aware)
colors['border-default']     // Default border (theme-aware)
colors['icon-primary']       // Icon color (theme-aware)
// ... and more
```

### Typography System (`utils/fonts.ts`)

#### Font Weights
```typescript
fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
}
```

#### Usage
```typescript
import { getFontFamily } from '../utils/fonts';

// In styles
fontFamily: getFontFamily('semibold')  // Returns 'Poppins-SemiBold'

// In NativeWind classes
className="font-poppins-bold"
```

---

## Form Handling & Validation

### React Hook Form + Zod Integration

#### Pattern Overview
1. **Define Zod Schema**: Validation rules and TypeScript types
2. **Create Form Hook**: Use `useForm` with `zodResolver`
3. **Connect Inputs**: Use `Controller` component
4. **Handle Submission**: `handleSubmit` with validation

#### Example: Product Form
```typescript
// 1. Schema Definition (schemas/productModal.ts)
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  uom: z.string().min(1, 'Unit of measure is required'),
  status: z.enum(['active', 'inactive']),
});

export type ProductData = z.infer<typeof productSchema>;

// 2. Form Setup (Component)
const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<ProductData>({
  resolver: zodResolver(productSchema),
  defaultValues: productDefaults,
  mode: 'onChange', // Real-time validation
});

// 3. Form Input (Component)
<FormTextInput
  control={control}
  name="name"
  label="Product Name"
  error={errors.name?.message}
  isDark={isDark}
  required
/>

// 4. Form Submission
const onSubmit = (data: ProductData) => {
  // Handle validated data
  onSave(data);
};

<Button title="Save" onPress={handleSubmit(onSubmit)} />
```

#### Form Input Components

**1. FormTextInput**
- Text input with validation
- Error display
- Required field indicator
- Multiline support

**2. FormNumericInput**
- Numeric keyboard
- Number formatting
- Min/max validation

**3. FormSelectableButtons**
- Button group selection
- Single/multiple selection
- Visual feedback

**4. FormToggleSwitch**
- Boolean input
- Toggle switch UI
- Theme-aware styling

#### Validation Features
- **Real-time Validation**: `mode: 'onChange'`
- **Custom Error Messages**: Defined in Zod schema
- **Type Safety**: TypeScript types inferred from schema
- **Nested Validation**: Complex object validation
- **Conditional Validation**: `.refine()` for custom rules

---

## Data Models & Schemas

### Schema Definitions (Zod)

#### 1. Product Schema (`schemas/productModal.ts`)
```typescript
interface ProductData {
  id?: string;
  name: string;              // 1-50 characters
  category: string;          // 1-30 characters
  price: number;            // 0.01 - 99,999.99
  uom: string;             // Unit of measure
  status: 'active' | 'inactive';
}
```

**Categories**: Fuel, Lubricants, Accessories, Services, Others
**Units**: Ltr, Kg, Pcs, Box, Gal, Ml, Gm

#### 2. Inventory Stock Schema (`schemas/inventoryStockModal.ts`)
```typescript
interface InventoryStockData {
  id?: string;
  name: string;                    // 1-50 characters
  product: string;                 // 1-30 characters
  capacity: number;                // 1 - 999,999
  available: number;               // 0 - 999,999
  lowLimit: number;               // 0 - 999,999
  type: string;                    // 1-20 characters
  unit: string;                    // Unit of measure
  linkedSalesUnits?: string[];     // Connected sales units
  status: 'active' | 'inactive';
}
```

**Types**: Tank, Box, Container, Barrel, Cylinder, Others
**Products**: Petrol, Diesel, Engine Oil, Hydraulic Oil, Brake Oil, Coolant, Others

#### 3. Sales Schema (`schemas/salesModal.ts`)
```typescript
interface SalesProductData {
  name: string;                    // 1-100 characters
  price: number;                   // 0.01 - 999,999
  product: string;                 // Product type
  opening: number;                 // 0 - 999,999
  closing: number;                 // 0 - 999,999 (must be <= opening)
}
```

**Validation Rule**: `opening >= closing`

#### 4. Cashflow Schema (`schemas/cashflowModal.ts`)
```typescript
interface CashflowData {
  amount: number;                  // 0.01 - 99,99,999
  type: 'income' | 'expense';
  mode: string;                    // Payment mode
  category: string;                // Category
  note?: string;                   // Optional note (max 500 chars)
}
```

**Payment Modes**: UPI, Cash, Card, Bank Transfer, Other
**Income Categories**: Sales Income, Interest, Other Income
**Expense Categories**: Fuel Purchase, Maintenance, Utilities, Staff Salary, Other Expense

#### 5. Transaction Schema (`schemas/transactionModal.ts`)
```typescript
interface StockMovementData {
  id?: string;
  type: 'stock_in' | 'stock_out';
  amount: number;                  // 0.01 - 999,999
  date: string;                    // ISO date string
  reference: string;               // 1-50 characters
  remarks?: string;                // Optional
}
```

**Transaction Types**:
- `stock_in`: Stock addition (Green)
- `stock_out`: Stock removal (Red)

---

## Component Architecture

### Component Hierarchy

```
App Root
└── RootLayout (app/_layout.tsx)
    ├── StatusBar
    └── Stack Navigator
        ├── Splash Screen (app/index.tsx)
        ├── Tab Navigator (app/(tabs)/_layout.tsx)
        │   ├── Inventory Tab
        │   │   └── Inventory Stack
        │   │       ├── Dashboard (index.tsx)
        │   │       ├── Island Details ([id].tsx)
        │   │       ├── Products (products.tsx)
        │   │       └── Inventory Stock Stack
        │   │           ├── Stock List (index.tsx)
        │   │           └── Stock Details ([id].tsx)
        │   ├── Customer Tab
        │   │   └── Customer Stack
        │   │       ├── Customer List (index.tsx)
        │   │       └── Customer Details ([id].tsx)
        │   └── Settings Tab (settings.tsx)
        └── Modal (app/modal.tsx)
```

### Component Categories

#### 1. UI Components (`components/ui/`)
**Purpose**: Reusable, theme-aware UI building blocks

- **Button**: 5 variants (primary, secondary, outline, danger, noBorder)
- **Card**: Container component with theme support
- **CustomerCard**: Customer-specific card layout
- **DateSelector**: Date picker with navigation
- **FloatingActionButton**: FAB for quick actions
- **TabSwitch**: Tab switcher component

#### 2. Form Components (`components/commonInputComponents/`)
**Purpose**: Standardized form inputs with validation

- **FormTextInput**: Text input with React Hook Form integration
- **FormNumericInput**: Numeric input with formatting
- **FormSelectableButtons**: Button group selector
- **FormToggleSwitch**: Toggle switch input

**Pattern**: All form components use `Controller` from React Hook Form

#### 3. Feature Components (`components/inventorySpecific/`)
**Purpose**: Feature-specific, business logic components

- **Modals**: Create/Edit modals for products, stock, sales, cashflow
- **Selectors**: Specialized selectors (LinkedSalesUnitSelector)
- **Transaction Components**: Stock movement components

### Component Props Pattern

```typescript
// Standard component interface
interface ComponentProps {
  // Required props
  title: string;
  onPress: () => void;
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  
  // Style overrides
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Theme
  isDark: boolean; // Explicit theme prop (or use hook)
}
```

### Component Composition Example

```typescript
// Complex modal composed of simple components
<Modal>
  <SafeAreaView>
    <ScrollView>
      <FormTextInput control={control} name="name" />
      <FormNumericInput control={control} name="price" />
      <FormSelectableButtons control={control} name="category" />
      <Button title="Save" onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  </SafeAreaView>
</Modal>
```

---

## Utilities & Helpers

### Color Utilities (`utils/colors.ts`)

#### Functions
- `getThemeColors(isDark: boolean)`: Returns theme-aware color object
- `useColors(isDark: boolean)`: Convenience function (hook-like)
- `getColor(colorName, isDark)`: Get specific color by name

#### Color Categories
- **Background Colors**: `bg-primary`, `bg-surface`, `bg-card`, etc.
- **Text Colors**: `text-primary`, `text-secondary`, `text-muted`, etc.
- **Border Colors**: `border-default`, `border-primary`, etc.
- **Icon Colors**: `icon-primary`, `icon-secondary`, etc.
- **State Colors**: `state-hover`, `state-pressed`, `state-disabled`

### Font Utilities (`utils/fonts.ts`)

#### Functions
- `getFontFamily(weight: FontWeight)`: Returns font family string
- **Weights**: `'regular' | 'medium' | 'semibold' | 'bold'`

#### Usage
```typescript
import { getFontFamily } from '../utils/fonts';

// In style object
fontFamily: getFontFamily('semibold')

// Returns: 'Poppins-SemiBold'
```

---

## Configuration Files

### TypeScript (`tsconfig.json`)
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    },
    "types": ["nativewind/types"]
  }
}
```

**Features**:
- Strict mode enabled
- Path aliases (`@/*`)
- NativeWind type support

### Tailwind CSS (`tailwind.config.js`)
- Content paths for class scanning
- Custom font family configuration
- NativeWind preset

### Babel (`babel.config.js`)
- Expo preset with NativeWind JSX
- NativeWind Babel plugin

### Metro (`metro.config.js`)
- Default Expo config
- NativeWind Metro integration
- Global CSS input

### ESLint (`eslint.config.js`)
- Expo ESLint config
- Flat config format
- Ignore patterns

### Expo (`app.json`)
- App metadata (name, version, slug)
- Platform-specific configs (iOS, Android, Web)
- Plugins (expo-router, splash-screen)
- Asset bundle patterns
- Typed routes experiment

---

## Development Workflow

### Scripts (`package.json`)
```json
{
  "scripts": {
    "start": "expo start",              // Start dev server
    "android": "expo start --android",   // Run on Android
    "ios": "expo start --ios",          // Run on iOS
    "web": "expo start --web",          // Run on Web
    "lint": "expo lint",                // Run ESLint
    "reset-project": "node ./scripts/reset-project.js"
  }
}
```

### Development Process

1. **Start Development Server**
   ```bash
   npm start
   ```

2. **Run on Device/Simulator**
   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web Browser
   ```

3. **Code Quality**
   ```bash
   npm run lint     # Check code quality
   ```

### Best Practices

1. **Type Safety**: Always use TypeScript types
2. **Component Props**: Define explicit interfaces
3. **Form Validation**: Use Zod schemas
4. **Theme Colors**: Use `useColors()` utility
5. **Fonts**: Use `getFontFamily()` utility
6. **Navigation**: Use Expo Router file-based routing
7. **State**: Use Zustand for global state
8. **Styling**: Prefer utility functions for theme colors, NativeWind for layout

### File Naming Conventions
- **Components**: PascalCase (`Button.tsx`, `FormTextInput.tsx`)
- **Utilities**: camelCase (`colors.ts`, `fonts.ts`)
- **Schemas**: camelCase (`productModal.ts`)
- **Stores**: camelCase (`themeStore.ts`)
- **Screens**: Follow Expo Router conventions (lowercase, `[id].tsx` for dynamic)

---

## Summary

### Architecture Highlights
✅ **File-Based Routing**: Expo Router eliminates route configuration  
✅ **Type Safety**: TypeScript + Zod for end-to-end type safety  
✅ **State Management**: Zustand for lightweight, performant state  
✅ **Form Handling**: React Hook Form + Zod for validation  
✅ **Styling**: NativeWind + centralized theme system  
✅ **Component Architecture**: Reusable, composable components  
✅ **Theme Support**: Comprehensive dark/light mode  

### Technology Choices Rationale
- **Expo Router**: Simplifies navigation, type-safe routes
- **Zustand**: Minimal boilerplate, better performance than Redux
- **React Hook Form**: Performance-focused form handling
- **Zod**: Schema validation with TypeScript inference
- **NativeWind**: Utility-first styling with Tailwind CSS
- **TypeScript**: Type safety and developer experience

### Scalability Considerations
- Modular component architecture
- Feature-based folder structure
- Centralized utilities and constants
- Schema-driven data validation
- Optimized state management with selectors
- Theme system ready for customization

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-01-12  
**Maintained By**: RepX Development Team


