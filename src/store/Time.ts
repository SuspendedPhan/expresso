import wu from 'wu';
import { DateTime, Duration } from 'luxon';
import { Root } from './Root';

export default class Time {

  frameTime = DateTime.utc();
  universeLifespan = Duration.fromMillis(1000);

  constructor(private root: Root) {}

  getElapsedUniverseTime() {
    const millis = this.frameTime.toMillis() % this.universeLifespan.as('millisecond');
    return Duration.fromMillis(millis);
  }

  getUniverseLifespan() {
    return this.universeLifespan;
  }

  setFrameTime(utcTime) {
    this.frameTime = utcTime;
  }
}
