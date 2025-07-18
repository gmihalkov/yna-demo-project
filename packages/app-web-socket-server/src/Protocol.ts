import { setTimeout } from 'node:timers/promises';

import { Protocol as BaseProtocol } from '@/lib-protocol';

/**
 * Orchestrates the message sending protocol.
 *
 * The protocol here is a sequence of text messages sent with delays between them. The orchestrator takes the sequence
 * description and sends the messages using a provided WebSocket connection.
 *
 * Once the message sequence is over, the connection remains opened.
 */
export class Protocol extends BaseProtocol {
  /**
   * Sends the messages using the provided Web Socket connection.
   *
   * @param connection
   * The connection to send messages.
   */
  public async execute(connection: WebSocket): Promise<void> {
    await this.sendMessages(connection);
  }

  /**
   * Recursively sends all messages of the general sequence. Returns a promise that is fulfilled once the all messages
   * are sent.
   *
   * If the passed connection is not in the "OPEN" state, no messages will be sent.
   *
   * @param connection
   * The WebSocket connection to send messages to.
   *
   * @param index
   * The sequence index of the message to be sent at the current iteration.
   */
  private async sendMessages(connection: WebSocket, index: number = 0): Promise<void> {
    if (this.isDisconnected(connection)) {
      return;
    }

    const message = this.messages.at(index);

    if (!message) {
      return;
    }

    const { delay, text } = message;

    await setTimeout(delay);
    await this.send(connection, text);

    await this.sendMessages(connection, index + 1);
  }
}
