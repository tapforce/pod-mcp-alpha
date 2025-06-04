export interface JsonRpcPayload {
    jsonrpc: '2.0';
    method: string;
    params?: unknown;
    id?: string | number | null;
}

export interface JsonRpcSuccessResponse<T = unknown> {
    jsonrpc: '2.0';
    result: T;
    id: string | number | null;
}

export interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
}

export interface JsonRpcErrorResponse {
    jsonrpc: '2.0';
    error: JsonRpcError;
    id: string | number | null;
}
