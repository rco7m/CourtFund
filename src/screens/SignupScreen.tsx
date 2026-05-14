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
import { Eye, EyeOff, Mail, Lock, User, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../providers/AuthProvider';

const { width, height } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.15)',
};

const DotGrid = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <Svg width={width} height={height}>
      {[0.15,0.3,0.45,0.6,0.75,0.9].map((w,i)=>(
        <Line key={`v${i}`} x1={width*w} y1={0} x2={width*w} y2={height} stroke="rgba(204,255,0,0.04)" strokeWidth="1"/>
      ))}
      {[0.15,0.3,0.45,0.6,0.75,0.9].map((h,i)=>(
        <Line key={`h${i}`} x1={0} y1={height*h} x2={width} y2={height*h} stroke="rgba(204,255,0,0.04)" strokeWidth="1"/>
      ))}
    </Svg>
  </View>
);

export const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(buttonScale,{toValue:0.96,useNativeDriver:true}).start();
  const handlePressOut = () => Animated.spring(buttonScale,{toValue:1,useNativeDriver:true}).start();

  const passwordStrength = () => {
    if(!password.length) return null;
    if(password.length<6) return {label:'Weak',color:'#F87171',width:'33%'};
    if(password.length<10) return {label:'Fair',color:C.accent,width:'66%'};
    return {label:'Strong',color:'#4ADE80',width:'100%'};
  };
  const strength = passwordStrength();

  const handleCreateAccount = async () => {
    setErrorText(null);
    if (!name.trim()) {
      setErrorText('Enter your name.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorText('Enter email and password.');
      return;
    }
    if (password !== confirm) {
      setErrorText('Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      await signUp(email.trim(), password, name.trim());
      navigation.navigate('MainTabs');
    } catch (e: any) {
      setErrorText(e?.message ?? 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <DotGrid/>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1,width:'100%'}}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.backButton} onPress={()=>navigation.goBack()}>
            <ChevronLeft color={C.accent} size={22}/>
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>

          <View style={s.header}>
            <View style={s.logoRow}>
              <Image source={require('../assets/logo.png')} style={s.logoImg} resizeMode="contain"/>
              <Text style={s.logoText}>CourtFund</Text>
            </View>
            <Text style={s.heading}>Join the club</Text>
            <Text style={s.subheading}>Create your account to get started</Text>
          </View>

          <View style={s.card}>
            {/* Full Name */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Full name</Text>
              <View style={[s.inputRow,nameFocused&&s.inputRowFocused]}>
                <User color={nameFocused?C.accent:C.neutral} size={17}/>
                <TextInput style={s.input} placeholder="Your full name" placeholderTextColor={C.neutral}
                  autoCapitalize="words" value={name} onChangeText={setName}
                  onFocus={()=>setNameFocused(true)} onBlur={()=>setNameFocused(false)}/>
              </View>
            </View>

            {/* Email */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Email address</Text>
              <View style={[s.inputRow,emailFocused&&s.inputRowFocused]}>
                <Mail color={emailFocused?C.accent:C.neutral} size={17}/>
                <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={C.neutral}
                  keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}
                  onFocus={()=>setEmailFocused(true)} onBlur={()=>setEmailFocused(false)}/>
              </View>
            </View>

            {/* Password */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Password</Text>
              <View style={[s.inputRow,passwordFocused&&s.inputRowFocused]}>
                <Lock color={passwordFocused?C.accent:C.neutral} size={17}/>
                <TextInput style={s.input} placeholder="Create a strong password" placeholderTextColor={C.neutral}
                  secureTextEntry={!showPassword} value={password} onChangeText={setPassword}
                  onFocus={()=>setPasswordFocused(true)} onBlur={()=>setPasswordFocused(false)}/>
                <TouchableOpacity onPress={()=>setShowPassword(!showPassword)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                  {showPassword?<EyeOff color={C.neutral} size={17}/>:<Eye color={C.neutral} size={17}/>}
                </TouchableOpacity>
              </View>
              {strength&&(
                <View style={s.strengthContainer}>
                  <View style={s.strengthBar}>
                    <View style={[s.strengthFill,{width:strength.width as any,backgroundColor:strength.color}]}/>
                  </View>
                  <Text style={[s.strengthLabel,{color:strength.color}]}>{strength.label}</Text>
                </View>
              )}
            </View>

            {/* Confirm */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>Confirm password</Text>
              <View style={[s.inputRow,confirmFocused&&s.inputRowFocused]}>
                <Lock color={confirmFocused?C.accent:C.neutral} size={17}/>
                <TextInput style={s.input} placeholder="Repeat your password" placeholderTextColor={C.neutral}
                  secureTextEntry={!showConfirm} value={confirm} onChangeText={setConfirm}
                  onFocus={()=>setConfirmFocused(true)} onBlur={()=>setConfirmFocused(false)}/>
                <TouchableOpacity onPress={()=>setShowConfirm(!showConfirm)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                  {showConfirm?<EyeOff color={C.neutral} size={17}/>:<Eye color={C.neutral} size={17}/>}
                </TouchableOpacity>
              </View>
              {confirm.length>0&&password!==confirm&&(
                <Text style={s.matchError}>Passwords do not match</Text>
              )}
            </View>

            <Animated.View style={{transform:[{scale:buttonScale}],marginTop:8}}>
              <TouchableOpacity style={s.primaryButton} activeOpacity={0.9}
                onPressIn={handlePressIn} onPressOut={handlePressOut}
                onPress={handleCreateAccount}
                disabled={loading}>
                <Text style={s.primaryButtonText}>{loading ? 'Creating…' : 'Create Account'}</Text>
              </TouchableOpacity>
            </Animated.View>

            {errorText ? <Text style={s.errorText}>{errorText}</Text> : null}

            <TouchableOpacity style={s.loginRow} onPress={()=>navigation.goBack()}>
              <Text style={s.loginText}>Already have an account? </Text>
              <Text style={s.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          <View style={s.privacyContainer}>
            <Text style={s.privacyText}>
              By continuing, you accept our{' '}
              <Text style={s.privacyLink}>Privacy Policy</Text>
              {' '}and{' '}
              <Text style={s.privacyLink}>Terms of Service</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  scroll:{flexGrow:1,paddingHorizontal:24,paddingTop:56,paddingBottom:32,alignItems:'center'},
  backButton:{flexDirection:'row',alignItems:'center',alignSelf:'flex-start',marginBottom:20,gap:4},
  backText:{fontSize:14,color:C.accent,fontWeight:'600'},
  header:{width:'100%',marginBottom:24},
  logoRow:{flexDirection:'row',alignItems:'center',marginBottom:24},
  logoImg:{width:36,height:36,borderRadius:8},
  logoText:{fontSize:20,fontWeight:'800',color:C.text,letterSpacing:1,marginLeft:10},
  heading:{fontSize:32,fontWeight:'800',color:C.text,letterSpacing:0.5},
  subheading:{fontSize:14,color:C.neutral,marginTop:6},
  card:{width:'100%',backgroundColor:C.card,borderRadius:24,padding:24,borderWidth:1,borderColor:C.border},
  fieldGroup:{marginBottom:16},
  label:{fontSize:12,fontWeight:'600',color:C.neutral,marginBottom:8,letterSpacing:0.5},
  inputRow:{flexDirection:'row',alignItems:'center',backgroundColor:C.bg,borderRadius:14,paddingHorizontal:14,paddingVertical:14,borderWidth:1.5,borderColor:C.border,gap:10},
  inputRowFocused:{borderColor:C.accent,backgroundColor:'rgba(204,255,0,0.03)'},
  input:{flex:1,fontSize:15,color:C.text},
  strengthContainer:{flexDirection:'row',alignItems:'center',marginTop:8,gap:10},
  strengthBar:{flex:1,height:4,backgroundColor:C.border,borderRadius:4,overflow:'hidden'},
  strengthFill:{height:'100%',borderRadius:4},
  strengthLabel:{fontSize:12,fontWeight:'600',minWidth:44},
  matchError:{fontSize:12,color:'#F87171',marginTop:6,fontWeight:'500'},
  primaryButton:{backgroundColor:C.accent,borderRadius:14,paddingVertical:17,alignItems:'center',shadowColor:C.accent,shadowOffset:{width:0,height:8},shadowOpacity:0.3,shadowRadius:16,elevation:5},
  primaryButtonText:{color:C.accentBg,fontSize:17,fontWeight:'800',letterSpacing:0.5},
  errorText:{marginTop:12,color:'#F87171',fontSize:13,fontWeight:'700',textAlign:'center'},
  loginRow:{flexDirection:'row',justifyContent:'center',marginTop:18},
  loginText:{fontSize:14,color:C.neutral},
  loginLink:{fontSize:14,color:C.accent,fontWeight:'700'},
  privacyContainer:{marginTop:24,paddingHorizontal:8,alignItems:'center'},
  privacyText:{fontSize:12,color:C.neutral,textAlign:'center',lineHeight:18},
  privacyLink:{color:C.accent,fontWeight:'600',textDecorationLine:'underline'},
});
