import * as LocalAuthentication from 'expo-local-authentication';

export const biometricCheck = async () => {
    try {
        // Check if device is compatible
        const isCompatible = await LocalAuthentication.hasHardwareAsync();

        if (!isCompatible)
            alert('Sorry! Your device is not compatible.');

        // Check if device has biometric records
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!isEnrolled)
            alert('No biometric records found.');

        // Authenticate user
        await LocalAuthentication.authenticateAsync();
        alert('Authenticated');
    } catch (error) {
        alert(`An error as occured ${error}`);
    }
};