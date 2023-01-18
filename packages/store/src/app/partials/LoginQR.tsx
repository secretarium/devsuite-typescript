import { FC, useState, useCallback, useEffect } from 'react';
import QRCode from 'react-qr-code';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuid } from 'uuid';
import logo from '../images/logo.svg';
import { useAuth } from '../AuthProvider';

export const LoginQR: FC = () => {

    const { login } = useAuth();
    const [uuidLocator, setUuidLocator] = useState<string>();
    const [uuidBeacon, setUuidBeacon] = useState<string>();
    const [addressDestination, setAddressDestination] = useState<string>();
    const [socketUrl] = useState(`ws://${window.location.host}/api/bridge`);

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
    }, [lastMessage, login, sendMessage]);

    const handleClickSendMessage = useCallback(() => {
        if (isConnected)
            setUuidLocator(undefined);
    }, [isConnected]);

    return <div id="login">

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-12 pb-12 md:pt-20 md:pb-20">
                <div className="text-center pb-12 md:pb-16">
                    <br />
                    <div className='pb-5' >
                        <h1 className='text-xl font-bold'>Login</h1>
                        {isConnected
                            ? <span>Just open Secretarium Pocket and scan this QRCode to login</span>
                            : <span>There seems to be an issue connecting. Please refresh the page to try again</span>
                        }
                        <br />
                        <br />
                        <br />
                    </div>
                    {isConnected && addressDestination && uuidBeacon && uuidLocator
                        ? <div className='relative h-[300px]'>
                            <span className='absolute block overflow-hidden top-0 left-[calc(50%-150px)] w-[300px] h-[300px]'>
                                <QRCode level='Q' value={`cryptx_check#${addressDestination}#${uuidBeacon}#${uuidLocator}`} size={300} onClick={handleClickSendMessage} />
                            </span>
                            <span className='absolute block overflow-hidden rounded-full p-5 pt-6 top-[calc(160-35)] left-[calc(50%-35px)] w-[70px] h-[70px]'>
                                <img alt='Logo' src={logo} />
                            </span>
                            <br />
                            <br />
                        </div>
                        : null}
                </div>
            </div>
        </div>
    </div>;
};

export default LoginQR;