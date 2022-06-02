// Monte Carlo Localization

import MultivariateNormal from 'multivariate-normal';
import nj from 'numjs';
import P5, { Vector } from 'p5';
import Globals from './globals';
import { handleKeyboard, handleKeyboardRotation } from './helpers';
import Robot from './models/robot';
import { Lidar } from './models/sensors/lidar';

export default class Mcl {
  private p5: P5;
  private n: number; // particle sample size
  private particles: Array<Robot>;
  private weights: Array<number>;

  public constructor(p5: P5, n: number) {
    this.p5 = p5;
    this.n = n;

    this.initParticles();
  }

  public update = (robot: Robot): void => {
    // ----- Move / predict ----- //
    this.move();

    // ----- Update ----- //
    this.updateWeights(robot.getLidarReading());

    // ----- Resample ----- //
    // const indexes = this.systematicResample();
    // this.resampleFromIndex(indexes);

    // const newDir = this.direction.rotate(rotationAngle).normalize();
    // this.position.set(
    //   this.position.x + newDir.x * newPos.x,
    //   this.position.y + newDir.y * newPos.y
    // );
    // this.direction.set(newDir.x, newDir.y);
    //
    // // update sensor data
    // if (this.lidarEnabled) {
    //   this.lidarSensor.update(this.position, this.direction, Globals.g().walls);
    // }
  };

  private resampleFromIndex = (indexes: Array<number>) => {
    this.particles = indexes.map((i) => this.particles[i]);
    const weightSum = nj.sum(this.weights);
    this.weights = indexes.map((i) => this.weights[i] / weightSum);
  };

  private systematicResample = (): Array<number> => {
    const n = this.weights.length;
    const positions = nj
      .arange(n)
      .tolist()
      .map((x) => (x + Math.random()) / n);

    const indexes = Array<number>(n).fill(0);
    const cumulativeSum = this.weights.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );

    let i = 0;
    let j = 0;

    while (i < n && j < n) {
      if (positions[i] < cumulativeSum[j]) {
        indexes[i] = j;
        i += 1;
      } else {
        j += 1;
      }
    }
    return indexes;
  };

  private updateWeights = (robotMeasurement: Array<number>): void => {
    this.particles.forEach((particle: Robot, i: number) => {
      console.log(robotMeasurement[0]); // TODO: Returns null for some reason
      console.log(particle.getLidarReading()[0]);
      this.weights[i] =
        this.resample(robotMeasurement[0], particle.getLidarReading()[0]) +
        0.0000000001;

      // Draw circle for the particle
      this.p5.fill(this.p5.color(this.weights[i] * 255, 0, 0));
      this.p5.stroke(this.p5.color(this.weights[i] * 255, 0, 0));

      const width = this.p5.windowWidth / 150;
      const height = this.p5.windowHeight / 150;
      this.p5.rect(particle.position.x, particle.position.y, width, height);
      // this.p5.circle(particle.position.x, particle.position.y, 10);
      this.p5.noFill();
      this.p5.noStroke();
    });
    // console.log(this.weights);
  };

  // predict / move the particles (TODO: Add gaussian noise to the movement)
  private move = (): void => {
    this.particles.forEach((particle: Robot) => {
      particle.update(handleKeyboard(this.p5), handleKeyboardRotation(this.p5));
    });
  };

  private resample = (
    robotMeasurement: number,
    particleMeasurement: number
  ): number => {
    const m = robotMeasurement; // 3; // measurement of the robot;
    const sigma = 10; // standard deviation;
    const variance = sigma ** 2;
    return Math.exp((-0.5 * (particleMeasurement - m) ** 2) / variance);
  };

  public heatMap = (): void => {
    const columnSize = 50;
    const rowSize = 50;
    const width = this.p5.windowWidth / columnSize;
    const height = this.p5.windowHeight / rowSize;
    for (let i = 0; i < rowSize; i++) {
      for (let j = 0; j < columnSize; j++) {
        const x = i * width;
        const y = j * height;
        this.p5.stroke('white');
        this.p5.fill('blue');
        this.p5.rect(x + width / 2, y + height / 2, width, height);
      }
    }
  };

  // measurement is the lidar measurement of the main robot
  public displayParticles = (measurement: Array<number>): void => {
    this.p5.noStroke();
    this.particles.forEach((particle: Robot, index: number) => {
      particle.update(handleKeyboard(this.p5), handleKeyboardRotation(this.p5));
      // robot.show(index);
      const weight = this.resample(
        measurement[0],
        particle.getLidarReading()[0]
      );
      this.p5.fill(this.p5.color(weight * 255, 0, (1 - weight) * 255));
      this.p5.circle(particle.position.x, particle.position.y, 10);
      this.p5.noFill();
    });
  };

  private initParticles = (): void => {
    // Block of a heat map
    const columnSize = 150;
    const rowSize = 150;
    const width = this.p5.windowWidth / columnSize;
    const height = this.p5.windowHeight / rowSize;

    // 4 robot per block
    const particleSize = columnSize * rowSize;
    this.particles = Array<Robot>(particleSize);
    this.weights = Array<number>(particleSize).fill(1 / particleSize);
    console.log('initialized: ' + this.weights);

    for (let i = 0; i < rowSize; i++) {
      for (let j = 0; j < columnSize; j++) {
        // ----- Rectangle Coordinates ----- //
        const x = i * width;
        const y = j * height;

        // ----- Position ----- //
        const position: Vector = this.p5.createVector(x, y);

        // ----- Direction ----- //
        // const direction: Vector = this.p5.createVector(-1, 0);
        const direction: Vector = this.p5.createVector(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        );

        // ----- Particle Initialization ----- //
        this.particles[i + j * columnSize] = new Robot(
          this.p5,
          position,
          direction
        );
        this.particles[i + j * columnSize].setColor(
          Globals.g().particleRobotColor,
          Globals.g().particleRobotHeadColor
        );
        this.particles[i + j * columnSize].setLidar(
          true,
          Globals.g().particleRobotHeadColor,
          Lidar.Visual.Lines
        );

        // draw rectangle
        // this.p5.stroke('white');
        // this.p5.fill('blue');
        // this.p5.rect(x + width / 2, y + height / 2, width, height);
      }
    }
  };

  // private initParticles = (): void => {
  //   this.particles = Array<Robot>(this.n);
  //
  //   // Distribution Initialization
  //   const mean = [0, 0];
  //   const variance = 10000;
  //   // const variance = Globals.g().minDimention;
  //   const covariance = nj.diag([variance, variance]);
  //   const distribution = MultivariateNormal(mean, covariance.tolist());
  //
  //   for (let i = 0; i < this.n; i++) {
  //     // ----- Position ----- //
  //     // const sample = distribution.sample();
  //     // const position = this.p5.createVector(
  //     //   sample[0] + this.p5.windowWidth / 2,
  //     //   sample[1] + this.p5.windowHeight / 2
  //     // );
  //     const position: Vector = this.p5.createVector(
  //       this.p5.windowWidth * Math.random(),
  //       this.p5.windowHeight * Math.random()
  //     );
  //
  //     // ----- Direction ----- //
  //     const direction: Vector = this.p5.createVector(-1, 0);
  //     // const direction: Vector = this.p5.createVector(
  //     //   Math.random() * 2 - 1,
  //     //   Math.random() * 2 - 1
  //     // );
  //
  //     // ----- Particle Initialization ----- //
  //     this.particles[i] = new Robot(this.p5, position, direction);
  //     this.particles[i].setColor(
  //       Globals.g().particleRobotColor,
  //       Globals.g().particleRobotHeadColor
  //     );
  //     this.particles[i].setLidar(
  //       true,
  //       Globals.g().particleRobotHeadColor,
  //       Lidar.Visual.Lines
  //     );
  //   }
  // };
}
