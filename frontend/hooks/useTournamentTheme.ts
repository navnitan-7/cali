import { useMemo } from 'react';
import { useTheme } from '../stores/themeStore';
import { useColors } from '../utils/colors';
import { getTournamentAccent, getTournamentAccentDark } from '../utils/tournamentAccent';
import { Tournament } from '../stores/tournamentStore';

/**
 * Centralized theme hook for tournament-based accent colors
 * Returns primary blue (global) + tournament accent (contextual)
 */
export function useTournamentTheme(tournament?: Tournament | null) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);

  // Primary blue - always used for main actions
  const primaryBlue = colors['bg-primary'];

  // Tournament accent color (if inside a tournament)
  const accent = useMemo(() => {
    if (!tournament) return null;
    const baseAccent = getTournamentAccent(tournament.name, tournament.description);
    return isDark ? getTournamentAccentDark(baseAccent) : baseAccent;
  }, [tournament, isDark]);

  return {
    // Global primary blue (always available)
    primary: primaryBlue,
    
    // Tournament accent (null if outside tournament)
    accent: accent?.primary || null,
    accentLight: accent?.light || null,
    accentDark: accent?.dark || null,
    accentBg: accent?.bg || null,
    
    // Full accent object
    accentFull: accent,
    
    // Theme utilities
    isDark,
    colors,
    
    // Helper: Get color for UI element
    // Priority: accent (if available) > primary blue
    getAccentColor: (fallbackToPrimary = false) => {
      return accent?.primary || (fallbackToPrimary ? primaryBlue : null);
    },
    
    // Helper: Get opacity variant
    getAccentWithOpacity: (opacity: number) => {
      const accentColor = accent?.primary || primaryBlue;
      // Convert opacity (0-1) to hex
      const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
      return accentColor + hexOpacity;
    },
  };
}

