type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
}

function formatEntry(entry: LogEntry): string {
  const base = `[${entry.level.toUpperCase()}] ${entry.message}`
  return entry.context ? `${base} ${JSON.stringify(entry.context)}` : base
}

function shouldLog(level: LogLevel): boolean {
  if (level === 'debug') return process.env.NODE_ENV === 'development'
  return true
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (!shouldLog(level)) return
  const entry: LogEntry = context ? { level, message, context } : { level, message }
  const formatted = formatEntry(entry)

  if (level === 'error') console.error(formatted)
  else if (level === 'warn') console.warn(formatted)
  else console.log(formatted)
}

export const logger = {
  error: (message: string, context?: Record<string, unknown>): void => { log('error', message, context) },
  warn: (message: string, context?: Record<string, unknown>): void => { log('warn', message, context) },
  info: (message: string, context?: Record<string, unknown>): void => { log('info', message, context) },
  debug: (message: string, context?: Record<string, unknown>): void => { log('debug', message, context) },
}
