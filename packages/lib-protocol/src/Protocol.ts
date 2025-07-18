import type { ProtocolMessage as Message } from './ProtocolMessage';
import { ProtocolMessageHelper } from './ProtocolMessageHelper';

type AnyProtocol = new (messages: Message[]) => Protocol;

/**
 * Orchestrates the receiving or sending of message sequence using the provided WebSocket client.
 */
export class Protocol {
  /**
   * Takes a message sequence to be sent / received from the provided file, and creates an instance of the protocol
   * with it.
   *
   * @param file
   * The absolute path to the file.
   *
   * @returns
   * A protocol that uses the message sequence from the given file.
   */
  public static async fromFile<T extends AnyProtocol>(this: T, file: string): Promise<InstanceType<T>> {
    const messages = await ProtocolMessageHelper.parseFileAsMessages(file);
    return new this(messages) as InstanceType<T>;
  }

  /**
   * Creates a protocol that sends or receives the passed message sequence.
   *
   * @param messages
   * The message sequence.
   */
  public constructor(protected readonly messages: Message[]) {}

  /**
   * Returns `true` if the given client is connected to the server.
   *
   * @param client
   * The client to check.
   *
   * @returns
   * `true` or `false`.
   */
  protected isConnected(client: WebSocket): boolean {
    return client.readyState === client.OPEN;
  }

  /**
   * Returns `true` if the given client is disconnected from the server.
   *
   * @param client
   * The client to check.
   *
   * @returns
   * `true` or `false`.
   */
  protected isDisconnected(client: WebSocket): boolean {
    return !this.isConnected(client);
  }

  /**
   * Returns a promise that will be fulfilled once the passed client is connected to the server. If the client is
   * already connected or disconnected from the server, the promise will be resolved immediately.
   *
   * @param client
   * The client to be connected to the server.
   */
  protected async connect(client: WebSocket): Promise<void> {
    if (client.readyState !== client.CONNECTING) {
      return;
    }

    await new Promise((resolve) => {
      client.addEventListener('open', resolve);
    });
  }

  /**
   * Disconnects the given client from the server. If the client is already disconnected, the result promise will be
   * resolved immediately.
   *
   * @param client
   * The client to be disconnected.
   */
  protected async disconnect(client: WebSocket): Promise<void> {
    if (client.readyState === client.CONNECTING || client.readyState === client.OPEN) {
      client.close();
    }
  }

  /**
   * Waits for the next message from the server and returns it. If the client is already disconnected from the server,
   * returns `undefined`.
   *
   * @param client
   * The client to listen messages from the server.
   *
   * @returns
   * A message text or `undefined`.
   */
  protected async read(client: WebSocket): Promise<string | undefined> {
    if (client.readyState !== client.OPEN) {
      return undefined;
    }

    return new Promise<string>((resolve) => {
      const handleEvent = (event: MessageEvent): void => {
        client.removeEventListener('message', handleEvent);
        resolve(event.data);
      };

      client.addEventListener('message', handleEvent);
    });
  }

  /**
   * Sends the given message to the server.
   *
   * @param client
   * The client to send a message.
   *
   * @param message
   * The message to be sent.
   */
  protected async send(client: WebSocket, message: string): Promise<void> {
    if (client.readyState !== client.OPEN) {
      return;
    }

    client.send(message);
  }
}
