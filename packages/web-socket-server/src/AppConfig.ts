import { get } from 'env-var';

/**
 * Contains the application configuration got from the environment variables.
 */
export class AppConfig {
  /**
   * The HTTP port to start the WebSocket server on.
   */
  public readonly PORT = get('PORT').default('8080').asPortNumber();
}
