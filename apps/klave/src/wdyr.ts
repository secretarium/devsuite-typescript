import React from 'react';

if (import.meta.env['NX_CLI_SET'] === 'true') {
    (async () => {
        const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render');
        whyDidYouRender(React, {
            trackAllPureComponents: true
            // trackHooks: false
        });
    })();
}