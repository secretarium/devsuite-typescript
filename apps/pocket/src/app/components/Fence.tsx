import React, { useState, useEffect, useMemo, PropsWithChildren } from 'react';
import { StyleSheet, View, ActivityIndicator, Button, Text } from 'react-native';
import { ReactNativeBiometricsLegacy, BiometryType } from 'react-native-biometrics';

const SECRET_RAW = 'Austin2021';

export const Fence: React.FC<PropsWithChildren> = ({ children }) => {

    // const [biometryType, setBiometryType] = useState<BiometryType | null>();
    const [biometryType, setBiometryType] = useState<BiometryType | null>();
    const [hasCheckedKey, setHasCheckedKey] = useState(false);
    const [hasKey, setHasKey] = useState(false);
    // const [authenticated, setAuthenticated] = useState(false);
    const [authenticated, setAuthenticated] = useState(true);
    const [failed, setFailed] = useState(false);
    const [payload] = useState(SECRET_RAW);

    const makeSignature = useMemo(() => () => {
        setFailed(false);
        setAuthenticated(false);
        ReactNativeBiometricsLegacy.createSignature({
            promptMessage: 'Loging in',
            payload: payload
        })
            .then((resultObject) => {
                const { success } = resultObject;
                if (success)
                    setAuthenticated(true);
                else
                    setFailed(true);
            })
            .catch((error) => console.log(error));
    }, [payload]);

    useEffect(() => {
        if (biometryType === undefined)
            ReactNativeBiometricsLegacy.isSensorAvailable()
                .then((resultObject) => {
                    const { available, biometryType } = resultObject;
                    setBiometryType(available ? biometryType : null);
                })
                .catch((error) => console.log(error));
    }, [biometryType]);


    useEffect(() => {
        if (biometryType && !hasCheckedKey) {
            ReactNativeBiometricsLegacy.biometricKeysExist()
                .then((resultObject) => {
                    const { keysExist } = resultObject;
                    setHasKey(keysExist);
                    setHasCheckedKey(true);
                })
                .catch((error) => console.log(error));
        }
    }, [biometryType, hasCheckedKey]);

    useEffect(() => {
        if (biometryType && hasCheckedKey && !hasKey)
            ReactNativeBiometricsLegacy.createKeys()
                .then(() => setHasKey(true))
                .catch((error) => console.log(error));
    }, [biometryType, hasCheckedKey, hasKey]);

    useEffect(() => {
        if (hasKey)
            makeSignature();
    }, [hasKey, makeSignature]);

    if (biometryType === null || authenticated)
        return children as React.ReactElement;

    if (!hasCheckedKey)
        return <View style={styles.container}>
            <Text style={styles.loadingStatus}>Loading...</Text>
            <ActivityIndicator size="large" color={'#747DE3'} />
        </View>;

    if (failed)
        return <View style={styles.container}>
            <Text style={styles.loadingStatus}>Failed to log in</Text>
            <Button title={'Retry'} onPress={makeSignature} />
        </View>;

    if (hasCheckedKey && hasKey && !authenticated)
        return <View style={styles.container}>
            <Text style={styles.loadingStatus}>Loging in...</Text>
            <ActivityIndicator size="large" color={'#747DE3'} />
        </View>;

    return <View style={styles.container} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000000'
    },
    loadingStatus: {
        color: '#000000',
        paddingBottom: 10
    }
});
