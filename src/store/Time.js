import wu from 'wu';
import { DateTime, Duration } from 'luxon';

export default class Time {
  /**
  * @param {RootStore} root 
  */
  constructor(root) {
    this.root = root;
    this.frameTime = DateTime.utc();
    this.universeLifespan = Duration.fromMillis(5000);
  }

  getElapsedUniverseTime() {
    const millis = this.frameTime.toMillis() % this.universeLifespan.as('millisecond');
    return Duration.fromMillis(millis);
  }

  setFrameTime(utcTime) {
    this.frameTime = utcTime;
  }
}
