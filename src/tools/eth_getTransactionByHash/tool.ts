import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, type ToolExtra, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    version: DevnetConfigVerionZod.default('V1'),
    hash: z.string().describe('32-byte transaction hash'),
};

type Params = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    id: number;
    /**
     * The transaction object returned by the RPC call.
     * If the transaction hash is not found, this will be null.
     */
    result: {
        /** 32-byte hash of the transaction */
        hash: string;
        /** The number of transactions made by the sender prior to this one */
        nonce: string;
        /** Hash of the block where this transaction was included, or null if pending */
        blockHash: string | null;
        /** Block number where this transaction was included, or null if pending */
        blockNumber: string | null;
        /** Transaction index within the block, or null if pending */
        transactionIndex: string | null;
        /** 20-byte address of the sender */
        from: string;
        /** 20-byte address of the recipient, or null if contract creation */
        to: string | null;
        /** Value transferred in wei */
        value: string;
        /** Gas price provided by the sender in wei */
        gasPrice: string;
        /** Gas provided by the sender */
        gas: string;
        /** Input data sent with the transaction */
        input: string;
        /** ECDSA recovery id */
        v: string;
        /** ECDSA signature r value */
        r: string;
        /** ECDSA signature s value */
        s: string;
        /** Additional pod-specific metadata */
        pod_metadata: { [key: string]: unknown };
    } | null;
    error?: {
        code: number;
        message: string;
    };
};

export class EthGetTransactionByHash extends BaseTool<Params> {
    name = 'eth_getTransactionByHash';
    description = 'Returns information about a transaction by its hash.';
    schema = schema;

    async execute(args: Params, extra: ToolExtra): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [args.hash],
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
                    text: JSON.stringify(result.result),
                },
            ],
        };  
    }
}
    