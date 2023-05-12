import { protectedProcedure, publicProcedure, createTRPCRouter } from '../trpc';
import { createTransport } from 'nodemailer';
// import * as passport from 'passport';
import { z } from 'zod';

export const authRouter = createTRPCRouter({
    getSession: publicProcedure.query(async ({ ctx }) => {
        return {
            // session: ctx.session,
            // sessionID: ctx.sessionID,
            me: ctx.user ?? ctx.session.user,
            webId: ctx.webId,
            hasUnclaimedApplications: ctx.web.userId === null && (await ctx.prisma.application.count({
                where: {
                    webId: ctx.webId
                }
            })).valueOf() > 0
            // web: ctx.web
        };
    }),
    getSecretMessage: protectedProcedure.query(() => {
        // testing type validation of overridden next-auth Session in @acme/auth package
        return 'you can see this secret message!';
    }),
    getEmailCode: publicProcedure
        .input(z.object({
            email: z.string().email()
        }))
        .mutation(async ({ ctx: { prisma, webId }, input: { email } }) => {

            const betaDomainsAllowed = process.env['NX_BETA_DOMAIN_FILTER']?.split(',') ?? [];
            const emailDomain = email.split('@')[1];
            if (!betaDomainsAllowed.includes(emailDomain))
                throw new Error('It looks like you are not part of Klave\'s beta program');

            try {
                let user = await prisma.user.findFirst({
                    where: {
                        emails: {
                            has: email
                        }
                    }
                });
                if (!user)
                    user = await prisma.user.create({
                        data: {
                            emails: [email],
                            webs: {
                                connect: { id: webId }
                            }
                        }
                    });
                const temporaryCode = `${Math.random()}`.substring(2, 11);
                const transporter = createTransport(process.env['NX_SMTP_HOST']);
                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        loginCode: temporaryCode,
                        loginCodeCreatedAt: new Date()
                    }
                });
                const [keySelector, domainName] = (process.env['NX_DKIM_DOMAIN'] ?? '@').split('@');
                await transporter.sendMail({
                    from: 'noreply@klave.network',
                    to: email,
                    subject: 'Login code',
                    text: `Your Klave login code is: ${temporaryCode.substring(0, 3)}-${temporaryCode.substring(3, 6)}-${temporaryCode.substring(6, 9)}`,
                    dkim: {
                        domainName,
                        keySelector,
                        privateKey: process.env['NX_DKIM_PRIVATE_KEY'] ?? ''
                    }
                });
                return {
                    ok: true
                };
            } catch (e) {
                // TODO Move to logging service
                console.error(e);
                return {
                    ok: false
                };
            }
        }),
    getChallenge: publicProcedure
        .input(z.object({
            email: z.string().email(),
            code: z.string()
        }))
        .mutation(async ({ ctx: { prisma, session, sessionStore, webId }, input: { email, code } }) => {
            const user = await prisma.user.findFirst({
                where: {
                    emails: {
                        has: email
                    }
                }
            });
            if (!user || user.loginCode === undefined)
                throw new Error('User not found');
            if (user.loginCode !== code || !user.loginCodeCreatedAt || user.loginCodeCreatedAt < new Date(Date.now() - 1000 * 60 * 5))
                throw new Error('Invalid code');
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    loginCode: null,
                    loginCodeCreatedAt: null,
                    webs: {
                        connect: {
                            id: webId
                        }
                    }
                }
            });
            await new Promise<void>((resolve, reject) => {
                // console.log('performing passport', passport, passport.authenticate);
                // session.user = user;
                session.save(() => {
                    sessionStore.set(session.id, {
                        ...session,
                        user
                    }, (err) => {
                        if (err)
                            reject(err);
                        resolve();
                    });
                });

                // passport.authenticate('local')(req, undefined, () => {
                //     console.log('logging in', login, user);
                //     login(user, (err) => {
                //         console.error('There was error', err);
                //         resolve();
                //     });
                // });
            });
            return {
                ok: true
            };
        }),
    logOut: publicProcedure.mutation(async ({ ctx: { session } }) => {
        await new Promise<void>((resolve, reject) => {
            session.destroy((err) => {
                if (err)
                    reject(err);
                resolve();
            });
        });
        return {
            ok: true
        };
    })
});

export default authRouter;