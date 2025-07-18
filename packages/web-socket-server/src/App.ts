import { WebSocketServer } from 'ws';

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
   * The underlying WebSocket server.
   */
  private server?: WebSocketServer;

  /**
   * Starts the application instance.
   */
  private async run(): Promise<void> {
    const protocol = await Protocol.fromFile(this.config.PROTOCOL_FILE);
    const handleConnection = this.handleConnection.bind(this, protocol);

    this.server = new WebSocketServer({ port: this.config.PORT });
    this.server.on('connection', handleConnection);

    console.debug(`The WebSocket service is started at http://localhost:${this.config.PORT}`);
  }

  /**
   * Sends the message sequence to the newly connected client.
   *
   * @param connection
   * The new client's connection.
   */
  private async handleConnection(protocol: Protocol, connection: WebSocket): Promise<void> {
    await protocol.execute(connection);
  }

  /**
   * Gracefully stops the application on a system's shutdown signal.
   */
  private async handleShutdown(): Promise<void> {
    await this.stop();

    console.debug('The server is stopped');
    process.exit(0);
  }

  /**
   * The promise that will be fulfilled once the WebSocket is closed.
   */
  private stopping?: Promise<void>;

  /**
   * Gracefully stops the started WebSocket service. This method can be safely called even if the server is closing or
   * is already closed.
   *
   * @returns
   * A promise that will be fulfilled once the service is closed.
   */
  private async stop(): Promise<void> {
    if (this.stopping) {
      return this.stopping;
    }

    this.stopping = new Promise<void>((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    return this.stopping;
  }
}
