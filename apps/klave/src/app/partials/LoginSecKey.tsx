import { FC, useState, useCallback, ChangeEvent } from 'react';
import { useWebAuthn } from 'react-hook-webauthn';
import api from '../utils/api';
// import { v4 as uuid } from 'uuid';
// import { useAuth } from '../AuthProvider';

export const LoginSecKey: FC = () => {

    const rpOptions = {
        rpId: process.env['NX_KLAVE_AUTHSTATE_URL'] ?? 'localhost',
        rpName: 'Klave Network'
    };

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState<string>();
    const [screen, setScreen] = useState<'start' | 'code' | 'key'>('start');
    const { getCredential, getAssertion } = useWebAuthn(rpOptions);
    const { mutate: emailCodeMutate } = api.v0.auth.getEmailCode.useMutation();
    const { mutate: challengeMutate } = api.v0.auth.getChallenge.useMutation();
    const { refetch: refetchSession } = api.v0.auth.getSession.useQuery();

    const getLoginCode = useCallback(() => {
        if (email.length === 0) {
            setError('Please enter your email address');
            return;
        }
        emailCodeMutate({
            email
        }, {
            onSettled(data, error) {
                if (error)
                    setError(JSON.parse(error.message)[0]?.message ?? error.message ?? 'An error occured while trying to send your email code. Please try again later.');
                else if (data?.ok)
                    setScreen('code');
                else
                    setError('An error occured while trying to send your email code. Please try again later.');
            }
        });
    }, [email, emailCodeMutate]);

    const getLoginChallenge = useCallback(() => {
        if (code.length === 0) {
            setError('Please enter your email code');
            return;
        }
        challengeMutate({
            email,
            code: code.replace(/\D/g, '')
        }, {
            onSettled(data, error) {
                if (error)
                    setError(error?.message ?? JSON.parse(error.message)[0]?.message ?? error.message ?? 'An error occured while trying to log you in. Please try again later.');
                else if (data?.ok)
                    // setScreen('key');
                    refetchSession();
                else
                    setError('An error occured while trying to log you in. Please try again later.');
            }
        });
    }, [code, challengeMutate, email]);

    const onChangeEmail = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (error)
            setError(undefined);
        setEmail(e.target.value);
    }, [error]);

    const onChangeCode = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (error)
            setError(undefined);
        setCode(e.target.value);
    }, [error]);

    const resetLogin = useCallback(() => {
        setEmail('');
        setCode('');
        setError(undefined);
        setScreen('start');
    }, [setEmail, setCode, setError]);

    const onRegister = useCallback(async () => {
        const credential = await getCredential({
            challenge: 'stringFromServer',
            userDisplayName: email,
            userId: email,
            userName: email
        });
        console.log(credential);
    }, [getCredential, email]);


    const onAuth = useCallback(async () => {
        const assertion = await getAssertion({ challenge: 'stringFromServer' });
        console.log(assertion);
    }, [getAssertion]);

    return <div className="text-center pb-12 md:pb-16">
        <br />
        <div className='pb-5' >
            <h1 className='text-xl font-bold'>Email log in</h1>
            <span>Connect via a magic code</span>
            {/*
             <h1 className='text-xl font-bold'>Security keys</h1>
            <span>Connect via a hardware key</span>
             */}
            <br />
            <br />
            <br />
        </div>
        <div className='relative'>
            {screen === 'start' ? <>
                <input key='emailField' value={email} onInput={onChangeEmail} alt='email' placeholder='Email address' type='email' className='text-center' />
                <br />
                <br />
                <button onClick={getLoginCode} type='button'>Next</button>
            </> : screen === 'code' ? <>
                <input key='codeField' value={code} onInput={onChangeCode} alt='code' placeholder='Code' type='text' className='text-center' />
                <br />
                <br />
                <button onClick={getLoginChallenge} type='button' className='mx-1'>Next</button>
                <button onClick={resetLogin} type='button' className='mx-1'>Cancel</button>
            </> : screen === 'key' ? <>
                <button onClick={onRegister} type='button' className='mx-1'>Register</button>
                <button onClick={onAuth} type='button' className='mx-1'>Sign In</button>
                <button onClick={resetLogin} type='button' className='mx-1'>Cancel</button>
            </> : null}
            {error ? <><br /><br /><div className='bg-red-200 p-2'>{error}</div></> : null}
        </div>
    </div>;
};

export default LoginSecKey;