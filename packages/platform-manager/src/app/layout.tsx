import './globals.css';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '@secretarium/hubber-auth';

export default async function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    const session = await unstable_getServerSession(authOptions);
    return (
        <html lang="en">
            {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
            <head />
            <body>
                <pre>{JSON.stringify(session, null, 2)}</pre>
                {children}
            </body>
        </html>
    );
}
