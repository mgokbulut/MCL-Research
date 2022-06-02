import P5, { Color, Vector } from 'p5';

import Globals from '../../globals';
import Boundary from '../core/boundary';
import { Noise } from '../core/noise';
import Ray from '../core/ray';

export class LidarSensor {
  private p5: P5;
  private visual: Lidar.Visual;

  private rays: Array<Ray>;
  private position: Vector;
  private direction: Vector;

  // Results from Boundary detection
  private lidarReading: Array<Vector>;
  private lidarDistances: Array<number>;

  public constructor(p5: P5, position: Vector, direction: Vector) {
    this.p5 = p5;
    this.position = position;
    this.direction = direction;
    this.lidarReading = Array<Vector>(Globals.g().lidarSampling);
    this.lidarDistances = Array<number>(Globals.g().lidarSampling);

    this.rays = Array<Ray>(Globals.g().lidarSampling);
    this.rotateLidar((x: number, y: number, i: number) => {
      this.rays[i] = new Ray(this.p5.createVector(x, y));
    });
  }

  private rotateLidar = (
    changeFunction: (x: number, y: number, i: number) => void
  ): void => {
    let i: number = 0;
    for (
      let angle = -Globals.g().lidarAngle / 2;
      angle < Globals.g().lidarAngle / 2;
      angle += Globals.g().lidarAngle / Globals.g().lidarSampling
    ) {
      const rotated = this.p5
        .createVector(this.direction.x, this.direction.y)
        .rotate(angle);
      const x2 = rotated.x;
      const y2 = rotated.y;
      changeFunction(x2, y2, i);
      i++;
    }
  };

  public update = (
    position: Vector,
    direction: Vector,
    walls: Array<Boundary>
  ): void => {
    this.position = position;
    this.direction = direction;

    this.rotateLidar((x: number, y: number, i: number) => {
      // updates the Direction of the rays
      this.rays[i].update(this.p5.createVector(x, y));
    });

    this.look(walls);
  };

  private look = (walls: Array<Boundary>): void => {
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest: Vector = null;
      let record: number = Infinity;
      for (let wall of walls) {
        const pt: Vector | null = ray.cast(this.p5, this.position, wall);
        if (pt) {
          const d: number = Vector.dist(this.position, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }

      // if there is no closest, then the point is infinitly far away (no point detected)
      closest =
        closest == null ? this.p5.createVector(Infinity, Infinity) : closest;
      this.lidarReading[i] = closest;
      this.lidarDistances[i] = closest.dist(this.position);
    }
  };

  public setVisual = (visual: Lidar.Visual): void => {
    this.visual = visual;
  };

  public show = (color: Color): void => {
    switch (this.visual) {
      case Lidar.Visual.Dots:
        this.showDots(color);
        break;
      case Lidar.Visual.Lines:
        this.showLines(color);
      default:
        break;
    }
    // this.showDots();
  };

  private showLines = (color: Color) => {
    for (let i = 0; i < Globals.g().lidarSampling; i++) {
      let closest: Vector = this.lidarReading[i];

      // v is the vector between 2 points
      let v = this.p5
        .createVector(closest.x - +this.position.x, closest.y - this.position.y)
        .normalize();

      this.p5.fill(color);
      this.p5.stroke(color);
      this.p5.line(
        this.position.x,
        this.position.y,
        closest.x +
          v.x * Noise.getNoise(this.p5) * Globals.g().lidarNoiseAmplification,
        closest.y +
          v.y * Noise.getNoise(this.p5) * Globals.g().lidarNoiseAmplification
      );
      this.p5.noFill();
      this.p5.noStroke();
    }
  };

  private showDots = (color: Color) => {
    for (let i = 0; i < Globals.g().lidarSampling; i++) {
      const closest: Vector = this.lidarReading[i];

      // v is the vector between 2 points
      let v = this.p5
        .createVector(closest.x - +this.position.x, closest.y - this.position.y)
        .normalize();

      this.p5.fill(color);
      this.p5.stroke(color);
      this.p5.ellipse(
        closest.x +
          v.x * Noise.getNoise(this.p5) * Globals.g().lidarNoiseAmplification,
        closest.y +
          v.y * Noise.getNoise(this.p5) * Globals.g().lidarNoiseAmplification,
        Globals.g().lidarDotSize
      );
      this.p5.noFill();
      this.p5.noStroke();
    }
  };

  public getLidarDistances = (): Array<number> => {
    return this.lidarDistances;
  };
}

export namespace Lidar {
  export enum Visual {
    Dots,
    Lines,
    None,
  }
}
