import { AppConfig as BaseAppConfig } from '@/lib-app';

/**
 * The server application configuration.
 */
export class AppConfig extends BaseAppConfig {
  /**
   * @inheritdoc
   */
  public readonly PROTOCOL_FILENAME = 'protocol-server.json';
}
