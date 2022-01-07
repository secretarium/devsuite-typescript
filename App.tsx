import { StrictMode, useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Button } from 'react-native';
import type { Subscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import tw from 'twrnc';
import { registerForPushNotificationsAsync, sendPushNotification /*, createPushNotifEncryptionKey, decryptPushNotification */ } from './services/notifications';

export const App = () => {

  const [expoToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

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
      console.log('TUTU', response.notification.request.content)
      // const encryptedMessage = response.notification.request.content.data.encrypted;
      // decryptPushNotification(encryptionKey, encryptedMessage as string)
      //   .then((decryptedMessage) => setNotificationMessage(decryptedMessage));
    });
  }, []);

  return <StrictMode>
    <View style={tw`flex justify-center align-center h-full p-4 android:pt-2 bg-white dark:bg-black`}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
      <Button title='Send Notification' onPress={() => {
        console.log('Allo', expoToken);
        if (expoToken)
          sendPushNotification("Coucou !", expoToken)
      }} />
    </View>
  </StrictMode>
}

export default App;
