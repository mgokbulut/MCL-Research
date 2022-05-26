import P5 from 'p5';

import Globals from '../../globals';

export class Noise {
  private static behavior: Noise.Behaviour;

  private static randomNoise = (): number => {
    return Math.random() - 0.5;
  };

  // this is the counter (lidarNoiseCount += lidarNoiseOffset)
  private static lidarNoiseCount: number = 0;
  private static perlinNoise = (p5: P5): number => {
    this.lidarNoiseCount += Globals.g().lidarNoiseOffset;
    return p5.noise(this.lidarNoiseCount) - 0.5;
  };

  private static noNoise = (): number => 0;

  public static getNoise = (p5: P5): number => {
    // choose noise depending on the behavior
    switch (this.behavior) {
      case Noise.Behaviour.None:
        return this.noNoise();
      case Noise.Behaviour.Perlin:
        return this.perlinNoise(p5);
      case Noise.Behaviour.Random:
        return this.randomNoise();
      // If no noise behavior is set
      default:
        return this.noNoise();
    }
  };

  public static setBehavior(behavior: Noise.Behaviour) {
    this.behavior = behavior;
  }
}

export namespace Noise {
  export enum Behaviour {
    Random,
    Perlin,
    None,
  }
}
