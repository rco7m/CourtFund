import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import Svg, { Line, Path, Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Eye, EyeOff, Mail, Lock, User, ChevronLeft } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

const GridBackground = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <Svg width={width} height={height}>
      {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((w, i) => (
        <Line key={`v-${i}`} x1={width * w} y1={0} x2={width * w} y2={height} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
      ))}
      <Line x1={width * 0.5} y1={0} x2={width * 0.5} y2={height} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((h, i) => (
        <Line key={`h-${i}`} x1={0} y1={height * h} x2={width} y2={height * h} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
      ))}
    </Svg>
  </View>
);

const ShuttlecockLogo = () => (
  <Svg width={36} height={48} viewBox="0 0 60 80">
    <Path
      d="M15 10 C 25 35 30 50 30 50 M45 10 C 35 35 30 50 30 50 M30 5 C 30 25 30 50 30 50 M5 20 C 20 40 30 50 30 50 M55 20 C 40 40 30 50 30 50"
      stroke="#D4AF37"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <Circle cx="30" cy="55" r="5" stroke="#D4AF37" strokeWidth="2" fill="none" />
  </Svg>
);

export const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Weak', color: '#E84C4C', width: '33%' };
    if (password.length < 10) return { label: 'Fair', color: '#F0A500', width: '66%' };
    return { label: 'Strong', color: '#208B59', width: '100%' };
  };
  const strength = passwordStrength();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <GridBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#0D2B4A" size={22} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <ShuttlecockLogo />
              <Text style={styles.logoText}>CourtFund</Text>
            </View>
            <Text style={styles.heading}>Join the club</Text>
            <Text style={styles.subheading}>Create your account to get started</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full name</Text>
              <View style={[styles.inputRow, nameFocused && styles.inputRowFocused]}>
                <User color={nameFocused ? '#208B59' : '#5B738B'} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor="#A0B3C4"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
                <Mail color={emailFocused ? '#208B59' : '#5B738B'} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#A0B3C4"
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
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, passwordFocused && styles.inputRowFocused]}>
                <Lock color={passwordFocused ? '#208B59' : '#5B738B'} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor="#A0B3C4"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showPassword ? <EyeOff color="#5B738B" size={18} /> : <Eye color="#5B738B" size={18} />}
                </TouchableOpacity>
              </View>
              {strength && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View style={[styles.strengthFill, { width: strength.width as any, backgroundColor: strength.color }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={[styles.inputRow, confirmFocused && styles.inputRowFocused]}>
                <Lock color={confirmFocused ? '#208B59' : '#5B738B'} size={18} />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat your password"
                  placeholderTextColor="#A0B3C4"
                  secureTextEntry={!showConfirm}
                  value={confirm}
                  onChangeText={setConfirm}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showConfirm ? <EyeOff color="#5B738B" size={18} /> : <Eye color="#5B738B" size={18} />}
                </TouchableOpacity>
              </View>
              {confirm.length > 0 && password !== confirm && (
                <Text style={styles.matchError}>Passwords do not match</Text>
              )}
            </View>

            {/* Create Account Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 8 }}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => navigation.navigate('MainTabs')}
              >
                <Text style={styles.primaryButtonText}>Create Account</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Login link */}
            <TouchableOpacity style={styles.loginRow} onPress={() => navigation.goBack()}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Text style={styles.loginLink}>Sign in</Text>
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
    backgroundColor: '#FAFAFA',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    gap: 4,
  },
  backText: {
    fontSize: 15,
    color: '#0D2B4A',
    fontWeight: '600',
  },
  header: {
    width: '100%',
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D2B4A',
    letterSpacing: 1,
    marginLeft: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0D2B4A',
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 15,
    color: '#5B738B',
    marginTop: 6,
    fontWeight: '400',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0D2B4A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D2B4A',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7FA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E8EDF2',
    gap: 10,
  },
  inputRowFocused: {
    borderColor: '#208B59',
    backgroundColor: '#F0FAF5',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0D2B4A',
    fontWeight: '400',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E8EDF2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 44,
  },
  matchError: {
    fontSize: 12,
    color: '#E84C4C',
    marginTop: 6,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#208B59',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#208B59',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginText: {
    fontSize: 14,
    color: '#5B738B',
  },
  loginLink: {
    fontSize: 14,
    color: '#208B59',
    fontWeight: '700',
  },
  privacyContainer: {
    marginTop: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 12,
    color: '#A0B3C4',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
  privacyLink: {
    color: '#208B59',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
