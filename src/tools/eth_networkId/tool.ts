import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    networkId: z.string().describe('The network ID in decimal format'),
    version: DevnetConfigVerionZod.default('V1'),
};

type Param = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    result: string;
    id: number;
    error?: {
        code: number;
        message: string;
    };
};

export class NetworkId extends BaseTool<Param> {
    name = 'eth_networkId';

    description = `Retrieve the network ID from explorer.`;

    schema = schema;

    async execute({ networkId, version }: Param): Promise<ToolResult> {
        const params = {
            networkId,
        };

        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_networkId',
            params,
            id: 1,
        });

        const url = DevnetConfig[version as 'V1'].EXPLORER_RPC_URL;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(data.result),
                },
            ],
        };
    }
}
