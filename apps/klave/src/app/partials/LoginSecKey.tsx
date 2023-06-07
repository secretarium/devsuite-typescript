import { FC, useState, useEffect, useCallback, ChangeEvent, MouseEvent } from 'react';
import { platformAuthenticatorIsAvailable, browserSupportsWebAuthn, startAuthentication, startRegistration } from '@simplewebauthn/browser';
import api from '../utils/api';
import { UilSpinner } from '@iconscout/react-unicons';
import { useLocalForage } from '../useLocalStorage';

export const LoginSecKey: FC = () => {

    const [credentials, setCredentials] = useLocalForage<Array<string>>('enrolledCredentials', []);
    const [isRequestingWebauthnInput, setIsRequestingWebauthnInput] = useState(false);
    const [isWebauthAvailable, setIsWebauthAvailable] = useState<null | boolean>();
    const [shouldAttemptWebauthEnroll, setShouldAttemptWebauthEnroll] = useState(true);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState<string>();
    const [screen, setScreen] = useState<'start' | 'code' | 'key'>('start');
    const { mutate: emailCodeMutation, isLoading: emailCodeLoading } = api.v0.auth.getEmailCode.useMutation();
    const { mutate: verifyEmailCodeMutation, isLoading: verifyEmailCodeLoading } = api.v0.auth.verifyEmailCode.useMutation();
    const { mutate: validateWebauthnMutation, isLoading: validateWebauthnLoading } = api.v0.auth.validateWebauthn.useMutation();
    const { mutate: registerWebauthnMutation, isLoading: registerWebauthnLoading } = api.v0.auth.registerWebauthn.useMutation();
    const { refetch: refetchSession } = api.v0.auth.getSession.useQuery();
    const { refetch: refetchAuthOptions, isFetching: wauthOptionsLoading, error: webauthAuthError } = api.v0.auth.getWebauthAuthenticationOptions.useQuery({
        email
    }, {
        enabled: false,
        retry: false
    });
    const { refetch: refetchRegistrationOptions, isFetching: wregOptionsLoading, error: webauthRegError } = api.v0.auth.getWebauthRegistrationOptions.useQuery({
        email
    }, {
        enabled: false,
        retry: false
    });

    useEffect(() => {
        if (credentials?.length === 1)
            setEmail(credentials[0] ?? '');
    }, [credentials]);

    // useEffect(() => {
    //     if (credentials?.length === 1 && email === credentials[0])
    //         startAuth();
    // }, [credentials, email, startAuth]);

    useEffect(() => {
        if (webauthAuthError) {
            setError(webauthAuthError.message ?? 'An error occured while trying to send your email code. Please try again later.');
        }
        if (webauthRegError) {
            setError(webauthRegError.message ?? 'An error occured while trying to send your email code. Please try again later.');
        }
    }, [webauthAuthError, webauthRegError]);

    useEffect(() => {
        if (isWebauthAvailable === undefined) {
            setIsWebauthAvailable(null);
            Promise.all([
                browserSupportsWebAuthn(),
                platformAuthenticatorIsAvailable()
            ])
                .then(statuses => statuses.reduce((prev, curr) => curr && prev, true))
                .then(setIsWebauthAvailable)
                .catch(() => setIsWebauthAvailable(false));
        }
    }, [isWebauthAvailable]);

    const getLoginCode = useCallback(() => {
        emailCodeMutation({
            email
        }, {
            onSettled(data, error) {
                if (error) {
                    try {
                        const parsedError = JSON.parse(error.message) as any;
                        setError(parsedError?.message ?? 'An error occured while trying to send your email code. Please try again later.');
                    } catch (e) {
                        setError(error.message ?? 'An error occured while trying to send your email code. Please try again later.');
                    }
                } else if (data?.ok)
                    setScreen('code');
                else
                    setError('An error occured while trying to send your email code. Please try again later.');
            }
        });
    }, [email, emailCodeMutation]);

    const startAuth = useCallback(() => {
        if (email.length === 0) {
            setError('Please enter your email address');
            return;
        }

        if (!isWebauthAvailable || (!credentials?.length && code.length === 0))
            return getLoginCode();

        if (credentials?.includes(email)) {
            refetchAuthOptions()
                .then((res) => res.data)
                .then((options) => {
                    if (options) {
                        setIsRequestingWebauthnInput(true);
                        return startAuthentication(options);
                    }
                    throw new Error('No authentication options available');
                })
                .then((auth) => new Promise((resolve, reject) => {
                    validateWebauthnMutation({
                        email,
                        data: auth
                    }, {
                        onSuccess: resolve,
                        onError: reject
                    });
                }))
                .then((res: any) => {
                    if (res?.ok) {
                        refetchSession();
                        return;
                    }
                    setError('An error occured while trying to log you in. Please try again later.');
                })
                .catch(() => {
                    setIsRequestingWebauthnInput(false);
                });
            return;
        } else {
            refetchRegistrationOptions()
                .then((res) => res.data)
                .then((options) => {
                    if (options) {
                        setIsRequestingWebauthnInput(true);
                        return startRegistration(options);
                    }
                    throw new Error('No registration options available');
                })
                .then((reg) => new Promise((resolve, reject) => {
                    registerWebauthnMutation({
                        email,
                        data: reg
                    }, {
                        onSuccess: resolve,
                        onError: reject
                    });
                }))
                .then((res: any) => {
                    if (res?.ok) {
                        setCredentials([...(credentials ?? []), email]);
                        refetchSession();
                        return;
                    }
                    setError('An error occured while trying to register you in. Please try again later.');
                })
                .catch(() => {
                    setIsRequestingWebauthnInput(false);
                    setError('An error occured while trying to register your secure key. Please try again later.');
                });
        }

    }, [code.length, credentials, email, getLoginCode, isWebauthAvailable, refetchAuthOptions, refetchRegistrationOptions, refetchSession, registerWebauthnMutation, setCredentials, validateWebauthnMutation]);

    const verifyEmailCode = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (code.length === 0) {
            setError('Please enter your email code');
            return;
        }
        verifyEmailCodeMutation({
            email,
            code: code.replace(/\D/g, ''),
            authenticate: !isWebauthAvailable || !!credentials?.length || !shouldAttemptWebauthEnroll
        }, {
            onSettled(data, error) {
                if (error)
                    setError(error?.message ?? (JSON.parse(error.message) as any)[0]?.message ?? error.message ?? 'An error occured while trying to log you in. Please try again later.');
                else if (data?.ok) {
                    if (shouldAttemptWebauthEnroll && isWebauthAvailable && !credentials?.length) {
                        setScreen('start');
                        startAuth();
                    } else
                        refetchSession();
                } else
                    setError('An error occured while trying to log you in. Please try again later.');
            }
        });
    }, [code, verifyEmailCodeMutation, email, isWebauthAvailable, credentials?.length, shouldAttemptWebauthEnroll, refetchSession, startAuth]);

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
        setIsRequestingWebauthnInput(false);
        setShouldAttemptWebauthEnroll(true);
    }, [setEmail, setCode, setError]);

    const isLoading = emailCodeLoading || verifyEmailCodeLoading || wauthOptionsLoading || wregOptionsLoading || registerWebauthnLoading || isRequestingWebauthnInput || validateWebauthnLoading;

    const handleLoginSubmit = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        startAuth();
    }, [startAuth]);

    const handleLoginCodeSubmit = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setShouldAttemptWebauthEnroll(false);
        getLoginCode();
    }, [getLoginCode]);

    return <div className="text-center pb-12 md:pb-16">
        <br />
        <div className='pb-5' >
            {isWebauthAvailable && screen === 'start'
                ? <>
                    <h1 className='text-xl font-bold'>Secure Key</h1>
                    <span>Connect with your secure key.</span>
                </>
                : <>
                    <h1 className='text-xl font-bold'>Email Code</h1>
                    <span>Connect via an email code.</span>
                </>
            }
            <br />
            <br />
            <br />
        </div >
        <form className='relative'>
            {screen === 'start' ? <>
                <input key='emailField' value={email} onInput={onChangeEmail} alt='email' placeholder='Email address' type='email' className='text-center' />
                <br />
                <br />
                <button disabled={isLoading} onClick={handleLoginSubmit} onSubmit={handleLoginSubmit} type='submit'>{isLoading ? <UilSpinner className='inline-block animate-spin' /> : isWebauthAvailable ? 'Log in with secure key' : 'Log in with email code'}</button><br />
                <button disabled={isLoading} onClick={handleLoginCodeSubmit} className='bg-transparent border-0 shadow-none font-normal text-sm text-slate-800 hover:text-blue-600 hover:cursor-pointer'>Use email code instead</button>
            </> : screen === 'code' ? <>
                <input key='codeField' value={code} onInput={onChangeCode} alt='code' placeholder='Code' type='text' className='text-center' />
                <br />
                <br />
                <button disabled={isLoading} onClick={verifyEmailCode} onSubmit={verifyEmailCode} type='submit' className='mx-1'>{isLoading ? <UilSpinner className='inline-block animate-spin' /> : 'Next'}</button>
                <button onClick={resetLogin} type='button' className='mx-1'>Cancel</button>
            </> : null}
            {error ? <><br /><br /><div className='bg-red-200 p-2 w-full'>{error}</div></> : null}
        </form>
    </div >;
};

export default LoginSecKey;