import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Button } from 'react-native';
import type { Subscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import tw from 'twrnc';
import { CachePolicies, useQuery } from '@secretarium/react';
import { registerForPushNotificationsAsync, sendPushNotification /*, createPushNotifEncryptionKey, decryptPushNotification */ } from './services/notifications';

export const App = () => {

    const [expoToken, setExpoPushToken] = useState<string>();
    const [, setNotification] = useState<Notifications.Notification>();
    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    const [data, loading /*, error*/] = useQuery<string, string>({
        app: 'sfx',
        route: 'version'
    }, {
        cachePolicy: CachePolicies.CACHE_AND_NETWORK
    }, []);

    const randomWidth = useSharedValue(10);

    const config = {
        duration: 500,
        easing: Easing.bezier(0.5, 0.01, 0, 1).factory()
    };

    const style = useAnimatedStyle(() => {
        return {
            width: withTiming(randomWidth.value, config)
        };
    });

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false
        })
    });

    useEffect(() => {
        // const encryptionKey = createPushNotifEncryptionKey();
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
            // dispatch(registerNotificationToken(token, encryptionKey, i18n.locale));
        }).catch(console.error);

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('TUTU', response.notification.request.content);
            // const encryptedMessage = response.notification.request.content.data.encrypted;
            // decryptPushNotification(encryptionKey, encryptedMessage as string)
            //   .then((decryptedMessage) => setNotificationMessage(decryptedMessage));
        });
    }, []);

    return <View style={tw`flex justify-center h-full p-4 android:pt-2 bg-white dark:bg-black`}>
        <Text>Welcome to {loading ? 'loading' : data}!</Text>
        <Text>Open up App.tsx to start working on your app,</Text>
        <Text>{process.env.NX_SENTRY_DSN}</Text>
        <Text>{process.env.NX_SECRETARIUM_GATEWAYS}</Text>
        <StatusBar style="auto" />
        <Animated.View
            style={[{ width: 100, height: 80, backgroundColor: 'black', margin: 30 }, style]}
        />
        <Button title='Send Notification' onPress={() => {
            console.log('Allo', expoToken);
            randomWidth.value = Math.random() * 350;
            if (expoToken)
                sendPushNotification('Coucou !', expoToken);
        }} />
    </View>;
};

export default App;
