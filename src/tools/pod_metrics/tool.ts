import {
    DevnetConfig,
    DevnetConfigVerionZod
} from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    gas_price: z.number().optional().describe('Current gas price in wei (value type u128)'),
    validator_uptime: z
        .number()
        .optional()
        .describe('Validator uptime percentage (value type f64)'),
    latency: z.number().optional().describe('Average latency in milliseconds (value type f64)'),
    throughput: z
        .number()
        .optional()
        .describe('Average throughput in transactions per second (value type f64)'),
    version: DevnetConfigVerionZod.default('V1').describe(
        'Choose version of explorer API, default is V1'
    ),
};

type Params = z.objectOutputType<typeof schema, z.ZodTypeAny>;

type Result = {
    gas_price: number;
    validator_uptime: number;
    latency: number;
    throughput: number;
    error?: {
        code: number;
        message: string;
    };
};

export class PodMetrics extends BaseTool<Params> {
    name = 'pod_metrics';

    description = `Retrieve metrics from explorer.`;

    schema = schema;

    async execute({
        gas_price,
        validator_uptime,
        latency,
        throughput,
        version,
    }: Params): Promise<ToolResult> {
        const params = {
            gas_price,
            validator_uptime,
            latency,
            throughput,
        };

        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'pod_metrics',
            params,
            id: 1,
        });

        const url = DevnetConfig[version as 'V1'].EXPLORER_RPC_URL;

        const que = fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        })
            .then((i) => i.json())
            .catch((e) => e as Error);

        const result: Result = await que;

        if (result instanceof Error) {
            throw result;
        }

        if (result.error) {
            throw new Error(result.error.message);
        }

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result),
                },
            ],
        };
    }
}
