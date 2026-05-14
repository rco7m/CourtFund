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
import { Mail, ChevronLeft, SendHorizonal } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

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
    if (!email.trim()) return;
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
            <Text style={styles.backText}>Back to sign in</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <ShuttlecockLogo />
              <Text style={styles.logoText}>CourtFund</Text>
            </View>
            <Text style={styles.heading}>Reset password</Text>
            <Text style={styles.subheading}>
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {!sent ? (
              <>
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

                {/* Send Button */}
                <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.primaryButton, !email && styles.primaryButtonDisabled]}
                    activeOpacity={0.9}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handleSend}
                    disabled={!email || loading}
                  >
                    <SendHorizonal color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>{loading ? 'Sending…' : 'Send Reset Link'}</Text>
                  </TouchableOpacity>
                </Animated.View>

                {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
              </>
            ) : (
              /* Success State */
              <Animated.View style={[styles.successContainer, { transform: [{ scale: successScale }] }]}>
                <View style={styles.successIcon}>
                  <Mail color="#208B59" size={32} />
                </View>
                <Text style={styles.successTitle}>Check your inbox</Text>
                <Text style={styles.successBody}>
                  We've sent a password reset link to{'\n'}
                  <Text style={styles.successEmail}>{email}</Text>
                </Text>
                <View style={styles.successHint}>
                  <Text style={styles.successHintText}>
                    Didn't receive it? Check your spam folder or{' '}
                  </Text>
                  <TouchableOpacity onPress={() => setSent(false)}>
                    <Text style={styles.resendLink}>try again</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* Back to login link */}
            <TouchableOpacity style={styles.loginRow} onPress={() => navigation.goBack()}>
              <Text style={styles.loginText}>Remember your password? </Text>
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
    marginTop: 8,
    fontWeight: '400',
    lineHeight: 22,
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
    marginBottom: 18,
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
  primaryButton: {
    backgroundColor: '#208B59',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#208B59',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  primaryButtonDisabled: {
    backgroundColor: '#A0CDB7',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorText: {
    marginTop: 12,
    color: '#DC2626',
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
    backgroundColor: '#E8F7EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0D2B4A',
    marginBottom: 12,
  },
  successBody: {
    fontSize: 15,
    color: '#5B738B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  successEmail: {
    color: '#0D2B4A',
    fontWeight: '700',
  },
  successHint: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successHintText: {
    fontSize: 13,
    color: '#A0B3C4',
  },
  resendLink: {
    fontSize: 13,
    color: '#208B59',
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
