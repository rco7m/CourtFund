import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { BottomTabNavigator } from './BottomTabNavigator';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const CourtTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#165281',
    text: '#f3ead7',
    primary: '#b7ff00',
    card: '#165281',
  },
};

export const RootNavigator = () => {
  return (
    <NavigationContainer theme={CourtTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
