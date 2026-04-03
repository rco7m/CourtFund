import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Line, Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const GridBackground = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <Svg width={width} height={height}>
      {/* Vertical Lines */}
      {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((w, i) => (
        <Line key={`v-${i}`} x1={width * w} y1={0} x2={width * w} y2={height} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
      ))}
      <Line x1={width * 0.5} y1={0} x2={width * 0.5} y2={height} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
      {/* Horizontal Lines */}
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((h, i) => (
        <Line key={`h-${i}`} x1={0} y1={height * h} x2={width} y2={height * h} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
      ))}
    </Svg>
  </View>
);

const ShuttlecockLogo = () => (
  <Svg width={60} height={80} viewBox="0 0 60 80">
    <Path d="M15 10 C 25 35 30 50 30 50 M45 10 C 35 35 30 50 30 50 M30 5 C 30 25 30 50 30 50 M5 20 C 20 40 30 50 30 50 M55 20 C 40 40 30 50 30 50" stroke="#D4AF37" strokeWidth="2" fill="none" strokeLinecap="round" />
    <Circle cx="30" cy="55" r="5" stroke="#D4AF37" strokeWidth="2" fill="none" />
  </Svg>
);

export const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <GridBackground />

      <View style={styles.content}>
        <ShuttlecockLogo />
        
        <Text style={styles.title}>CourtFund</Text>
        <Text style={styles.subtitle}>Financial Intelligence for Badminton</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Enter the Club</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>MADE FOR BADMINTON CLUBS</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1, // To be above the grid
    width: '100%',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0D2B4A', // Dark Navy
    marginTop: 24,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#5B738B',
    marginTop: 12,
    marginBottom: 48,
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#208B59', // Green from the image
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20, // Rounded, but seemingly slightly rectangular in image? Let's use 16
    width: '100%',
    alignItems: 'center',
    shadowColor: '#208B59',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footerText: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    letterSpacing: 1.5,
    color: '#5B738B',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});
