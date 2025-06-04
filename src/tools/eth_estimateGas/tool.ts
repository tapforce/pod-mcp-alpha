import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, ToolExtra, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    version: DevnetConfigVerionZod.default('V1'),
    from: z.string().describe('(Optional) 20-byte address of sender').optional(),
    to: z.string().describe('20-byte address of recipient'),
    gas: z.string().describe('(Optional) Gas provided for transaction execution').optional(),
    gasPrice: z.string().describe('(Optional) Gas price in wei').optional(),
    value: z.string().describe('(Optional) Value in wei').optional(),
    data: z.string().describe('(Optional) Contract code or encoded function call data').optional(),
};

type Params = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    id: number;
    result: string;
    error?: {
        code: number;
        message: string;
    };
};
    
export class EthEstimateGas extends BaseTool<Params> {
    name = 'eth_estimateGas';
    description = `Estimates gas needed for a transaction.
    Note: Only Legacy transactions are supported`;
    schema = schema;

    async execute(args: Params, extra: ToolExtra): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_estimateGas',
            params: [
                {
                    from: args.from,
                    to: args.to,
                    gas: args.gas,
                    gasPrice: args.gasPrice,
                    value: args.value,
                    data: args.data,
                }
            ].filter((i) => i != undefined),
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
