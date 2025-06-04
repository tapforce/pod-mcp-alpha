import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, ToolExtra, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    address: z.string().describe('20-byte address'),
    version: DevnetConfigVerionZod.default('V1'),
    perfectTimestamp: z.string().describe(
        `Past perfect timestamp to query, specified in seconds(hexadecimal format). 
            Can also be the tags: earliest, finalized or latest.`
    ),
};
type Param = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    id: number;
    result: string;
    error?: {
        code: number;
        message: string;
    };
};

export class EthGetTransactionCount extends BaseTool<Param> {
    name = 'eth_getTransactionCount';
    description = 'Returns the number of transactions sent from an address.';
    schema = schema;

    async execute(args: Param, extra: ToolExtra): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionCount',
            params: [args.address, args.perfectTimestamp].filter((i) => i != undefined),
            id: 1,
        });

        const que = fetch(DevnetConfig[args.version].EXPLORER_RPC_URL, {
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
