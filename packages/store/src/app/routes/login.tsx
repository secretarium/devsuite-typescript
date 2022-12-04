import { FC, useState, useCallback, useEffect, Fragment } from 'react';
import QRCode from 'react-qr-code';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuid } from 'uuid';
import logo from './logo.svg';

export const Login: FC = () => {
    const [uuidLocator, setUuidLocator] = useState<string>();
    const [uuidBeacon, setUuidBeacon] = useState<string>();
    const [socketUrl] = useState(`ws://${window.location.host}/api/echo`);
    const [messageHistory, setMessageHistory] = useState<Array<MessageEvent<string>>>([]);

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        reconnectAttempts: 5,
        reconnectInterval: 1
    });

    useEffect(() => {
        if (uuidLocator || readyState !== ReadyState.OPEN)
            return;
        const newLocator = uuid();
        setUuidLocator(newLocator);
        sendMessage(`request:${newLocator}`);

    }, [readyState, sendMessage, uuidLocator]);

    useEffect(() => {
        if (!lastMessage)
            return;
        const [verb, data] = lastMessage.data.split(':');
        switch (verb) {
            case 'beacon':
                setUuidBeacon(data);
                break;
        }
        setMessageHistory((prev) => [lastMessage].concat(prev));
    }, [lastMessage, sendMessage, setMessageHistory]);

    const handleClickSendMessage = useCallback(() => {
        if (readyState === ReadyState.OPEN)
            setUuidLocator(undefined);
    }, [readyState]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
    }[readyState];

    return <div id="login" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <br />
        <div style={{ textAlign: 'center' }}>
            <h1>Login</h1>
            <span>The WebSocket is currently {connectionStatus}</span>
            <br />
            <br />
            <br />
        </div>
        <div style={{ textAlign: 'center', position: 'relative' }}>
            <QRCode level='Q' value={uuidBeacon ?? ''} size={300} onClick={handleClickSendMessage} />
            <span style={{ backgroundColor: 'white', padding: 5, paddingTop: 6, overflow: 'hidden', borderRadius: '100%', position: 'absolute', top: 160 - 35, left: 'calc(50% - 35px)', display: 'block', width: '70px', height: '70px' }}>
                <img alt='Logo' src={logo} />
            </span>
            <br />
            <br />
        </div>
        <div style={{ textAlign: 'center', overflow: 'hidden', maxHeight: 200 }}>
            {messageHistory.map((message, idx) => <Fragment key={idx}><span style={{ fontWeight: !idx ? 'bold' : 'inherit' }}>{message ? message.data : null}</span><br /></Fragment>)}
        </div>
    </div>;
};

export default Login;