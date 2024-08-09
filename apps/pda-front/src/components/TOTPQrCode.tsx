import { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type TOTPQrCodeProps = {
    appName: string;
    username: string;
    otpSecret: string;
}

export const TOTPQrCode: FC<TOTPQrCodeProps> = ({ appName, username, otpSecret }) => {

    const uri = `otpauth://totp/${appName}:${username}?secret=${otpSecret}&issuer=Secretarium`;

    return <QRCodeSVG bgColor={'transparent'} value={uri} height={'10rem'} width={'10rem'} className='inline-block' />;
};

export default TOTPQrCode;