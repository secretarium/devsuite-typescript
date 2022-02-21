import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Container from '../Container';
import Accounts from '../Accounts';
import Scanner from '../Scanner';
import Home from '../Home';

const Tab = createBottomTabNavigator();

const Root: React.FC = () => {
    return (
        <Container>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        if (route.name === 'Accounts') {
                            return <Ionicons name={focused ? 'key-sharp' : 'key-outline'} size={size} color={color} />;
                        } else if (route.name === 'Scanner') {
                            return <Ionicons name={focused ? 'scan-sharp' : 'scan-outline'} size={size} color={color} />;
                        } else if (route.name === 'Home') {
                            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
                        }
                    },
                    tabBarActiveTintColor: '#E6224F',
                    tabBarInactiveTintColor: 'black',
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 0,
                        left: 15,
                        right: 15,
                        elevation: 0,
                        backgroundColor: '#ffffff',
                        borderRadius: 20,
                        height: 80
                    }
                })}>
                <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
                <Tab.Screen name="Accounts" component={Accounts} options={{ headerShown: false }} />
                <Tab.Screen name="Scanner" component={Scanner} options={{ headerShown: false }} />
            </Tab.Navigator>
        </Container>
    );
};

export default Root;