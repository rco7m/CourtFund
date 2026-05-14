import React from 'react';
import { StatusBar, View } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/providers/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
          <RootNavigator />
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
