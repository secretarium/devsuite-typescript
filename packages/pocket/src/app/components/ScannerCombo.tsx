import React, { useState, useEffect, FC } from 'react';
import { Text, StyleSheet, Button, View } from 'react-native';
import { BarCodeScanner, BarCodeScannedCallback } from 'expo-barcode-scanner';
import useWebSocket, { ReadyState } from 'react-native-use-websocket';
import { useNavigate } from 'react-router-native';
import * as SecureStore from 'expo-secure-store';
// import { WebSocket } from '@d-fischer/isomorphic-ws';

async function getUniqueIdKey(): Promise<string | null> {
    return await SecureStore.getItemAsync('v0.alpha.uniqueId');
}

export const ScannerCombo: FC = () => {

    const sock: WebSocket | null = null;
    const navigate = useNavigate();
    const [hasPermission, setHasPermission] = useState<boolean>();
    const [scanned, setScanned] = useState(false);
    const [socketUrl, setSocketUrl] = useState<string | null>(null);
    const [hasLoadedId, setHasLoadedId] = useState(false);
    const [uniqueId, setUniqueId] = useState<string | null>(null);

    const { sendMessage, readyState } = useWebSocket(socketUrl, {
        reconnectAttempts: 50,
        reconnectInterval: 3000,
        shouldReconnect: () => true
    }, true);

    const isConnected = readyState === ReadyState.OPEN;

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    useEffect(() => {
        if (hasLoadedId)
            return;
        setHasLoadedId(true);
        (async () => {
            const uId = await getUniqueIdKey();
            setUniqueId(uId);
        })();
    }, [hasLoadedId]);

    const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
        setScanned(true);
        try {
            const [flag, address, uuidBeacon, uuidLocator] = data.split('#');
            if (flag === 'cryptx_check') {
                // alert('cryptx_check');
                // alert('asde');
                // const ByPassW = WebSocket as any;
                // const ws = new ByPassW(socketUrl, null, {
                //     headers: {
                //         'Accept-Encoding': 'gzip, deflate, br',
                //         'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8',
                //         'Cache-Control': 'no-cache',
                //         'Pragma': 'no-cache',
                //         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
                //     }
                // });
                // ws.onerror = (e: any) => {
                //     alert((e as WebSocketErrorEvent).message); // send a message
                // };
                // ws.onopen = () => {
                //     // connection opened
                //     ws.send('something');  // send a message
                // };
                // const ByPassW = WebSocket as any;
                // sock = new ByPassW(socketUrl, null, {
                //     headers: {
                //         'Accept-Language': 'en,en-US;q=0.9,ru;q=0.8,de;q=0.7',
                //         'Cache-Control': 'no-cache',
                //         'Pragma': 'no-cache',
                //         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
                //     }
                // }) as WebSocket;
                // sock.onerror?.(((event: any) => { alert(event.message); }) as any);
                // sock = new WebSocket(socketUrl);
                // sock?.onopen(() =>{
                //     sock?.send(`confirm:${uuidBeacon}:${uuidLocator}:my_demo_pass_signature`);
                // })
                // setTimeout(() => {
                //     // if (!isConnected)
                //     //     return;
                //     console.log('FALL OFF', sock?.readyState);

                setSocketUrl(address);
                setTimeout(() => {
                    sendMessage(`confirm#${uuidBeacon}#${uuidLocator}#${uniqueId}`);
                    navigate('/');
                }, 500);
                // }, 500);
                // });
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (hasPermission === undefined) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
    }[(sock as any)?.readyState as number];

    return (
        <View style={styles.container}>
            <Text>Socket:{isConnected}:{connectionStatus}</Text>
            <BarCodeScanner
                barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFill}
            />
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        height: 200,
        width: '100%'
    }
});