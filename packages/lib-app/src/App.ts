import { AppConfig } from './AppConfig';

/**
 * Represents an application that can be started and stopped using the system signals (such as SIGINT, SIGUSR, etc.).
 */
export class App {
  /**
   * Starts the application.
   */
  public static async run(): Promise<void> {
    const app = new this();

    const handleShutdown = app.handleShutdown.bind(app);
    process.once('SIGTERM', handleShutdown);
    process.once('SIGUSR2', handleShutdown);
    process.once('SIGINT', handleShutdown);

    await app.start();
  }

  /**
   * The app configuration.
   */
  protected config = AppConfig.create();

  /**
   * Starts the application.
   *
   * @virtual
   */
  protected async start(): Promise<void> {}

  /**
   * Gracefully stops the application.
   *
   * @virtual
   *
   * @returns
   * A promise that will be fulfilled once the application is stopped.
   */
  protected async stop(): Promise<void> {}

  /**
   * Indicates if the application is shutting down.
   */
  private isShuttingDown = false;

  /**
   * Gracefully stops the application on a system's shutdown signal.
   */
  private async handleShutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    await this.stop();

    process.exit(0);
  }
}
