import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    version: DevnetConfigVerionZod.default('V1'),
    blockNumber: z.string().describe('Block number in hexadecimal format'),
    fullTransaction: z
        .boolean()
        .default(false)
        .describe('If true, return the full transaction objects'),
};

type Param = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    id: number;
    result: {
        number: string; // Requested block number
        mixHash: string; // "0x0000000000000000000000000000000000000000000000000000000000000000"
        hash: string; // "0x0000000000000000000000000000000000000000000000000000000000000000"
        parentHash: string; // "0x0000000000000000000000000000000000000000000000000000000000000000"
        nonce: string; // "0x0000000000000000"
        sha3Uncles: string; // "0x0000000000000000000000000000000000000000000000000000000000000000"
        logsBloom: string; // "0x0" + 256 zeros
        transactionsRoot: string; // "0x0000000000000000000000000000000000000000000000000000000000000000"
        stateRoot: string; // "0x0000000000000000000000000000000000000000000000000000000000000000"
        receiptsRoot: string; // "0x0000000000000000000000000000000000000000000000000000000000000000"
        miner: string; // "0x0000000000000000000000000000000000000000"
        difficulty: string; // "0x0000000000000000"
        extraData: string; // "0x0000000000000000000000000000000000000000"
        size: string; // "0x0"
        gasLimit: string; // "0x0"
        gasUsed: string; // "0x0"
        timestamp: string; // "0x0"
        transactions: unknown[]; // []
        uncles: string[]; // []
    };
    error?: {
        code: number;
        message: string;
    };
};

export class EthGetBlockByNumber extends BaseTool<Param> {
    name = 'eth_getBlockByNumber';
    description = 'Returns the block with the given number.';
    schema = schema;

    async execute({ version, blockNumber, fullTransaction }: Param): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: [blockNumber, fullTransaction],
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
