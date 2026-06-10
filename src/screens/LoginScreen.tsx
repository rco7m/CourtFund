import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, KeyboardAvoidingView, Platform, ScrollView,
  Animated, StatusBar, Image,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../providers/AuthProvider';

const { width, height } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const C = {
  bg: '#0A0F1E',
  card: '#1E293B',
  accent: '#CCFF00',
  accentBg: '#0A0F1E',
  neutral: '#94A3B8',
  text: '#E2E8F0',
  border: 'rgba(148,163,184,0.15)',
};

const GridBackground = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <Svg width={width} height={height}>
      {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((w, i) => (
        <Line key={`v-${i}`} x1={width * w} y1={0} x2={width * w} y2={height} stroke="rgba(204,255,0,0.04)" strokeWidth="1" />
      ))}
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((h, i) => (
        <Line key={`h-${i}`} x1={0} y1={height * h} x2={width} y2={height * h} stroke="rgba(204,255,0,0.04)" strokeWidth="1" />
      ))}
    </Svg>
  </View>
);


export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleLogin = async () => {
    setErrorText(null);
    if (!email.trim() || !password) {
      setErrorText('Enter email and password.');
      return;
    }
    try {
      setLoading(true);
      await signIn(email.trim(), password);
      navigation.navigate('MainTabs');
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      if (msg.toLowerCase().includes('unable to resolve data for blob')) {
        setErrorText('Network error. Please try again.');
      } else {
        setErrorText(msg || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
  <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <GridBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image source={require('../assets/logo.png')} style={styles.logoImg} resizeMode="contain"/>
              <Text style={styles.logoText}>SportFund</Text>
            </View>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>Sign in to your club account</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
                <Mail color={emailFocused ? '#b7ff00' : 'rgba(243,234,215,0.7)'} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(243,234,215,0.5)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputRow, passwordFocused && styles.inputRowFocused]}>
                <Lock color={passwordFocused ? '#b7ff00' : 'rgba(243,234,215,0.7)'} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(243,234,215,0.5)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showPassword
                    ? <EyeOff color="rgba(243,234,215,0.7)" size={18} />
                    : <Eye color="rgba(243,234,215,0.7)" size={18} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

            {/* Sign In Button */}
            <Animated.View style={[styles.buttonWrap, { transform: [{ scale: buttonScale }] }]}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up CTA */}
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.secondaryButtonText}>Create an account</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Footer */}
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>
              By continuing, you accept our{' '}
              <Text style={styles.privacyLink}>Privacy Policy</Text>
              {' '}and{' '}
              <Text style={styles.privacyLink}>Terms of Service</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
    width: '100%',
  },
  header: {
    width: '100%',
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 1,
    marginLeft: 10,
  },
  logoImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 15,
    color: C.neutral,
    marginTop: 6,
    fontWeight: '400',
  },
  card: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 13,
    color: '#b7ff00',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 10,
  },
  inputRowFocused: {
    borderColor: C.accent,
    backgroundColor: 'rgba(204,255,0,0.03)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    fontWeight: '400',
  },
  buttonWrap: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  primaryButtonText: {
    color: C.accentBg,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
    marginTop: -6,
    marginBottom: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontSize: 13,
    color: C.neutral,
    fontWeight: '500',
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  secondaryButtonText: {
    color: C.text,
    fontSize: 16,
    fontWeight: '600',
  },
  privacyContainer: {
    marginTop: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 12,
    color: C.neutral,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
  privacyLink: {
    color: C.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
