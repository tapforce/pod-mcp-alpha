import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    quorum_size: z.number().optional().describe('Number of required attestations'),
    validators: z.array(z.string()).optional().describe('List of validator public keys'),
    version: DevnetConfigVerionZod.default('V1'),
};

type Params = z.objectOutputType<typeof schema, z.ZodTypeAny>;

type Result = {
    jsonrpc: '2.0';
    result: {
        quorum_size: number;
        validators: string[];
    };
    id: number;
    error?: {
        code: number;
        message: string;
    };
};

export class PodGetCommittee extends BaseTool<Params> {
    name = 'pod_getCommittee';
    description = 'Lists the validator public keys that are part of the committee.';

    schema = schema;

    async execute({ quorum_size, validators, version }: Params): Promise<ToolResult> {
        const body = JSON.stringify({
            jsonrpc: '2.0',
            method: 'pod_getCommittee',
            params: {
                quorum_size,
                validators,
            },
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
