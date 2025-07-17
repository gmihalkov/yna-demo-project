import { setTimeout } from 'node:timers/promises';

import type { WebSocket } from 'ws';

import type { ProtocolMessage as Message } from './ProtocolMessage';

/**
 * Orchestrates the message sending protocol.
 *
 * The protocol here is a sequence of text messages sent with delays between them. The orchestrator takes the sequence
 * description and sends the messages using a provided WebSocket connection.
 *
 * Once the message sequence is over, the connection remains opened.
 */
export class Protocol {
  /**
   * Creates a default message sending protocol. The default protocol is:
   *
   * - Send "hello" with 2 seconds delay;
   * - Send "still here?" with 3 seconds delay;
   * - Send "you can leave now" with 3.5 seconds delay, 4 times in a row;
   */
  public static createDefault(): Protocol {
    const messages: Message[] = [
      {
        text: 'hello',
        delay: 2 * 1000,
      },
      {
        text: 'still here?',
        delay: 3 * 1000,
      },
    ];

    for (let i = 0; i < 4; i += 1) {
      messages.push({
        text: 'you can leave now',
        delay: 3.5 * 1000,
      });
    }

    return new Protocol(messages);
  }

  /**
   * Creates a protocol of sending the given sequence of messages.
   *
   * @param messages
   * The message sequence to be sent.
   */
  private constructor(private readonly messages: Message[]) {}

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
    if (connection.readyState !== connection.OPEN) {
      return;
    }

    const message = this.messages.at(index);

    if (!message) {
      return;
    }

    const { delay, text } = message;

    await setTimeout(delay);
    connection.send(text);

    await this.sendMessages(connection, index + 1);
  }
}
