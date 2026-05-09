import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, StatusBar } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
};

const GridBackground = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <Svg width={width} height={height}>
      {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((w, i) => (
        <Line key={`v-${i}`} x1={width * w} y1={0} x2={width * w} y2={height} stroke="rgba(204,255,0,0.03)" strokeWidth="1" />
      ))}
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((h, i) => (
        <Line key={`h-${i}`} x1={0} y1={height * h} x2={width} y2={height * h} stroke="rgba(204,255,0,0.03)" strokeWidth="1" />
      ))}
    </Svg>
  </View>
);

export const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <GridBackground />

      <View style={styles.content}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        
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

      <Text style={styles.footerText}>MADE FOR BADMINTON</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1, 
    width: '100%',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: C.text, 
    marginTop: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: C.neutral,
    marginTop: 12,
    marginBottom: 48,
    fontWeight: '400',
    textAlign: 'center',
  },
  button: {
    backgroundColor: C.accent, 
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30, 
    width: '100%',
    alignItems: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    color: C.accentBg,
    fontSize: 18,
    fontWeight: '800',
  },
  footerText: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    letterSpacing: 1.5,
    color: 'rgba(148,163,184,0.4)',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});
