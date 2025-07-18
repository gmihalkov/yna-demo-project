import { resolve } from 'node:path';

import { config as registerEnv } from 'dotenv';
import { get } from 'env-var';

const PROCESS_CWD = process.cwd();

/**
 * Contains the application configuration got from the environment variables.
 */
export class AppConfig {
  /**
   * The HTTP port to start the WebSocket server on.
   */
  public readonly PORT = get('PORT').default('8080').asPortNumber();

  /**
   * The file that contains a message sequence to be sent.
   */
  public readonly PROTOCOL_FILE = resolve(PROCESS_CWD, './protocol.json');

  /**
   * Reads and returns the application configuration.
   *
   * @returns
   * The application configuration.
   */
  public static create(): AppConfig {
    registerEnv({
      path: [resolve(PROCESS_CWD, '../../.env.local'), resolve(PROCESS_CWD, '../../.env')],
      quiet: true,
    });

    return new this();
  }

  /**
   * Disables to create an instance using `new`.
   */
  private constructor() {}
}
