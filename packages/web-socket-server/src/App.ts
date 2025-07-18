import { WebSocketServer } from 'ws';

import { App as BaseApp } from '@/lib-app';

import { Protocol } from './Protocol';

/**
 * The main class of the application. It allows you to start the WebSocket server supporting the message sending
 * protocol, and gracefully stop the server by an external command.
 */
export class App extends BaseApp {
  /**
   * The underlying WebSocket server.
   */
  private server?: WebSocketServer;

  /**
   * @inheritdoc
   */
  protected async start(): Promise<void> {
    const protocol = await Protocol.fromFile(this.config.PROTOCOL_FILE);

    this.server = new WebSocketServer({ port: this.config.PORT });

    const handleConnection = protocol.execute.bind(protocol);
    this.server.on('connection', handleConnection);

    console.debug(`The WebSocket service is started at http://localhost:${this.config.PORT}`);
  }

  /**
   * @inheritdoc
   */
  protected async stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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
  }
}
