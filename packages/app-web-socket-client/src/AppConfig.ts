import { AppConfig as BaseAppConfig } from '@/lib-app';

/**
 * The client application configuration.
 */
export class AppConfig extends BaseAppConfig {
  /**
   * @inheritdoc
   */
  public readonly PROTOCOL_FILENAME = 'protocol-client.json';
}
