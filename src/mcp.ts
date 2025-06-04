import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { EthBlockNumber } from 'tools/eth_blockNumber/tool';
import { EthChainId } from 'tools/eth_chainId/tool';
import { EthEstimateGas } from 'tools/eth_estimateGas/tool';
import { EthGasPrice } from 'tools/eth_gasPrice/tool';
import { EthGetBalance } from 'tools/eth_getBalance/tool';
import { EthGetBlockByHash } from 'tools/eth_getBlockByHash/tool';
import { EthGetBlockByNumber } from 'tools/eth_getBlockByNumber/tool';
import { EthGetLogs } from 'tools/eth_getLogs/tool';
import { EthGetTransactionByHash } from 'tools/eth_getTransactionByHash/tool';
import { EthGetTransactionCount } from 'tools/eth_getTransactionCount/tool';
import { EthGetTransactionReceipt } from 'tools/eth_getTransactionReceipt/tool';
import { EthSendRawTransaction } from 'tools/eth_sendRawTransaction/tool';
import { PodGetCommittee } from 'tools/pod_getCommittee/tool';
import { PodListAccountReceipts } from 'tools/pod_listAccountReceipts/tool';
import { PodListConfirmReceipts } from 'tools/pod_listConfirmedReceipts/tool';
import { PodMetrics } from 'tools/pod_metrics/tool';

export const createMcp = () => {
    // Create server instance
    const server = new McpServer({
        name: 'pod-mcp-alpha',
        version: '1.0.0',
        capabilities: {
            resources: {},
            tools: {},
        },
    });

    // TOOLS
    new PodListConfirmReceipts().register(server);
    new PodMetrics().register(server);
    new PodGetCommittee().register(server);
    new EthGetBalance().register(server);
    new PodListAccountReceipts().register(server);
    new EthGetTransactionCount().register(server);
    new EthBlockNumber().register(server);
    new EthChainId().register(server);
    new EthEstimateGas().register(server);
    new EthGasPrice().register(server);
    new EthGetBlockByHash().register(server);
    new EthGetBlockByNumber().register(server);
    new EthGetLogs().register(server);
    new EthGetTransactionByHash().register(server);
    new EthGetTransactionReceipt().register(server);
    new EthSendRawTransaction().register(server);

    return server;
};
