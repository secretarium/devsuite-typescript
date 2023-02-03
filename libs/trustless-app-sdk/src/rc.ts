import z from 'zod';

export const klaveRcConfigurationSchema = z.object({
    version: z.string(),
    name: z.string(),
    branch: z.string().optional(),
    rootDir: z.string().optional(),
    targetSdk: z.string().optional(),
    applications: z.array(z.object({
        name: z.string(),
        index: z.string().optional(),
        branch: z.string().optional(),
        rootDir: z.string().optional(),
        targetSdk: z.string().optional()
    }))
});

export type KlaveRcConfiguration = z.infer<typeof klaveRcConfigurationSchema>;