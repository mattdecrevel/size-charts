/**
 * Structured logger for Size Charts
 *
 * Provides JSON logging for production and pretty logging for development.
 * Supports log levels: error, warn, info, debug
 */

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
	level: LogLevel;
	message: string;
	timestamp: string;
	[key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
	error: 0,
	warn: 1,
	info: 2,
	debug: 3,
};

/**
 * Get the configured log level from environment
 */
function getLogLevel(): LogLevel {
	const level = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
	if (level && LOG_LEVELS[level] !== undefined) {
		return level;
	}
	return process.env.NODE_ENV === "production" ? "info" : "debug";
}

/**
 * Check if logs should be formatted as JSON
 */
function isJsonFormat(): boolean {
	const format = process.env.LOG_FORMAT?.toLowerCase();
	if (format === "json") return true;
	if (format === "pretty") return false;
	// Default to JSON in production, pretty in development
	return process.env.NODE_ENV === "production";
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
	const configuredLevel = getLogLevel();
	return LOG_LEVELS[level] <= LOG_LEVELS[configuredLevel];
}

/**
 * Format a log entry
 */
function formatLog(entry: LogEntry): string {
	if (isJsonFormat()) {
		return JSON.stringify(entry);
	}

	// Pretty format for development
	const levelColors: Record<LogLevel, string> = {
		error: "\x1b[31m", // Red
		warn: "\x1b[33m",  // Yellow
		info: "\x1b[36m",  // Cyan
		debug: "\x1b[90m", // Gray
	};
	const reset = "\x1b[0m";
	const color = levelColors[entry.level];

	const { level, message, timestamp, ...rest } = entry;
	const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";

	return `${color}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}${extra}`;
}

/**
 * Create a log entry and output it
 */
function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
	if (!shouldLog(level)) return;

	const entry: LogEntry = {
		level,
		message,
		timestamp: new Date().toISOString(),
		...context,
	};

	const output = formatLog(entry);

	switch (level) {
		case "error":
			console.error(output);
			break;
		case "warn":
			console.warn(output);
			break;
		default:
			console.log(output);
	}
}

/**
 * Logger instance with level methods
 */
export const logger = {
	/**
	 * Log an error message
	 */
	error(message: string, context?: Record<string, unknown>) {
		log("error", message, context);
	},

	/**
	 * Log a warning message
	 */
	warn(message: string, context?: Record<string, unknown>) {
		log("warn", message, context);
	},

	/**
	 * Log an info message
	 */
	info(message: string, context?: Record<string, unknown>) {
		log("info", message, context);
	},

	/**
	 * Log a debug message
	 */
	debug(message: string, context?: Record<string, unknown>) {
		log("debug", message, context);
	},

	/**
	 * Log an API request
	 */
	request(method: string, path: string, context?: Record<string, unknown>) {
		log("info", `${method} ${path}`, { type: "request", ...context });
	},

	/**
	 * Log an API response
	 */
	response(method: string, path: string, status: number, durationMs: number, context?: Record<string, unknown>) {
		const level: LogLevel = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
		log(level, `${method} ${path} ${status} ${durationMs}ms`, { type: "response", status, durationMs, ...context });
	},

	/**
	 * Create a child logger with preset context
	 */
	child(defaultContext: Record<string, unknown>) {
		return {
			error: (message: string, context?: Record<string, unknown>) =>
				log("error", message, { ...defaultContext, ...context }),
			warn: (message: string, context?: Record<string, unknown>) =>
				log("warn", message, { ...defaultContext, ...context }),
			info: (message: string, context?: Record<string, unknown>) =>
				log("info", message, { ...defaultContext, ...context }),
			debug: (message: string, context?: Record<string, unknown>) =>
				log("debug", message, { ...defaultContext, ...context }),
		};
	},
};

export default logger;
