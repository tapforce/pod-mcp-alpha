import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    version: DevnetConfigVerionZod.default('V1'),
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

export class EthGasPrice extends BaseTool<Params> {
    name = 'eth_gasPrice';
    description = `Returns the current gas price. 
    Return: String - Current gas price in wei (hexadecimal format)`;

    schema = schema;

    async execute({ version }: Params): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_gasPrice',
            params: [],
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
