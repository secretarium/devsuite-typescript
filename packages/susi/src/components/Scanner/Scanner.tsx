import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Container from '../Container';
import tw from 'twrnc';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';

const Scanner: React.FC = () => {

    const [hasPermission, setHasPermission] = useState<boolean>();

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    return (
        <Container>
            {hasPermission
                ? <View style={tw`flex-1 px-4`}>
                    <Camera
                        style={tw`flex-1 my-24`}
                        barCodeScannerSettings={{ barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr] }}
                        type={'back'}
                    />
                </View>
                : <Text>No permission</Text>}
        </Container>
    );
};

export default Scanner;