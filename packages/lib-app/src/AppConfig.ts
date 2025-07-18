import { resolve } from 'node:path';

import { config as registerEnv } from 'dotenv';
import { get } from 'env-var';

/**
 * Contains the application configuration got from the environment variables.
 */
export class AppConfig {
  /**
   * The absolute path to the monorepo's root folder.
   */
  public static readonly PROJECT_ROOT = resolve(process.cwd(), '../..');

  /**
   * The HTTP port to start the WebSocket server on.
   */
  public readonly PORT: number = get('PORT').default('8080').asPortNumber();

  /**
   * The name of the file containing a message sequence that the application sends or receives.
   */
  public readonly PROTOCOL_FILENAME: string = 'protocol.json';

  /**
   * The file that contains a message sequence to be sent.
   */
  public get PROTOCOL_FILE(): string {
    return resolve(AppConfig.PROJECT_ROOT, this.PROTOCOL_FILENAME);
  }

  /**
   * Reads and returns the application configuration.
   *
   * @returns
   * The application configuration.
   */
  public static create(): AppConfig {
    const defaultEnvFile = resolve(AppConfig.PROJECT_ROOT, '.env');
    const localEnvFile = resolve(AppConfig.PROJECT_ROOT, '.env.local');

    registerEnv({
      path: [localEnvFile, defaultEnvFile],
      quiet: true,
    });

    return new this();
  }

  /**
   * Disables to create an instance using `new`.
   */
  protected constructor() {}
}
