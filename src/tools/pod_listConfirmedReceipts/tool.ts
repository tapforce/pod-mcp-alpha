import {
    DevnetConfig,
    DevnetConfigVerionZod
} from '$config/devnet-config';
import { BaseTool, type ToolResult } from '$lib/base-tool';
import { DateTime } from 'luxon';
import z from 'zod';

const schema = {
    version: DevnetConfigVerionZod.default('V1').describe(
        'Choose version of explorer API, default is V1'
    ),
    since: z
        .string()
        .min(1, 'since is required')
        .describe(
            `ISO string representing the start of the range to query.
            The value should not after current time.`
        ),
    cursor: z
        .string()
        .optional()
        .describe(
            `Cursor for pagination.
            If provided, the query will start from the cursor.`
        ),
    limit: z
        .number()
        .optional()
        .describe(
            `Limit for pagination.
            Because result value usually large, it is recommended to set limit to a small value.
            When asking first or last receipt, should put limit to 1 as possible.`
        ),
    newest_first: z
        .boolean()
        .optional()
        .describe(
            `Sort by newest first.
            Note: if cursor is provided, this parameter will be ignored.`
        ),
};

type Params = z.objectOutputType<typeof schema, z.ZodTypeAny>;

type Result = {
    jsonrpc: '2.0';
    result: {
        items: any[];
        next_cursor?: string;
    };
    error?: {
        code: number;
        message: string;
    };
};

export class PodListConfirmReceipts extends BaseTool<Params> {
    name = 'pod_listConfirmedReceipts';

    description = `Retrieve list of confirm receipts from explorer.`;

    schema = schema;

    async execute({ since, cursor, limit, newest_first, version }: Params): Promise<ToolResult> {
        // convert since from iso string to timestamp in microsecond
        const sinceTimestamp = DateTime.fromISO(since).toMillis() * 1000;

        const url = DevnetConfig[version].EXPLORER_RPC_URL;

        // fetch result
        const que = fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'pod_listConfirmedReceipts',
                params: {
                    since: sinceTimestamp,
                    pagination: {
                        cursor,
                        limit,
                        ...(cursor ? {} : { newest_first: newest_first ?? false }),
                    },
                },
                id: 1,
            }),
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
