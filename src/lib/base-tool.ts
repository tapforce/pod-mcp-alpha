import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type {
    CallToolResult,
    ServerNotification,
    ServerRequest,
} from '@modelcontextprotocol/sdk/types.js';
import type { ZodRawShape } from 'zod';

export type ToolExtra = RequestHandlerExtra<ServerRequest, ServerNotification>;
export type ToolResult = CallToolResult;

export abstract class BaseTool<T> {
    abstract name: string;
    abstract description: string;
    abstract schema: ZodRawShape;

    abstract execute(args: T, extra: ToolExtra): ToolResult | Promise<ToolResult>;

    register(server: McpServer) {
        server.tool(this.name, this.description, this.schema, async (args, extra) => {
            try {
                const r = await this.execute(args as never, extra);
                return r;
            } catch (e) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: e instanceof Error ? e.message : String(e),
                        },
                    ],
                };
            }
        });
    }
}
