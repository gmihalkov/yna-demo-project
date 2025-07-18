import { readFile } from 'node:fs/promises';

import type { ProtocolMessage as Message } from './ProtocolMessage';

/**
 * Contains the methods to work with {@link Message|protocol messages}.
 */
export class ProtocolMessageHelper {
  /**
   * Reads the passed file and parses its content as a sequence of protocol messages written in JSON. If the file
   * cannot be read, or doesn't content JSON, or the JSON format is invalid, throw an error.
   *
   * @param file
   * The absolute path to the file.
   *
   * @returns
   * A sequence of protocol messages.
   */
  public static async parseFileAsMessages(file: string): Promise<Message[]> {
    let content: string;

    try {
      content = await readFile(file, { encoding: 'utf-8' });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Cannot read the file "${file}": ${error.message}`);
      }

      throw error;
    }

    return this.parseJsonAsMessages(content);
  }

  /**
   * Parses the given string as a sequence of protocol messages written in JSON. If the passed data is not a JSON
   * string, or the JSON data is incorrect, throws an error.
   *
   * @param data
   * The JSON string to be parsed.
   *
   * @returns
   * A sequence of protocol messages.
   */
  private static parseJsonAsMessages(data: string): Message[] {
    let json: unknown;

    try {
      json = JSON.parse(data);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Expect "data" to be a JSON string: ${error.message}`);
      }

      throw error;
    }

    this.expectToBeMessages(json);

    return json;
  }

  /**
   * Throws an error if the passed value is not a sequence of protocol messages. Otherwise, does nothing.
   *
   * @param data
   * The data to be checked.
   */
  private static expectToBeMessages(data: unknown): asserts data is Message[] {
    if (!Array.isArray(data)) {
      throw new Error(`Expect "data" to be an array; got ${typeof data}`);
    }

    const expectToBeMessage = this.expectToBeMessage.bind(this);
    data.forEach(expectToBeMessage);
  }

  /**
   * Throws an error if the passed value is not a protocol message. Otherwise, does nothing.
   *
   * @param data
   * The data to be checked.
   */
  private static expectToBeMessage(data: unknown): asserts data is Message {
    if (typeof data !== 'object' && data !== null) {
      throw new Error(`Expect "data" to be an object; got "${typeof data}"`);
    }

    const values = data as Record<string, unknown>;
    const { text, delay } = values;

    if (typeof text !== 'string') {
      throw new Error(`Expect "data.text" to be a string; got ${typeof text}`);
    }

    if (typeof delay !== 'number') {
      throw new Error(`Expect "data.delay" to be a number; got ${typeof delay}`);
    }

    if (delay % 1 !== 0 || delay <= 0) {
      throw new Error(`Expect "data.delay" to be a positive integer number; got ${delay}`);
    }
  }
}
