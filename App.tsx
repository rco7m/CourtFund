import React from 'react';
import { StatusBar, View } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
