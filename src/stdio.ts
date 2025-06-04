import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcp } from 'mcp';

async function main() {
    const transport = new StdioServerTransport();
    await createMcp().connect(transport);
    console.error('Pod MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
