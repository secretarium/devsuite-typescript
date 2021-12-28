import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import type { Subscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendPushNotification /*, createPushNotifEncryptionKey, decryptPushNotification */ } from './services/notifications';

export const App = () => {

  const [expoToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: location.pathname !== '/chat',
      shouldPlaySound: false,
      shouldSetBadge: false
    })
  });

  useEffect(() => {
    // const encryptionKey = createPushNotifEncryptionKey();
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      // dispatch(registerNotificationToken(token, encryptionKey, i18n.locale));
    });

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

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
      <Button title='Send Notification' onPress={() => {
        if (expoToken)
          sendPushNotification("Coucou !", expoToken)
      }} />
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
