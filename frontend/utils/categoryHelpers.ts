// Category-based gradient colors
export const getCategoryGradient = (category: string, isDark: boolean) => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('endurance') || categoryLower.includes('running')) {
    return isDark
      ? ['rgba(0, 200, 255, 0.4)', 'rgba(0, 150, 200, 0.2)', 'rgba(0, 0, 0, 0.8)']
      : ['rgba(0, 150, 255, 0.3)', 'rgba(0, 100, 200, 0.2)', 'rgba(0, 0, 0, 0.7)'];
  }
  
  if (categoryLower.includes('strength') || categoryLower.includes('weight')) {
    return isDark
      ? ['rgba(255, 100, 0, 0.4)', 'rgba(200, 80, 0, 0.2)', 'rgba(0, 0, 0, 0.8)']
      : ['rgba(255, 120, 0, 0.3)', 'rgba(220, 100, 0, 0.2)', 'rgba(0, 0, 0, 0.7)'];
  }
  
  if (categoryLower.includes('street') || categoryLower.includes('calisthenics') || categoryLower.includes('workout')) {
    return isDark
      ? ['rgba(0, 255, 150, 0.4)', 'rgba(0, 200, 120, 0.2)', 'rgba(0, 0, 0, 0.8)']
      : ['rgba(0, 220, 140, 0.3)', 'rgba(0, 180, 110, 0.2)', 'rgba(0, 0, 0, 0.7)'];
  }
  
  // Default/Custom category
  return isDark
    ? ['rgba(150, 100, 255, 0.4)', 'rgba(120, 80, 220, 0.2)', 'rgba(0, 0, 0, 0.8)']
    : ['rgba(150, 120, 255, 0.3)', 'rgba(130, 100, 220, 0.2)', 'rgba(0, 0, 0, 0.7)'];
};

// Category tag glow colors
export const getCategoryGlow = (category: string) => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('endurance') || categoryLower.includes('running')) {
    return 'rgba(0, 200, 255, 0.6)';
  }
  
  if (categoryLower.includes('strength') || categoryLower.includes('weight')) {
    return 'rgba(255, 100, 0, 0.6)';
  }
  
  if (categoryLower.includes('street') || categoryLower.includes('calisthenics') || categoryLower.includes('workout')) {
    return 'rgba(0, 255, 150, 0.6)';
  }
  
  return 'rgba(150, 100, 255, 0.6)';
};

