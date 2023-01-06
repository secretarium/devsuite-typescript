import { createTRPCRouter, publicProcedure } from '../trpc';
// import { z } from 'zod';

export const v0Router = createTRPCRouter({
    hello: publicProcedure.query(() => ({ hello: 'world' }))
    // getUser: t.procedure.input(z.string()).query((req) => {
    //     req.input;
    //     return { id: req.input, name: 'Bilbo' };
    // })
    // createUser: t.procedure
    //     .input(z.object({ name: z.string().min(5) }))
    //     .mutation(async (req) => {
    //         // use your ORM of choice
    //         return await UserModel.create({
    //             data: req.input
    //         });
    //     })
});

export type V0Router = typeof v0Router;