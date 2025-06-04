import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    version: DevnetConfigVerionZod.default('V1'),
    fromBlock: z
        .string()
        .optional()
        .describe(
            'From block timestamp specified in seconds in hexadecimal format. Can also be the tags: earliest, finalized or latest.'
        ),
    toBlock: z
        .string()
        .optional()
        .describe(
            'To block timestamp specified in seconds in hexadecimal format. Can also be the tags: earliest, finalized or latest.'
        ),
    address: z.string().optional().describe('Contract address'),
    topics: z
        .array(z.string().nullable())
        .max(4)
        .optional()
        .describe(
            'Array of topic filters (up to 4 topics). Each topic can be either a string or null. Topics are ordered and must match in sequence. Null values match any topic.'
        ),
    minimum_attestations: z
        .number()
        .optional()
        .describe('Minimum number of attestations required for the log to be returned'),
};
type Param = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    id: number;
    result: Array<{
        address: string;
        block_number: string;
        block_hash: string;
        transaction_hash: string;
        transaction_index: string;
        log_index: string;
        topics: (string | null)[];
        data: string;
        pod_metadata: {
            [key: string]: unknown;
        };
    }>;
    error?: {
        code: number;
        message: string;
    };
};

export class EthGetLogs extends BaseTool<Param> {
    name = 'eth_getLogs';
    description = 'Returns an array of event logs matching the given filter criteria.';
    schema = schema;

    async execute({ version, fromBlock, toBlock, address, topics, minimum_attestations }: Param): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getLogs',
            params: [{ fromBlock, toBlock, address, topics, minimum_attestations }],
            id: 1,
        });

        const que = fetch(DevnetConfig[version].EXPLORER_RPC_URL, {
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
            throw result.error.message;
        }

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result.result),
                },
            ],
        };
    }
}