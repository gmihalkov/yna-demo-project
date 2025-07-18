import { setTimeout } from 'node:timers/promises';

import { Protocol as BaseProtocol } from '@/lib-protocol';

import { TimeHelper } from './TimeHelper';

/**
 * Orchestrates the receiving of message sequence from the specified WebSocket server.
 */
export class Protocol extends BaseProtocol {
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
    if (this.isDisconnected(client)) {
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

    const messagePromise = this.read(client);
    const timeoutPromise = setTimeout(expectedDelay + allowedTimeSpan);

    const actualText = await Promise.race([messagePromise, timeoutPromise]);
    const actualTime = TimeHelper.getCurrentTime();

    if (this.isDisconnected(client)) {
      return;
    }

    const isMessageValid =
      actualText === expectedText && TimeHelper.isTimeBetween(actualTime, minAllowedTime, maxAllowedTime);

    if (!isMessageValid) {
      console.error(
        `Protocol ERR: expected "${expectedText}” between ${minAllowedTime.toISOString()} and ${maxAllowedTime.toISOString()}`,
      );
      return;
    }

    console.info(`Protocol OK: "${actualText}" received at ${actualTime.toISOString()}`);

    await this.waitMessages(client, index + 1);
  }
}
