import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Settings from './components/Settings';
import Root from './components/Root';

const Stack = createNativeStackNavigator();

export const App: React.FC = () => {

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Root">
                    <Stack.Screen name="Root" component={Root} options={{ headerShown: false }} />
                    <Stack.Screen name="Settings" component={Settings} options={{
                        headerStyle: {
                            backgroundColor: '#E6224F'
                        },
                        headerTintColor: '#fff'
                    }} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
};

export default App;
