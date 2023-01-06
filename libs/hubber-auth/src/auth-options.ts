import { type NextAuthOptions } from 'next-auth';
import { type AppProviders } from 'next-auth/providers';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
// import EmailProvider from 'next-auth/providers/email';

import { prisma } from '@secretarium/hubber-db';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

let useMockProvider = process.env.NODE_ENV === 'test';
const { NX_GITHUB_CLIENTID, NX_GITHUB_CLIENTSECRET, NODE_ENV, APP_ENV } = process.env;
if (
    (NODE_ENV !== 'production' || APP_ENV === 'test') &&
    (!NX_GITHUB_CLIENTID || !NX_GITHUB_CLIENTSECRET)
) {
    console.log('⚠️ Using mocked GitHub auth correct credentials were not added');
    useMockProvider = true;
}

const providers: AppProviders = [];
if (useMockProvider) {
    providers.push(
        CredentialsProvider({
            id: 'github',
            name: 'Mocked GitHub',
            async authorize(credentials) {
                if (credentials) {
                    const user = {
                        id: credentials.name,
                        name: credentials.name,
                        email: credentials.name
                    };
                    return user;
                }
                return null;
            },
            credentials: {
                name: { type: 'test', value: 'florian' },
                password: { type: 'test' }
            }
        })
    );
} else {
    if (!NX_GITHUB_CLIENTID || !NX_GITHUB_CLIENTSECRET) {
        throw new Error('GITHUB_CLIENT_ID and GITHUB_SECRET must be set');
    }
    providers.push(
        GithubProvider({
            clientId: NX_GITHUB_CLIENTID,
            clientSecret: NX_GITHUB_CLIENTSECRET,
            profile(profile) {
                return {
                    id: profile.id,
                    name: profile.login,
                    email: profile.email,
                    image: profile.avatar_url
                } as any;
            }
        })
    );
}


export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    adapter: PrismaAdapter(prisma),
    providers,
    secret: process.env.NX_NEXTAUTH_SECRET,
    // Callbacks are asynchronous functions you can use to control what happens
    // when an action is performed.
    // https://next-auth.js.org/configuration/callbacks
    callbacks: {
        async session({ session, user }) {
            if (session.user)
                (session.user as any).id = user.id;
            return session;
        },
        async jwt({ token }) {
            token['userRole'] = 'admin';
            return token;
        }
    },
    // Events are useful for logging
    // https://next-auth.js.org/configuration/events
    events: {
        signIn: ({ user, isNewUser }) => {
            console.log(user, `isNewUser: ${JSON.stringify(isNewUser)}`);
        }
        // updateUser({ user })
    }

    // Enable debug messages in the console if you are having problems
    // debug: true
};