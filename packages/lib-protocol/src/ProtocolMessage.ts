/**
 * Describes a single message of the protocol sequence.
 */
export interface ProtocolMessage {
  /**
   * The message text.
   */
  text: string;

  /**
   * The delay in milliseconds before this message will be sent or received.
   */
  delay: number;
}
