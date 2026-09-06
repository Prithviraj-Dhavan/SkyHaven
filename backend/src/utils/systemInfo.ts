const SERVER_START_TIME = new Date();

export interface SystemTelemetry {
  serverStartTime: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  nodeVersion: string;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
}

/**
 * Formats a duration in seconds into a human-readable string (e.g. "2h 15m 30s")
 */
export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(' ');
}

/**
 * Returns current process memory metrics and uptime telemetry
 */
export function getSystemTelemetry(): SystemTelemetry {
  const uptimeSec = Math.floor(process.uptime());
  const mem = process.memoryUsage();

  return {
    serverStartTime: SERVER_START_TIME.toISOString(),
    uptimeSeconds: uptimeSec,
    uptimeFormatted: formatUptime(uptimeSec),
    nodeVersion: process.version,
    memory: {
      heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMB: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      rssMB: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
    },
  };
}
