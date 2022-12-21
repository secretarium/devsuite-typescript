import { FC, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuid } from 'uuid';
import logo from './logo.svg';
import { useAuth } from '../AuthProvider';

export const Login: FC = () => {

    const navigate = useNavigate();
    const { login } = useAuth();
    const [uuidLocator, setUuidLocator] = useState<string>();
    const [uuidBeacon, setUuidBeacon] = useState<string>();
    const [addressDestination, setAddressDestination] = useState<string>();
    const [socketUrl] = useState(`ws://${window.location.host}/api/bridge`);
    // const [messageHistory, setMessageHistory] = useState<Array<MessageEvent<string>>>([]);

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        reconnectAttempts: 5,
        reconnectInterval: 1,
        shouldReconnect: () => true
    });

    const isConnected = readyState === ReadyState.OPEN;

    useEffect(() => {
        if (uuidLocator || !isConnected)
            return;
        const newLocator = uuid();
        setUuidLocator(newLocator);
        setTimeout(() => sendMessage(`request#${newLocator}`), 500);

    }, [isConnected, sendMessage, uuidLocator]);

    useEffect(() => {
        if (!lastMessage)
            return;
        console.log('lastMessage', lastMessage);
        const [verb, data, address] = lastMessage.data.split('#');
        switch (verb) {
            case 'sid':
                setUuidBeacon(data);
                setAddressDestination(address);
                break;
            case 'confirmed':
                fetch('/api/login/print').then(res => res.json()).then(udata => login(udata));
                break;
        }
        // setMessageHistory((prev) => [lastMessage].concat(prev));
    }, [lastMessage, login, navigate, sendMessage]);

    const handleClickSendMessage = useCallback(() => {
        if (isConnected)
            setUuidLocator(undefined);
    }, [isConnected]);

    // const connectionStatus = {
    //     [ReadyState.CONNECTING]: 'Connecting',
    //     [ReadyState.OPEN]: 'Open',
    //     [ReadyState.CLOSING]: 'Closing',
    //     [ReadyState.CLOSED]: 'Closed',
    //     [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
    // }[readyState];

    console.log(isConnected, addressDestination, uuidBeacon, uuidLocator);

    return <div id="login" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <br />
        <div style={{ textAlign: 'center' }}>
            <h1>Login</h1>
            {isConnected
                ? <span>Just open Secretarium Pocket and scan this QRCode to login</span>
                : <span>There seems to be an issue connecting. Please refresh the page to try again</span>
            }
            <br />
            <br />
            <br />
        </div>
        {isConnected && addressDestination && uuidBeacon && uuidLocator
            ? <div style={{ textAlign: 'center', position: 'relative' }}>
                <QRCode level='Q' value={`cryptx_check#${addressDestination}#${uuidBeacon}#${uuidLocator}`} size={300} onClick={handleClickSendMessage} />
                <span style={{ backgroundColor: 'white', padding: 5, paddingTop: 6, overflow: 'hidden', borderRadius: '100%', position: 'absolute', top: 160 - 35, left: 'calc(50% - 35px)', display: 'block', width: '70px', height: '70px' }}>
                    <img alt='Logo' src={logo} />
                </span>
                <br />
                <br />
            </div>
            : null}
        {/* <div style={{ textAlign: 'center', overflow: 'hidden', maxHeight: 200 }}>
            {messageHistory.map((message, idx) => <Fragment key={idx}><span style={{ fontWeight: !idx ? 'bold' : 'inherit' }}>{message ? message.data : null}</span><br /></Fragment>)}
        </div> */}
    </div>;
};

export default Login;