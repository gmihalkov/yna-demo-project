import { setTimeout } from 'node:timers/promises';
import type { ProtocolMessage as Message } from './ProtocolMessage';
import { TimeHelper } from './TimeHelper';

/**
 * Orchestrates the receiving of message sequence from the specified WebSocket server.
 */
export class Protocol {
  /**
   * Creates a default message receiving protocol. The default protocol is:
   *
   * - Receive "hello" with 2 seconds delay;
   * - Receive "still here?" with 3 seconds delay;
   * - Receive "you can leave now" with 3.5 seconds delay, 4 times in a row;
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
   * Creates a protocol of receiving the passed message sequence from a WebSocket server.
   *
   * @param messages
   * The expected message sequence to be received.
   */
  public constructor(private readonly messages: Message[]) {}

  /**
   * Connects to the WebSocket server and logs the expected message sequence.
   *
   * @param client
   * The WebSocket client to listen messages.
   *
   * @returns
   * A promise that will be fulfilled once the all expected message sequence is received.
   */
  public async wait(client: WebSocket): Promise<void> {
    await this.connect(client);
    await this.waitMessages(client);
    this.disconnect(client);
  }

  /**
   * Waits until the passed client connects the WebSocket server.
   *
   * @param client
   * The client to wait it's connection.
   *
   * @returns
   * A WebSocket client's connection event.
   */
  private connect(client: WebSocket): Promise<void> {
    if (client.readyState !== client.CONNECTING) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const handleEvent = (): void => resolve();
      client.addEventListener('open', handleEvent);
    });
  }

  /**
   * Safely disconnects the given client from the server.
   *
   * @param client
   * The client to be disconnected.
   */
  private disconnect(client: WebSocket): void {
    if (client.readyState !== client.CONNECTING && client.readyState !== client.OPEN) {
      return;
    }

    client.close();
  }

  /**
   * Recursively receives the expected sequence of messages from the server and logs them. If any received message
   * doesn't match with the expected one, or the expected message didn't came in time (+/- 300ms gap), logs an error.
   *
   * @param client
   * The WebSocket client to listen messages.
   *
   * @param index
   * The sequence index of the message that we're checking at the current iteration.
   *
   * @returns
   * A promise that is fulfilled once the message sequence is over or invalid.
   */
  private async waitMessages(client: WebSocket, index = 0): Promise<void> {
    if (client.readyState !== client.OPEN) {
      return;
    }

    const message = this.messages.at(index);

    if (!message) {
      return;
    }

    const { text: expectedText, delay: expectedDelay } = message;

    const allowedTimeSpan = 300;

    const currentTime = TimeHelper.getCurrentTime();
    const expectedTime = TimeHelper.addMilliseconds(currentTime, expectedDelay);
    const minAllowedTime = TimeHelper.addMilliseconds(expectedTime, -allowedTimeSpan);
    const maxAllowedTime = TimeHelper.addMilliseconds(expectedTime, allowedTimeSpan);

    const messagePromise = this.takeMessage(client);
    const timeoutPromise = setTimeout(expectedDelay + allowedTimeSpan);

    const actualText = await Promise.race([messagePromise, timeoutPromise]);
    const actualTime = TimeHelper.getCurrentTime();

    if (client.readyState !== client.OPEN) {
      return;
    }

    if (actualText !== expectedText || !TimeHelper.isTimeBetween(actualTime, minAllowedTime, maxAllowedTime)) {
      console.error(
        `Protocol ERR: expected "${expectedText}” between ${minAllowedTime.toISOString()} and ${maxAllowedTime.toISOString()}`,
      );
      return;
    }

    console.info(`Protocol OK: "${actualText}" received at ${actualTime.toISOString()}`);

    await this.waitMessages(client, index + 1);
  }

  /**
   * Waits for the first message from the WebSocket server, and returns it.
   *
   * @param client
   * The WebSocket client to listen messages.
   *
   * @returns
   * A first message came from the server.
   */
  private takeMessage(client: WebSocket): Promise<string | undefined> {
    if (client.readyState !== client.OPEN) {
      return Promise.resolve(undefined);
    }

    return new Promise<string>((resolve) => {
      const handleEvent = (event: MessageEvent): void => {
        client.removeEventListener('message', handleEvent);
        resolve(event.data);
      };

      client.addEventListener('message', handleEvent);
    });
  }
}
