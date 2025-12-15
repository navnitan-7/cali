import { colors } from '../constants/Colors';

export type ColorName =
  | 'bg-primary'
  | 'bg-primary-light'
  | 'bg-primary-dark'
  | 'bg-success'
  | 'bg-danger'
  | 'bg-warning'
  | 'bg-info'
  | 'bg-surface'
  | 'bg-card'
  | 'bg-secondary'
  | 'text-primary'
  | 'text-secondary'
  | 'text-muted'
  | 'text-success'
  | 'text-danger'
  | 'text-warning'
  | 'text-info'
  | 'text-brand'
  | 'border-default'
  | 'border-primary'
  | 'border-success'
  | 'border-danger'
  | 'border-muted'
  | 'icon-primary'
  | 'icon-secondary'
  | 'icon-muted'
  | 'icon-brand'
  | 'icon-success'
  | 'icon-danger'
  | 'state-hover'
  | 'state-pressed'
  | 'state-disabled'
  | 'white'
  | 'black';

export type ColorPalette = Record<ColorName, string>;

const lightColors: ColorPalette = {
  // Background colors - Splitwise-style soft tones
  'bg-primary': '#1A1A1A', // Elegant black for light mode
  'bg-primary-light': '#2A2A2A',
  'bg-primary-dark': '#0A0A0A',
  'bg-success': '#5CB85C', // Soft green
  'bg-danger': '#E74C3C', // Soft red
  'bg-warning': '#F39C12', // Soft orange
  'bg-info': '#9B59B6', // Soft purple
  'bg-surface': '#F5F5F7', // Soft light gray background (elegant)
  'bg-card': '#FFFFFF', // Pure white cards with subtle shadow
  'bg-secondary': '#F8F8F9', // Very light gray secondary

  // Text colors - Subtle hierarchy
  'text-primary': '#1A1A1A', // Darker for better contrast
  'text-secondary': '#6B6B6B', // Medium gray
  'text-muted': '#9B9B9B', // Light gray
  'text-success': '#5CB85C',
  'text-danger': '#E74C3C',
  'text-warning': '#F39C12',
  'text-info': '#9B59B6',
  'text-brand': '#1A1A1A',

  // Border colors - More visible but elegant
  'border-default': '#E0E0E0', // More visible border (elegant gray)
  'border-primary': '#1A1A1A',
  'border-success': '#5CB85C',
  'border-danger': '#E74C3C',
  'border-muted': '#EDEDED', // Slightly darker muted border

  // Icon colors
  'icon-primary': '#1A1A1A',
  'icon-secondary': '#6B6B6B',
  'icon-muted': '#9B9B9B',
  'icon-brand': '#1A1A1A',
  'icon-success': '#5CB85C',
  'icon-danger': '#E74C3C',

  // State colors - Subtle interactions
  'state-hover': '#F8F8F8',
  'state-pressed': '#F0F0F0',
  'state-disabled': '#E8E8E8',

  // Absolute colors
  white: '#FFFFFF',
  black: '#000000',
};

const darkColors: ColorPalette = {
  // Background colors - Dark mode with subtle tones
  'bg-primary': '#FFFFFF', // Elegant white for dark mode
  'bg-primary-light': '#F5F5F5',
  'bg-primary-dark': '#E8E8E8',
  'bg-success': '#6BC86C',
  'bg-danger': '#F55C4C',
  'bg-warning': '#FFAC22',
  'bg-info': '#AB69C6',
  'bg-surface': '#121212', // Dark surface (Material dark)
  'bg-card': '#1E1E1E', // Dark card
  'bg-secondary': '#2A2A2A', // Dark secondary

  // Text colors - Light text on dark
  'text-primary': '#E8E8E8', // Light gray
  'text-secondary': '#B0B0B0', // Medium gray
  'text-muted': '#808080', // Muted gray
  'text-success': '#6BC86C',
  'text-danger': '#F55C4C',
  'text-warning': '#FFAC22',
  'text-info': '#AB69C6',
  'text-brand': '#FFFFFF',

  // Border colors - Subtle dark borders
  'border-default': '#2A2A2A',
  'border-primary': '#FFFFFF',
  'border-success': '#6BC86C',
  'border-danger': '#F55C4C',
  'border-muted': '#333333',

  // Icon colors
  'icon-primary': '#FFFFFF',
  'icon-secondary': '#B0B0B0',
  'icon-muted': '#808080',
  'icon-brand': '#FFFFFF',
  'icon-success': '#6BC86C',
  'icon-danger': '#F55C4C',

  // State colors
  'state-hover': '#2A2A2A',
  'state-pressed': '#1E1E1E',
  'state-disabled': '#333333',

  // Absolute colors
  white: '#FFFFFF',
  black: '#000000',
};

export const useColors = (isDark: boolean): ColorPalette => {
  return isDark ? darkColors : lightColors;
};

export const colorPalette = {
  light: lightColors,
  dark: darkColors,
};

