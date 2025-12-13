// Tournament accent color generator
// Generates soft, muted accent colors based on tournament name/type

interface AccentColor {
  primary: string;
  light: string;
  dark: string;
  bg: string; // Very light background tint
}

// Predefined accent colors for common tournament types
const tournamentTypeAccents: Record<string, AccentColor> = {
  'endurance': {
    primary: '#4ECDC4', // Soft teal
    light: '#6EDDD6',
    dark: '#3AB5AD',
    bg: '#E8F7F6',
  },
  'strength': {
    primary: '#FF8A65', // Muted orange
    light: '#FFAB91',
    dark: '#E65100',
    bg: '#FFF3F0',
  },
  'street lifting': {
    primary: '#81C784', // Dark lime/steel green
    light: '#A5D6A7',
    dark: '#66BB6A',
    bg: '#F1F8E9',
  },
  'calisthenics': {
    primary: '#64B5F6', // Soft blue-green
    light: '#90CAF9',
    dark: '#42A5F5',
    bg: '#E3F2FD',
  },
  'street workout': {
    primary: '#9575CD', // Soft purple
    light: '#B39DDB',
    dark: '#7E57C2',
    bg: '#F3E5F5',
  },
  'freestyle': {
    primary: '#F06292', // Soft pink
    light: '#F48FB1',
    dark: '#EC407A',
    bg: '#FCE4EC',
  },
  'default': {
    primary: '#A8DADC', // Soft mint/teal
    light: '#C7E8EA',
    dark: '#8BC4C7',
    bg: '#F0F9FA',
  },
};

// Generate accent color from tournament name hash
function generateAccentFromName(name: string): AccentColor {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL color with low saturation for muted look
  const hue = Math.abs(hash) % 360;
  const saturation = 40 + (Math.abs(hash) % 25); // 40-65% saturation (muted)
  const lightness = 55 + (Math.abs(hash) % 20); // 55-75% lightness (soft)

  // Convert HSL to RGB
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h * 6 < 1) {
    r = c; g = x; b = 0;
  } else if (h * 6 < 2) {
    r = x; g = c; b = 0;
  } else if (h * 6 < 3) {
    r = 0; g = c; b = x;
  } else if (h * 6 < 4) {
    r = 0; g = x; b = c;
  } else if (h * 6 < 5) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const primary = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  // Generate light variant (brighter)
  const lightR = Math.min(255, r + 25);
  const lightG = Math.min(255, g + 25);
  const lightB = Math.min(255, b + 25);
  const light = `#${toHex(lightR)}${toHex(lightG)}${toHex(lightB)}`;

  // Generate dark variant (darker)
  const darkR = Math.max(0, r - 25);
  const darkG = Math.max(0, g - 25);
  const darkB = Math.max(0, b - 25);
  const dark = `#${toHex(darkR)}${toHex(darkG)}${toHex(darkB)}`;

  // Very light background tint (almost white with slight color)
  const bgR = Math.min(255, Math.round(240 + (r - 240) * 0.15));
  const bgG = Math.min(255, Math.round(240 + (g - 240) * 0.15));
  const bgB = Math.min(255, Math.round(240 + (b - 240) * 0.15));
  const bg = `#${toHex(bgR)}${toHex(bgG)}${toHex(bgB)}`;

  return { primary, light, dark, bg };
}

// Get accent color for a tournament
export function getTournamentAccent(tournamentName: string, category?: string): AccentColor {
  const nameLower = tournamentName.toLowerCase();
  const categoryLower = category?.toLowerCase() || '';

  // Check for exact matches first (skip 'default')
  for (const [key, accent] of Object.entries(tournamentTypeAccents)) {
    if (key === 'default') continue;
    if (nameLower.includes(key) || categoryLower.includes(key)) {
      return accent;
    }
  }

  // If no match, use default or generate from name hash
  // For now, generate from name to ensure uniqueness
  return generateAccentFromName(tournamentName);
}

// Get accent color for dark mode (slightly adjusted)
export function getTournamentAccentDark(accent: AccentColor): AccentColor {
  return {
    ...accent,
    bg: accent.primary + '15', // 15% opacity for dark mode
  };
}

