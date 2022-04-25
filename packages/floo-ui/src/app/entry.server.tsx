import type { EntryContext, HandleDataRequestFunction } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { cors } from 'remix-utils';

export const handleDataRequest: HandleDataRequestFunction = async (
    response,
    { request }
) => {
    return await cors(request, response);
};

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext
) {
    const markup = renderToString(
        <RemixServer context={remixContext} url={request.url} />
    );

    responseHeaders.set('Content-Type', 'text/html');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('Content-Security-Policy', 'frame-ancestors self');

    return new Response('<!DOCTYPE html>' + markup, {
        status: responseStatusCode,
        headers: responseHeaders
    });
}
