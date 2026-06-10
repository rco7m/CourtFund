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
  Image,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Mail, ChevronLeft, SendHorizonal } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const C = {
  bg: '#0A0F1E',
  card: '#1E293B',
  accent: '#CCFF00',
  accentBg: '#0A0F1E',
  neutral: '#94A3B8',
  text: '#E2E8F0',
  border: 'rgba(148,163,184,0.15)',
};

const DotGrid = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <Svg width={width} height={height}>
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((w, i) => (
        <Line
          key={`v-${i}`}
          x1={width * w}
          y1={0}
          x2={width * w}
          y2={height}
          stroke="rgba(204,255,0,0.04)"
          strokeWidth="1"
        />
      ))}
      {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((h, i) => (
        <Line
          key={`h-${i}`}
          x1={0}
          y1={height * h}
          x2={width}
          y2={height * h}
          stroke="rgba(204,255,0,0.04)"
          strokeWidth="1"
        />
      ))}
    </Svg>
  </View>
);

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleSend = async () => {
    setErrorText(null);
    if (!email.trim()) {
      setErrorText('Enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setSent(true);
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <DotGrid />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color={C.accent} size={22} />
            <Text style={styles.backText}>Back to sign in</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image source={require('../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
              <Text style={styles.logoText}>SportFund</Text>
            </View>
            <Text style={styles.heading}>Reset password</Text>
            <Text style={styles.subheading}>
              Enter your email and we&apos;ll send you a link to reset your password.
            </Text>
          </View>

          <View style={styles.card}>
            {!sent ? (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Email address</Text>
                  <View style={[styles.inputRow, emailFocused && styles.inputRowFocused]}>
                    <Mail color={emailFocused ? C.accent : C.neutral} size={18} />
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor={C.neutral}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </View>
                </View>

                <Animated.View style={[styles.buttonWrap, { transform: [{ scale: buttonScale }] }]}>
                  <TouchableOpacity
                    style={[styles.primaryButton, (!email || loading) && styles.primaryButtonDisabled]}
                    activeOpacity={0.9}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handleSend}
                    disabled={!email || loading}
                  >
                    <SendHorizonal color={C.accentBg} size={18} style={styles.sendIcon} />
                    <Text style={styles.primaryButtonText}>{loading ? 'Sending…' : 'Send Reset Link'}</Text>
                  </TouchableOpacity>
                </Animated.View>

                {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
              </>
            ) : (
              <Animated.View style={[styles.successContainer, { transform: [{ scale: successScale }] }]}>
                <View style={styles.successIcon}>
                  <Mail color={C.accent} size={32} />
                </View>
                <Text style={styles.successTitle}>Check your inbox</Text>
                <Text style={styles.successBody}>
                  We&apos;ve sent a password reset link to{'\n'}
                  <Text style={styles.successEmail}>{email}</Text>
                </Text>
                <View style={styles.successHint}>
                  <Text style={styles.successHintText}>Didn&apos;t receive it? Check your spam folder or </Text>
                  <TouchableOpacity onPress={() => setSent(false)}>
                    <Text style={styles.resendLink}>try again</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            <TouchableOpacity style={styles.loginRow} onPress={() => navigation.goBack()}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

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
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    gap: 4,
  },
  backText: {
    fontSize: 14,
    color: C.accent,
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
  logoImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 1,
    marginLeft: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 14,
    color: C.neutral,
    marginTop: 6,
    fontWeight: '400',
    lineHeight: 22,
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
  sendIcon: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(204,255,0,0.45)',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: C.accentBg,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  errorText: {
    marginTop: 12,
    color: '#F87171',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(204,255,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  successBody: {
    fontSize: 14,
    color: C.neutral,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  successEmail: {
    color: C.text,
    fontWeight: '700',
  },
  successHint: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  successHintText: {
    color: C.neutral,
    fontSize: 13,
  },
  resendLink: {
    color: C.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginText: {
    fontSize: 14,
    color: C.neutral,
  },
  loginLink: {
    fontSize: 14,
    color: C.accent,
    fontWeight: '700',
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
