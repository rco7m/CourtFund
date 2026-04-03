import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { BookScreen } from '../screens/BookScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { GearScreen } from '../screens/GearScreen';
import { SplitCostScreen } from '../screens/SplitCostScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { SessionLogScreen } from '../screens/SessionLogScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { View, StyleSheet } from 'react-native';
import { Home, Calendar as CalendarIcon, Wallet, Clock, Package } from 'lucide-react-native';
import { AIAssistant } from '../components/AIAssistant';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="SplitCost" component={SplitCostScreen} />
    <Stack.Screen name="Friends" component={FriendsScreen} />
    <Stack.Screen name="SessionLog" component={SessionLogScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const BookStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BookMain" component={BookScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const WalletStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WalletMain" component={WalletScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const ScheduleStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScheduleMain" component={ScheduleScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const GearStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GearMain" component={GearScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

export const BottomTabNavigator = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0A1A2F',
            borderTopWidth: 0,
            elevation: 0,
            height: 90,
            paddingTop: 10,
            paddingBottom: 30,
          },
          tabBarActiveTintColor: '#DEA54B',
          tabBarInactiveTintColor: '#5B738B',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStack} 
          options={{
            tabBarIcon: ({ color }) => <Home color={color} size={24} />
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Home', { screen: 'HomeMain' });
            },
          })}
        />
        <Tab.Screen 
          name="Book" 
          component={BookStack} 
          options={{
            tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} />
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Book', { screen: 'BookMain' });
            },
          })}
        />
        <Tab.Screen 
          name="Wallet" 
          component={WalletStack} 
          options={{
            tabBarIcon: ({ color }) => <Wallet color={color} size={24} />
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Wallet', { screen: 'WalletMain' });
            },
          })}
        />
        <Tab.Screen 
          name="Schedule" 
          component={ScheduleStack} 
          options={{
            tabBarIcon: ({ color }) => <Clock color={color} size={24} />
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Schedule', { screen: 'ScheduleMain' });
            },
          })}
        />
        <Tab.Screen 
          name="Gear" 
          component={GearStack} 
          options={{
            tabBarIcon: ({ color }) => <Package color={color} size={24} />
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Gear', { screen: 'GearMain' });
            },
          })}
        />
      </Tab.Navigator>
      <AIAssistant />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

