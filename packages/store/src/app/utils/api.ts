import { createTRPCReact } from '@trpc/react-query';
import type { Router } from '@secretarium/hubber-api';

export const api = createTRPCReact<Router>();
export default api;