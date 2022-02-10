import { useState, useEffect } from 'react';

export const DevtoolMainPanel = () => {

    const [connectorVersion, setConnectorVersion] = useState<string>();
    const [reactHooksVersion, setSecretariumVersion] = useState<string>();

    useEffect(() => {
        chrome.devtools.inspectedWindow.eval('window.__SECRETARIUM_DEVTOOLS_CONNECTOR__', (connector?: any, exceptionInfo?: unknown) => {
            setConnectorVersion(connector?.version);
            if (exceptionInfo)
                console.error(exceptionInfo);
        });
        chrome.devtools.inspectedWindow.eval('window.__SECRETARIUM_DEVTOOLS_REACT__', (reactHooks?: any, exceptionInfo?: unknown) => {
            setSecretariumVersion(reactHooks?.version);
            if (exceptionInfo)
                console.error(exceptionInfo);
        });
    });

    return <div>
        {connectorVersion ? <>Secretarium Connector v{connectorVersion}</> : null}
        {reactHooksVersion ? <>Secretarium React Hooks v{reactHooksVersion}</> : null}
    </div>;
};

export default DevtoolMainPanel;
