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
  // Background colors
  'bg-primary': '#00FF88', // Neon green
  'bg-primary-light': '#33FFAA',
  'bg-primary-dark': '#00CC6A',
  'bg-success': '#00FF88',
  'bg-danger': '#FF3366',
  'bg-warning': '#FFAA00',
  'bg-info': '#8B5CF6', // Purple
  'bg-surface': '#000000', // Pure black
  'bg-card': '#1A1A1A', // Dark grey card
  'bg-secondary': '#2A2A2A', // Grey secondary

  // Text colors
  'text-primary': '#FFFFFF',
  'text-secondary': '#B0B0B0',
  'text-muted': '#808080',
  'text-success': '#00FF88',
  'text-danger': '#FF3366',
  'text-warning': '#FFAA00',
  'text-info': '#8B5CF6',
  'text-brand': '#00FF88',

  // Border colors
  'border-default': '#333333',
  'border-primary': '#00FF88',
  'border-success': '#00FF88',
  'border-danger': '#FF3366',
  'border-muted': '#404040',

  // Icon colors
  'icon-primary': '#FFFFFF',
  'icon-secondary': '#B0B0B0',
  'icon-muted': '#808080',
  'icon-brand': '#00FF88',
  'icon-success': '#00FF88',
  'icon-danger': '#FF3366',

  // State colors
  'state-hover': '#2A2A2A',
  'state-pressed': '#1A1A1A',
  'state-disabled': '#404040',

  // Absolute colors
  white: '#FFFFFF',
  black: '#000000',
};

const darkColors: ColorPalette = {
  // Background colors
  'bg-primary': '#00FF88', // Neon green
  'bg-primary-light': '#33FFAA',
  'bg-primary-dark': '#00CC6A',
  'bg-success': '#00FF88',
  'bg-danger': '#FF3366',
  'bg-warning': '#FFAA00',
  'bg-info': '#8B5CF6', // Purple
  'bg-surface': '#000000', // Pure black
  'bg-card': '#1A1A1A', // Dark grey card
  'bg-secondary': '#2A2A2A', // Grey secondary

  // Text colors
  'text-primary': '#FFFFFF',
  'text-secondary': '#B0B0B0',
  'text-muted': '#808080',
  'text-success': '#00FF88',
  'text-danger': '#FF3366',
  'text-warning': '#FFAA00',
  'text-info': '#8B5CF6',
  'text-brand': '#00FF88',

  // Border colors
  'border-default': '#333333',
  'border-primary': '#00FF88',
  'border-success': '#00FF88',
  'border-danger': '#FF3366',
  'border-muted': '#404040',

  // Icon colors
  'icon-primary': '#FFFFFF',
  'icon-secondary': '#B0B0B0',
  'icon-muted': '#808080',
  'icon-brand': '#00FF88',
  'icon-success': '#00FF88',
  'icon-danger': '#FF3366',

  // State colors
  'state-hover': '#2A2A2A',
  'state-pressed': '#1A1A1A',
  'state-disabled': '#404040',

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

