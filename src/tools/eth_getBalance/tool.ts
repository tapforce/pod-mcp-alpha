import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    address: z.string().describe('20-byte address to check balance for'),
    perfectTimestamp: z.string().describe(
        `Past perfect timestamp to query, specified in seconds(hexadecimal format). 
            Can also be the tags: earliest, finalized or latest.`
    ),
    version: DevnetConfigVerionZod.default('V1'),
};

type Params = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    result: string;
    id: number;
    error?: {
        code: number;
        message: string;
    };
};

export class EthGetBalance extends BaseTool<Params> {
    name = 'eth_getBalance';
    description = 'Returns the balance of the account of given address.';

    schema = schema;

    async execute({ address, perfectTimestamp, version }: Params): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [address, perfectTimestamp].filter((i) => i != undefined),
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
                    text: result.result,
                },
            ],
        };
    }
}
