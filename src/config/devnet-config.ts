import { DateTime } from 'luxon';
import z from 'zod';

export class DevnetConfig {
    static V1 = {
        EXPLORER_RPC_URL: 'https://explorer.rpc.v1.pod.network',
    };

    static MIN_TRANSACTIONS = 6;
    static MAX_TRANSACTIONS = 100;
    static HOURS_24 = 24 * 60 * 60; // 24 hours in seconds

    // Network launch timestamp: Feb 1st 2025 00:00:00 UTC
    static NETWORK_LAUNCH_TIMESTAMP = DateTime.fromISO('2025-02-01T00:00:00Z');
}

export type DevnetConfigVersion = 'V1';

export const DevnetConfigVerionZod = z
    .enum(['V1'])
    .describe('Devnet config version. if not define then set default V1');
