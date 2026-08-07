type LogLevel = 'info' | 'warn' | 'error';

type LogFields = Record<string, unknown>;

export function logApi(
  route: string,
  level: LogLevel,
  message: string,
  fields: LogFields = {}
): void {
  const entry = {
    ts: new Date().toISOString(),
    route,
    level,
    message,
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export function logApiError(route: string, err: unknown, fields: LogFields = {}): void {
  logApi(route, 'error', err instanceof Error ? err.message : 'Unknown error', {
    ...fields,
    stack: err instanceof Error ? err.stack : undefined,
  });
}
