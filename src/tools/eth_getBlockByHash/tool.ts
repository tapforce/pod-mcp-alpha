import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    version: DevnetConfigVerionZod.default('V1'),
    hash: z.string().describe('Block hash'),
    fullTransaction: z
        .boolean()
        .default(false)
        .describe('If true, return the full transaction objects'),
};

type Params = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    id: number;
    result: {
        number: string;
        mixHash: string;
        hash: string;
        parentHash: string;
        nonce: string;
        sha3Uncles: string;
        logsBloom: string;
        transactionsRoot: string;
        stateRoot: string;
        receiptsRoot: string;
        miner: string;
        difficulty: string;
        extraData: string;
        size: string;
        gasLimit: string;
        gasUsed: string;
        timestamp: string;
        transactions: unknown[];
        uncles: string[];
    };
    error?: {
        code: number;
        message: string;
    };
};

export class EthGetBlockByHash extends BaseTool<Params> {
    name = 'eth_getBlockByHash';
    description = 'Returns the block with the given hash.';

    schema = schema;

    async execute({ version, hash, fullTransaction }: Params): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBlockByHash',
            params: [hash, fullTransaction],
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
