import { AppConfig } from './AppConfig';
import { Protocol } from './Protocol';

/**
 * The main class of the application. It allows you to start the WebSocket server supporting the message sending
 * protocol, and gracefully stop the server by an external command.
 */
export class App {
  /**
   * Starts the application.
   */
  public static start(): void {
    const app = new App();

    const handleShutdown = app.handleShutdown.bind(app);
    process.once('SIGTERM', handleShutdown);
    process.once('SIGUSR2', handleShutdown);
    process.once('SIGINT', handleShutdown);

    app.run();
  }

  /**
   * The app configuration.
   */
  private config = new AppConfig();

  /**
   * The {@link Protocol|message sending protocol} to be executed for a newly connected client.
   */
  private protocol = Protocol.createDefault();

  /**
   * The WebSocket client to listen messages from the server.
   */
  private client!: WebSocket;

  /**
   * Starts the application instance.
   */
  private async run(): Promise<void> {
    const url = `http://localhost:${this.config.PORT}`;
    this.client = new WebSocket(url);

    console.debug(`Starting to listen ${url}...`);
    await this.protocol.wait(this.client);

    console.debug('The message sequence is over; exiting...');
  }

  /**
   * Gracefully stops the application on a system's shutdown signal.
   */
  private handleShutdown(): void {
    this.stop();

    console.debug('The client is stopped');
    process.exit(0);
  }

  /**
   * Gracefully stops the started WebSocket service. This method can be safely called even if the server is closing or
   * is already closed.
   *
   * @returns
   * A promise that will be fulfilled once the service is closed.
   */
  private async stop(): Promise<void> {
    if (this.client) {
      this.client.close();
    }
  }
}
