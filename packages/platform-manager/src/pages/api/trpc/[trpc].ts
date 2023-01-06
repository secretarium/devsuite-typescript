import { type V0Router, v0Router, createContext } from '@secretarium/hubber-api';
import { createNextApiHandler } from '@trpc/server/adapters/next';

// export API handler
export default createNextApiHandler<V0Router>({
    router: v0Router,
    /**
   * @link https://trpc.io/docs/context
   */
    createContext,
    /**
     * @link https://trpc.io/docs/error-handling
     */
    onError({ error }) {
        if (error.code === 'INTERNAL_SERVER_ERROR') {
            // send to bug reporting
            console.error('Something went wrong', error);
        }
    },
    /**
     * Enable query batching
     */
    batching: {
        enabled: true
    }
});

// If you need to enable cors, you can do so like this:
// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   // Enable cors
//   await cors(req, res);

//   // Let the tRPC handler do its magic
//   return createNextApiHandler({
//     router: appRouter,
//     createContext,
//   })(req, res);
// };

// export default handler;