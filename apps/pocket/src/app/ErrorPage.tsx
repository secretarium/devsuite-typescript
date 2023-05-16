import { useRouteError } from 'react-router-native';

export const ErrorPage = () => {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div id="message-page">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
};

export default ErrorPage;