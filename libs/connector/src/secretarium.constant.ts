export const Secrets = {
    SRTWELCOME: 'Hey you! Welcome to Secretarium!',
    SRTTDOMAIN: 'https://secretarium.com'
};

export enum ErrorCodes {
    EKEYISENC,
    ESCPNOTRE,
    ESCPNOTRD,
    EINPASSWD,
    ETRANSFIL,
    ETIMOCHEL,
    ETIMOCPOW,
    ETINSRVID,
    ETINSRVIC,
    ETINUSRKY,
    ETIMOCPOI,
    ETINSRVPI,
    EUNABLCON,
    ENOTCONNT,
    EINVKFORM,
    EINVKNAME,
    EUNSPKMIS,
    EUNSPEXPS,
    EKEYLDFAI,
    EKEYNOTEC,
    EXORNOTSS,
    EKEYNOTSL,
    EECDHGENF
}

export const ErrorMessage: Record<ErrorCodes, string> = {
    [ErrorCodes.EKEYISENC]: 'Key is encrypted',
    [ErrorCodes.ESCPNOTRE]: 'Cannot encrypt, SCP session is not ready',
    [ErrorCodes.ESCPNOTRD]: 'Cannot decrypt, SCP session is not ready',
    [ErrorCodes.EINPASSWD]: 'Cannot decrypt, Invalid password',
    [ErrorCodes.ETRANSFIL]: 'Transaction failed',
    [ErrorCodes.ETIMOCHEL]: 'Timeout after client hello',
    [ErrorCodes.ETIMOCPOW]: 'Timeout after client proof-of-work',
    [ErrorCodes.ETINSRVID]: 'Invalid server identity',
    [ErrorCodes.ETINSRVIC]: 'Invalid server identity chain at #',
    [ErrorCodes.ETINUSRKY]: 'Invalid user key',
    [ErrorCodes.ETIMOCPOI]: 'Timeout after client proof-of-identity',
    [ErrorCodes.ETINSRVPI]: 'Invalid server proof-of-identity',
    [ErrorCodes.EUNABLCON]: 'Unable to create the secure connection: ',
    [ErrorCodes.ENOTCONNT]: 'Not connected',
    [ErrorCodes.EINVKFORM]: 'Key format is incorrect',
    [ErrorCodes.EINVKNAME]: 'Invalid key name',
    [ErrorCodes.EUNSPKMIS]: 'Unsupported, missing key file',
    [ErrorCodes.EUNSPEXPS]: 'Unsupported, expecting a single key file',
    [ErrorCodes.EKEYLDFAI]: 'Failed to load the key file',
    [ErrorCodes.EKEYNOTEC]: 'Cannot save, key must be encrypted',
    [ErrorCodes.EXORNOTSS]: 'Array should have the same size',
    [ErrorCodes.EKEYNOTSL]: 'Key has not been sealed',
    [ErrorCodes.EECDHGENF]: 'ECDH Key generation has failed'
};

export enum ConnectionState {
    connecting,
    secure,
    closing,
    closed
}

export const ConnectionStateMessage: Record<ConnectionState, string> = {
    [ConnectionState.connecting]: 'Secure Connection in Progress',
    [ConnectionState.secure]: 'Secure Connection Established',
    [ConnectionState.closing]: 'Secure Connection Failed',
    [ConnectionState.closed]: 'Closed'
};
