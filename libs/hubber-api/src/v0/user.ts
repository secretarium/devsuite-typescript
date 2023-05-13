import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import base64url from 'base64url';
import {
    // Registration
    generateRegistrationOptions,
    verifyRegistrationResponse,
    // Authentication
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    GenerateRegistrationOptionsOpts,
    VerifyAuthenticationResponseOpts,
    VerifyRegistrationResponseOpts
} from '@simplewebauthn/server';
import { AuthenticatorDevice } from '@simplewebauthn/typescript-types';
import { isoUint8Array } from '@simplewebauthn/server/helpers';
import type { Authenticator } from '@klave/db';

const rpID = 'localhost';
const devices: Authenticator[] = [];
const expectedOrigin = '';

export const userRouter = createTRPCRouter({
    all: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.user.findMany();
    }),
    byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
        return ctx.prisma.user.findFirst({ where: { id: input } });
    }),
    create: publicProcedure
        .input(z.object({ login: z.string() }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.user.create({ data: input });
        }),
    generateRegistrationOptions: publicProcedure.query(({ ctx }) => {
        // You need to know the user by this point
        const user = {
            username: ctx.webId,
            devices
        };
        // const user = ctx.prisma.user.findFirst({ where: { id: input } });
        // const web = ctx.prisma.web.findFirst({ where: { id: ctx.webId } });
        const opts: GenerateRegistrationOptionsOpts = {
            rpName: 'Klave Webauthn Example',
            rpID,
            userID: ctx.webId,
            userName: user.username,
            timeout: 60000,
            attestationType: 'none',
            /**
             * Passing in a user's list of already-registered authenticator IDs here prevents users from
             * registering the same device multiple times. The authenticator will simply throw an error in
             * the browser if it's asked to perform registration when one of these ID's already resides
             * on it.
             */
            excludeCredentials: user.devices.map(dev => ({
                id: Buffer.from(dev.credentialID),
                type: 'public-key',
                transports: dev.transports
            })),
            authenticatorSelection: {
                residentKey: 'discouraged'
            },
            /**
             * Support the two most common algorithms: ES256, and RS256
             */
            supportedAlgorithmIDs: [-7, -257]
        };

        const options = generateRegistrationOptions(opts);
        ctx.session.currentChallenge = options.challenge;
        ctx.session.save();
        return options;
    }),
    verifyRegistration: publicProcedure.mutation(async ({ ctx }) => {
        // You need to know the user by this point
        const user = {
            devices
        };
        const { body } = ctx;
        const expectedChallenge = ctx.session.currentChallenge;

        const opts: VerifyRegistrationResponseOpts = {
            response: body,
            expectedChallenge: `${expectedChallenge}`,
            expectedOrigin,
            expectedRPID: rpID,
            requireUserVerification: true
        };
        const verification = await verifyRegistrationResponse(opts);
        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
            const { credentialPublicKey, credentialID, counter } = registrationInfo;

            // const existingDevice: Prisma.AuthenticatorCreateInput | undefined = undefined;
            const existingDevice = user.devices.find(device => isoUint8Array.areEqual(Buffer.from(device.credentialID), credentialID));

            if (!existingDevice) {
                /**
                 * Add the returned device to the user's list of devices
                 */
                const newDevice: Authenticator = {
                    id: '',
                    credentialPublicKey: base64url(Buffer.from(credentialPublicKey)),
                    credentialID: base64url(Buffer.from(credentialID)),
                    credentialDeviceType: 'singleDevice',
                    credentialBackedUp: false,
                    counter,
                    transports: body.response.transports
                };
                user.devices.push(newDevice);
            }
        }

        ctx.session.currentChallenge = undefined;
        ctx.session.save();

        return { verified };
    }),
    getAuthenticationOptions: publicProcedure.query(({ ctx }) => {
        // You need to know the user by this point
        const user = {
            devices
        };

        const opts = {
            timeout: 60000,
            allowCredentials: user.devices.map(dev => ({
                id: Buffer.from(dev.credentialID),
                type: 'public-key' as const,
                transports: dev.transports
            })),
            userVerification: 'required' as const,
            rpID
        };

        const options = generateAuthenticationOptions(opts);

        /**
         * The server needs to temporarily remember this value for verification, so don't lose it until
         * after you verify an authenticator response.
         */
        ctx.session.currentChallenge = options.challenge;
        ctx.session.save();

        return options;
    }),
    verifyAuthentication: publicProcedure.mutation(async ({ ctx }) => {
        // You need to know the user by this point
        const user = {
            devices
        };

        const { body } = ctx;
        const expectedChallenge = ctx.session.currentChallenge;

        let dbAuthenticator;
        const bodyCredIDBuffer = base64url.toBuffer(body.rawId);
        // "Query the DB" here for an authenticator matching `credentialID`
        for (const dev of user.devices) {
            if (isoUint8Array.areEqual(Buffer.from(dev.credentialID), bodyCredIDBuffer)) {
                dbAuthenticator = dev;
                break;
            }
        }

        if (!dbAuthenticator)
            throw new Error('Authenticator is not registered with this site');

        const opts: VerifyAuthenticationResponseOpts = {
            response: body,
            expectedChallenge: `${expectedChallenge}`,
            expectedOrigin,
            expectedRPID: rpID,
            authenticator: dbAuthenticator as unknown as AuthenticatorDevice,
            requireUserVerification: true
        };

        const verification = await verifyAuthenticationResponse(opts);
        const { verified, authenticationInfo } = verification;

        if (verified) {
            // Update the authenticator's counter in the DB to the newest count in the authentication
            dbAuthenticator.counter = authenticationInfo.newCounter;
        }

        ctx.session.currentChallenge = undefined;
        ctx.session.save();

        return { verified };
    })
});

export default userRouter;