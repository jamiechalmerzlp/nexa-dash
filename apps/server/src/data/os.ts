import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { OsInfo } from '@nexadash/common';
import * as si from 'systeminformation';
import { refreshHostOsRelease } from '../utils';

const execp = promisify(exec);

export default {
  static: async (): Promise<OsInfo> => {
    try {
      await refreshHostOsRelease();
    } catch (err) {
      console.warn(
        'Cannot refresh /etc/os-release (os results may be outdated):',
        err,
      );
    }
    const osInfo = await si.osInfo();

    const buildInfo = JSON.parse(
      (await execp('cat version.json')
        .then(({ stdout }) => stdout)
        .catch(() => undefined)) ?? '{}',
    );
    const gitHash = await execp('git log -1 --format="%H"')
      .then(({ stdout }) => stdout.trim())
      .catch(() => undefined);
    const nexadash_version = buildInfo.version ?? 'unknown';
    const nexadash_buildhash = buildInfo.buildhash ?? gitHash;

    return {
      arch: osInfo.arch,
      distro: osInfo.distro,
      kernel: osInfo.kernel,
      platform: osInfo.platform,
      release:
        osInfo.release === 'unknown'
          ? osInfo.build || 'unknown'
          : osInfo.release,
      uptime: 0,
      nexadash_version,
      nexadash_buildhash,
    };
  },
};
