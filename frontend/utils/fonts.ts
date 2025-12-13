type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export const getFontFamily = (weight: FontWeight = 'regular'): string => {
  const fontMap: Record<FontWeight, string> = {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  };

  return fontMap[weight];
};

