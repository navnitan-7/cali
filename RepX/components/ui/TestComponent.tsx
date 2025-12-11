import React from 'react';
import { View, Text } from 'react-native';
import { getFontFamily } from '../../utils/fonts';

export default function TestComponent() {
  return (
    <View className="bg-blue-500 p-4 rounded-lg m-4">
      <Text style={{
        color: 'white',
        fontFamily: getFontFamily('bold'),
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        NativeWind Test - If you see this with blue background, NativeWind is working!
      </Text>
    </View>
  );
} 