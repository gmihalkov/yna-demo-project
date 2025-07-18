import { resolve } from 'node:path';

import { get } from 'env-var';

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
  public readonly PROTOCOL_FILE = resolve(process.cwd(), './protocol.json');
}
