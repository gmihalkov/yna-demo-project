/**
 * Contains the methods to work with date-time.
 */
export class TimeHelper {
  /**
   * Returns the current time.
   *
   * @returns
   * The current time.
   */
  public static getCurrentTime(): Date {
    return new Date();
  }

  /**
   * Adds to the given time the passed number of milliseconds. The passed object remains unchanged.
   *
   * @param time
   * The time.
   *
   * @param milliseconds
   * The number of milliseconds.
   *
   * @returns
   * The computed time.
   */
  public static addMilliseconds(time: Date, value: number): Date {
    return new Date(time.getTime() + value);
  }

  /**
   * Returns `true` if the given time is in the specified range (inclusively).
   *
   * @param time
   * The time to be checked.
   *
   * @param minTime
   * The beginning of the range.
   *
   * @param maxTime
   * The ending of the range.
   *
   * @returns
   * `true` or `false`.
   */
  public static isTimeBetween(time: Date, minTime: Date, maxTime: Date): boolean {
    const timestamp = time.getTime();
    const minTimestamp = minTime.getTime();
    const maxTimestamp = maxTime.getTime();
    return timestamp >= minTimestamp && timestamp <= maxTimestamp;
  }
}
