import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    version: DevnetConfigVerionZod.default('V1'),
    signedTx: z.string().describe('Signed transaction data in hexadecimal format'),
    timeout: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .default(0)
        .describe(
            '(Optional) Timeout in milliseconds to wait for transaction confirmation. Default is 0.'
        ),
};

type Params = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    id: number;
    result: string; // 32-byte transaction hash (or zero hash if transaction is not yet available)
};

export class EthSendRawTransaction extends BaseTool<Params> {
    name = 'eth_sendRawTransaction';
    description = 'Submits a pre-signed transaction for broadcast to the POD network.';
    schema = schema;

    async execute({ version, signedTx, timeout }: Params): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_sendRawTransaction',
            params: [signedTx, timeout],
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

        const result: Result | Error = await que;

        if (result instanceof Error) {
            throw result;
        }

        if ((result as any).error) {
            throw (result as any).error.message;
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
