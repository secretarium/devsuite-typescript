import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useLocation } from 'react-router';
import { alertAtom } from '../_state';
import { useAlertActions } from '../_actions';

export { Alert };

function Alert() {
    const alert = useRecoilValue(alertAtom);
    const alertActions = useAlertActions();
    const { pathname } = useLocation();

    useEffect(() => {
        // Noop
    }, [pathname]);

    if (!alert)
        return null;

    return (
        <div className="container">
            <div className="m-3">
                <div className={`alert alert-dismissable ${alert.type}`}>
                    <button onClick={alertActions.clear}>&times;</button>
                    {alert.message}
                </div>
            </div>
        </div>
    );
}