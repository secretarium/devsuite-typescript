import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Navigation } from '../../components';
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
        <Navigation showBottomNav={false} showTopNav={true} goBackRoute="..">
            {hasPermission
                ? <View style={tw`flex-1 px-4 py-24`}>
                    <Camera
                        style={tw`flex-1`}
                        barCodeScannerSettings={{ barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr] }}
                        type={'back'}
                    />
                </View>
                : <Text>No permission</Text>}
        </Navigation>
    );
};

export default Scanner;