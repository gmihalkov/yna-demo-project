import { App as BaseApp } from '@/lib-app';

import { Protocol } from './Protocol';

/**
 * The main class of the application. It allows you to start the WebSocket server supporting the message sending
 * protocol, and gracefully stop the server by an external command.
 */
export class App extends BaseApp {
  /**
   * The WebSocket client to listen messages from the server.
   */
  private client!: WebSocket;

  /**
   * @inheritdoc
   */
  protected async start(): Promise<void> {
    const protocol = await Protocol.fromFile(this.config.PROTOCOL_FILE);

    const url = `http://localhost:${this.config.PORT}`;
    this.client = new WebSocket(url);

    await protocol.wait(this.client);
  }

  /**
   * @inheritdoc
   */
  protected async stop(): Promise<void> {
    this.client.close();
  }
}
