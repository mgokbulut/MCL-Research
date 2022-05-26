import P5 from 'p5';

import Globals from '../../globals';
import Boundary from '../core/boundary';
import { Noise } from '../core/noise';
import Ray from '../core/ray';

export default class LidarSensor {
  private p5: P5;

  private rays: Array<Ray>;
  private position: P5.Vector;
  private direction: P5.Vector;

  // Results from Boundary detection
  private lidarReading: Array<P5.Vector>;
  private lidarDistances: Array<number>;

  public constructor(p5: P5, position: P5.Vector, direction: P5.Vector) {
    this.p5 = p5;
    this.position = position;
    this.direction = direction;
    this.lidarReading = Array<P5.Vector>(Globals.g().lidarSampling);
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
    position: P5.Vector,
    direction: P5.Vector,
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
      let closest: P5.Vector = null;
      let record: number = Infinity;
      for (let wall of walls) {
        const pt: P5.Vector | null = ray.cast(this.p5, this.position, wall);
        if (pt) {
          const d: number = P5.Vector.dist(this.position, pt);
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

  public show = (): void => {
    this.showLines();
    // this.showDots();
  };

  private showLines = () => {
    for (let i = 0; i < Globals.g().lidarSampling; i++) {
      let closest: P5.Vector = this.lidarReading[i];

      // v is the vector between 2 points
      let v = this.p5
        .createVector(closest.x - +this.position.x, closest.y - this.position.y)
        .normalize();

      this.p5.fill(
        Globals.g().lidarColor.r,
        Globals.g().lidarColor.g,
        Globals.g().lidarColor.b
      );
      this.p5.stroke(
        Globals.g().lidarColor.r,
        Globals.g().lidarColor.g,
        Globals.g().lidarColor.b
      );
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

  private showDots = () => {
    for (let i = 0; i < Globals.g().lidarSampling; i++) {
      const closest: P5.Vector = this.lidarReading[i];

      // v is the vector between 2 points
      let v = this.p5
        .createVector(closest.x - +this.position.x, closest.y - this.position.y)
        .normalize();

      this.p5.fill(
        Globals.g().lidarColor.r,
        Globals.g().lidarColor.g,
        Globals.g().lidarColor.b
      );
      this.p5.stroke(
        Globals.g().lidarColor.r,
        Globals.g().lidarColor.g,
        Globals.g().lidarColor.b
      );
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
}
