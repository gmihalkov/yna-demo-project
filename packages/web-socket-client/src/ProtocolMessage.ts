/**
 * Describes a single message within the protocol.
 */
export interface ProtocolMessage {
  /**
   * The message text.
   */
  text: string;

  /**
   * The delay in milliseconds before this message will be sent.
   */
  delay: number;
}
