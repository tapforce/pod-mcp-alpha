import { DevnetConfig, DevnetConfigVerionZod } from '$config/devnet-config';
import { BaseTool, ToolExtra, type ToolResult } from '$lib/base-tool';
import z from 'zod';

const schema = {
    address: z.string().describe('20-byte address'),
    since: z
        .string()
        .describe(
            'Timestamp specified in microseconds representing the start of the range to query'
        ),
    cursor: z.string().optional().describe('(optional) Cursor to start the query from.'),
    limit: z.number().optional().describe('(optional) Maximum number of receipts to return.'),
    newest_first: z
        .boolean()
        .default(true)
        .describe(
            `(optional) Whether to start the query from the most recent receipts.
            Note: If cursor is provided, newest_first must NOT be provided.`
        ),
    version: DevnetConfigVerionZod.default('V1'),
};

type Param = z.objectOutputType<typeof schema, z.ZodTypeAny>;
type Result = {
    jsonrpc: '2.0';
    id: number;
    result: {
        items: any[];
        next_cursor: string;
    };
    error?: {
        code: number;
        message: string;
    };
};

export class PodListAccountReceipts extends BaseTool<Param> {
    name = 'pod_listAccountReceipts';
    description = 'List account receipts';
    schema = schema;

    async execute(args: Param, extra: ToolExtra): Promise<ToolResult> {
        
            const body = JSON.stringify({
                jsonrpc: '2.0',
                method: 'pod_listAccountReceipts',
                params: {
                    address: args.address,
                    since: args.since,
                    pagination: {
                        cursor: args.cursor,
                        limit: args.limit,
                        ...(args.cursor ? {} : { newest_first: args.newest_first }),
                    },
                },
                id: 1,
            });

            const url = DevnetConfig[args.version].EXPLORER_RPC_URL;

            const que = fetch(url, {
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
                throw new Error(result.error.message);
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
