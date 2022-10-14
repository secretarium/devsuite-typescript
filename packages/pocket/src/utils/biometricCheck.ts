import { /* getSupportedBiometryType, getSecurityLevel,*/ getInternetCredentials, setInternetCredentials, ACCESS_CONTROL, ACCESSIBLE, SECURITY_LEVEL, AUTHENTICATION_TYPE, SECURITY_RULES, STORAGE_TYPE } from 'react-native-keychain';

export const biometricCheck = async () => {
    try {
        const serverString = 'sfx.local.auth.v2';
        // const biometryType = await getSupportedBiometryType();
        // const securityLevel = await getSecurityLevel();

        const creds = await getInternetCredentials(serverString, {
            authenticationPrompt: {
                title: 'Secretarium Key',
                subtitle: 'Opening your key wallet',
                description: 'Secretarium Key uses biometrics to safeguard credential information',
                cancel: 'Cancel'
            }
        });

        console.log(creds);

        if (!creds)
            await setInternetCredentials(serverString, 'boo', 'hoo', {
                authenticationPrompt: 'We need this',
                accessible: ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
                accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
                authenticationType: AUTHENTICATION_TYPE.BIOMETRICS,
                securityLevel: SECURITY_LEVEL.SECURE_HARDWARE,
                storage: STORAGE_TYPE.RSA,
                rules: SECURITY_RULES.AUTOMATIC_UPGRADE
            });

        // alert(`Authenticated with ${biometryType}:${securityLevel}`);
    } catch (error) {
        alert(`An error as occured ${error}`);
    }
};