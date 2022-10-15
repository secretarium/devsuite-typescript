import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { Navigation } from '../../components';
import tw from 'twrnc';
import { BarCodeScanningResult, Camera, CameraType } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRecoilState } from 'recoil';
import { themeState, themeType } from '../../state';
import { useNavigate } from '../../router/Router';

const Scanner: React.FC = () => {

    // MOCK DATA FOR DUMMY QR CODE
    // {
    //     "primaryColor": "#131c27",
    //     "secondaryColor": "#49DE80",
    //     "tertiaryColor": "#FFFFFF",
    //     "statusBarColor": "light",
    //     "appName": "SoftMetal"
    // }

    const navigate = useNavigate();
    const [theme, setTheme] = useRecoilState(themeState);
    const [hasPermission, setHasPermission] = useState<boolean>();
    const [showModal, setShowModal] = useState(false);
    const [codeData, setCodeData] = useState<themeType>(theme);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = (code: BarCodeScanningResult) => {
        setShowModal(true);
        setCodeData(JSON.parse(String(code.data)));
    };

    const handleCancel = () => setShowModal(false);

    const handleProceed = () => {
        setTheme({
            primaryColor: codeData.primaryColor,
            secondaryColor: codeData.secondaryColor,
            tertiaryColor: codeData.tertiaryColor,
            statusBarColor: codeData.statusBarColor,
            appName: codeData.appName
        });
        setShowModal(false);
        navigate('/');
    };

    return (
        <Navigation showBottomNav={false} showTopNav={true} goBackRoute="..">
            <Modal visible={showModal} animationType="slide" transparent={true}>
                <View style={tw`flex-1 justify-center items-center mt-12`}>
                    <View style={tw`bg-[${theme.secondaryColor}] rounded-3xl items-center shadow-2xl m-8 p-8 w-4/5`}>
                        <Text style={[tw`text-2xl pb-4`, { fontFamily: 'MuktaMaheeBold' }]}>
                            Scan successful!
                        </Text>
                        <Text style={[tw`text-black`, { fontFamily: 'MuktaMaheeRegular' }]}>
                            You are about to login with {codeData.appName}. Do you want to proceed?
                        </Text>
                        <View style={tw`flex flex-row justify-between w-full pt-4`}>
                            <Pressable onPress={handleCancel} style={tw`bg-[${theme.primaryColor}] rounded-full p-3`}>
                                <Text style={[tw`text-center text-[${theme.secondaryColor}] text-xl`, { fontFamily: 'MuktaMaheeBold' }]}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable onPress={handleProceed} style={tw`bg-[${theme.primaryColor}] rounded-full p-3`}>
                                <Text style={[tw`text-center text-[${theme.secondaryColor}] text-xl`, { fontFamily: 'MuktaMaheeBold' }]}>
                                    Proceed
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            {hasPermission
                ? <View style={tw`flex-1 px-4 py-24`}>
                    <Camera
                        style={tw`flex-1`}
                        barCodeScannerSettings={{ barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr] }}
                        onBarCodeScanned={handleBarCodeScanned}
                        type={CameraType.back}
                    />
                </View>
                : <Text>No permission</Text>}
        </Navigation>
    );
};

export default Scanner;