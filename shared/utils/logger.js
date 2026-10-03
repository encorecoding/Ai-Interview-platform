/**
 * Standardized logger for microservices
 */

function formatLog(level, service, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${service}]: ${message}${metaStr}`;
}

function createLogger(serviceName = 'service') {
  return {
    info: (msg, meta) => console.log(formatLog('info', serviceName, msg, meta)),
    warn: (msg, meta) => console.warn(formatLog('warn', serviceName, msg, meta)),
    error: (msg, meta) => console.error(formatLog('error', serviceName, msg, meta)),
    debug: (msg, meta) => {
      if (process.env.DEBUG) console.debug(formatLog('debug', serviceName, msg, meta));
    },
  };
}

module.exports = { createLogger };
