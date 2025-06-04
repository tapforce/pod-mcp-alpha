import { DateTime } from 'luxon';
import { DevnetConfig } from '../config/devnet-config.js';

export class Timer {
    /** Check iso string, make sure it not less than network launch time.
     * Retun iso string if true or return launch time in iso string
     */
    static MustFromLaunchTime(iso: string): string {
        const dt = DateTime.fromISO(iso);
        if (dt < DevnetConfig.NETWORK_LAUNCH_TIMESTAMP) {
            return DevnetConfig.NETWORK_LAUNCH_TIMESTAMP.toISO()!;
        }
        return dt.toISO()!;
    }
}
