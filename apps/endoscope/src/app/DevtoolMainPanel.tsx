import { useState, useEffect } from 'react';
import '../styles.css';

export const DevtoolMainPanel = () => {

    const [connectorVersion, setConnectorVersion] = useState<string>();
    const [reactHooksVersion, setSecretariumVersion] = useState<string>();

    useEffect(() => {
        chrome.devtools?.panels.create('Secretarium', '', 'panel.html', function (/*panel*/) {
            // panel.onShown.
            // ((window: Window) => window.document.getElementsByTagName('body')[0].innerHTML = 'Blah');
            // code invoked on panel creation
            chrome.devtools.inspectedWindow.eval('console.log(\'Welcome to Secretarium Endoscope\')');
        });
    });

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

    return <div className='flex h-full items-center justify-center'>
        <div className='p-4'>
            <div className='container'>
                Current connected versions<br />
                {connectorVersion ? <>Secretarium Connector v{connectorVersion}</> : null}<br />
                {reactHooksVersion ? <>Secretarium React Hooks v{reactHooksVersion}</> : null}
            </div>
        </div>
    </div>;
};

export default DevtoolMainPanel;
