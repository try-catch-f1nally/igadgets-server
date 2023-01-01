export default interface Logger {
  info(message: string): void;

  warn(message: string): void;

  error(message: string, error?: unknown): void;

  debug(message: string, error?: unknown): void;

  trace(message: string): void;
}
