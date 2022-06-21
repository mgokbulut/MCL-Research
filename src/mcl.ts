// Monte Carlo Localization

import nj from 'numjs';
import P5, { Vector } from 'p5';
import { height, particleSize, width } from './globals';
import Robot from './models/robot';
import { Anchor } from './models/sensors/anchor';
import { gaussian, gaussianRandom } from './helpers';

export default class Mcl {
  private p5: P5;
  private n: number; // particle sample size
  private particles: Array<Robot>;
  private particles2: Array<Robot>;
  private previousEstimate: Vector;

  public constructor(p5: P5, n: number) {
    this.p5 = p5;
    this.n = n;

    this.initParticles();
  }

  private initParticles = (): void => {
    this.particles = new Array<Robot>(this.n);
    this.particles2 = new Array<Robot>(this.n);

    for (let i = 0; i < this.n; i++) {
      const position = this.p5.createVector(
        Math.random() * width,
        Math.random() * height
      );
      const direction = this.p5
        .createVector(
          Math.random() * 2.0 * Math.PI,
          Math.random() * 2.0 * Math.PI
        )
        .normalize();
      this.particles[i] = new Robot(this.p5, position, direction);
      // this.particles[i].set_noise(1, 1, 20);
    }
  };

  public update = (
    robot: Robot,
    anchors: Array<Anchor>,
    newPos: Vector,
    newDir: number
  ): void => {
    let z: Array<number> = robot.getAnchorReading(anchors);

    // Simulate a robot motion for each of these particles
    for (let i = 0; i < this.n; i++) {
      this.particles2[i] = this.particles[i].move(newPos, newDir);
      this.particles[i] = this.particles2[i];
    }

    //Generate particle weights depending on robot's measurement
    let w: Array<number> = new Array<number>(this.n);
    this.particles.forEach((particle: Robot, i: number) => {
      w[i] = particle.measurement_prob(anchors, z);
    });

    //Resample the particles with a sample probability proportional to the importance weight
    let particles3: Array<Robot> = new Array<Robot>(this.n);
    let weightedSamples = new Array<WeightedSamples>(this.n);

    let index: number = Math.floor(Math.random() * this.n);
    let beta: number = 0.0;
    let mw: number = nj.max(w);

    // console.log('max value: ' + mw);
    for (let i = 0; i < this.n; i++) {
      beta += Math.random() * 2.0 * mw;
      // console.log('beta: ' + beta);

      while (beta > w[index]) {
        beta -= w[index];
        index = (index + 1) % this.n;
      }
      // particles3[i] = this.particles[index];
      weightedSamples[i] = new WeightedSamples(this.particles[index], w[index]);
    }

    // -------------------------- MY ADDITIONS ------------------------- //
    let positionEstimate: Vector = this.getCenter(
      weightedSamples,
      weightedSamples.length
    );

    // weights high to low
    weightedSamples.sort((a, b) => {
      return b.weight - a.weight;
    });

    if (this.previousEstimate != null) {
      let directionEstimate: Vector = P5.Vector.sub(
        positionEstimate,
        this.previousEstimate
      ).normalize();
      // console.log('estimated: ' + directionEstimate);
      // console.log('direction: ' + robot.direction);
      // console.log('----------');

      const portion = 0.6;
      // const angleVariance = 30;
      const guassianceVariance = Math.sqrt(
        weightedSamples[0].particle.sense_noise
      );
      for (let k = Math.floor(portion * this.n); k < this.n; k++) {
        const gaussianRandPos = this.p5.createVector(
          gaussianRandom(positionEstimate.x, guassianceVariance),
          gaussianRandom(positionEstimate.y, guassianceVariance)
        );
        weightedSamples[k].particle = new Robot(
          this.p5,
          gaussianRandPos,
          directionEstimate
        );
      }
    }

    // console.log(weightedSamples);
    // console.log(this.getCenter(weightedSamples, weightedSamples.length));
    // console.log(robot.position);

    // Changing the assumed variance in sensor
    // const variance = Math.sqrt(this.getVariance(1));
    // console.log('variance: ' + variance);
    // if (variance > 10 && variance < weightedSamples[0].particle.sense_noise) {
    //   for (let k = 0; k < this.n; k++) {
    //     weightedSamples[k].particle.sense_noise = variance;
    //   }
    // }

    // TODO: direction estimation then resample using gaussian !!!

    this.previousEstimate = positionEstimate;
    // -------------------------- MY ADDITIONS ------------------------- //

    for (let k = 0; k < this.n; k++) {
      // this.particles[k] = particles3[k];
      this.particles[k] = weightedSamples[k].particle;
    }

    // const rate = 0.5;
    // let variance = this.getVariance() * rate;
    // console.log(variance);
    // console.log(this.particles[0].sense_noise);
    // console.log('----------');
    //
    // if (variance >= 10 && variance < this.particles[0].sense_noise) {
    //   for (let k = 0; k < this.n; k++) {
    //     this.particles[k].set_noise(1, 1, variance);
    //   }
    // }

    // TODO: Experiment with reducing sensor noise due to evaluation result
    // const evalRes = this.evaluation(robot);
    // if (evalRes < this.particles[0].sense_noise) {
    //   for (let k = 0; k < this.n; k++) {
    //     this.particles[k].set_noise(1, 1, evalRes);
    //   }
    // }
  };

  private getCenter = (
    sortedParticles: Array<WeightedSamples>,
    n: number
  ): Vector => {
    let sum: Vector = this.p5.createVector(0, 0);
    for (let i = 0; i < n; i++) {
      sum.add(sortedParticles[i].particle.position);
    }
    return sum.div(n);
  };

  private getVariance = (portion: number): number => {
    // console.log(this.particles);
    let totalSum = 0;
    for (let i = 0; i < this.n * portion; i++) {
      let sum: number = 0;
      for (let j = 0; j < this.n; j++) {
        const dx: number =
          ((this.particles[i].position.x -
            this.particles[j].position.x +
            width / 2.0) %
            width) -
          width / 2.0;
        const dy =
          ((this.particles[i].position.y -
            this.particles[j].position.y +
            height / 2.0) %
            height) -
          height / 2.0;
        const err = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        sum += err;
      }
      totalSum += sum / this.n;
    }
    return totalSum / (this.n * portion);
  };

  public show = (): void => {
    // this.p5.stroke(0, 255, 0);
    // this.p5.fill(0, 255, 0);
    // this.particles2.forEach((particle: Robot) => {
    //   this.p5.circle(particle.position.x, particle.position.y, particleSize);
    // });

    this.p5.stroke(255, 255, 0);
    this.p5.fill(255, 255, 0);
    this.particles.forEach((particle: Robot) => {
      this.p5.circle(particle.position.x, particle.position.y, particleSize);
    });

    this.p5.stroke('red');
    this.p5.noFill();
    if (this.previousEstimate != null) {
      this.p5.circle(this.previousEstimate.x, this.previousEstimate.y, 50);
    }
    this.p5.fill('blue');
    this.p5.noStroke();
    if (this.previousEstimate != null) {
      this.p5.circle(this.previousEstimate.x, this.previousEstimate.y, 10);
    }
  };

  public evaluation = (r: Robot): number => {
    //Calculate the mean error of the system
    let sum: number = 0.0;

    const percent = 1;
    for (let i = 0; i < this.n * percent; i++) {
      //the second part is because of world's cyclicity
      const dx: number =
        ((this.particles[i].position.x - r.position.x + width / 2.0) % width) -
        width / 2.0;
      const dy =
        ((this.particles[i].position.y - r.position.y + height / 2.0) %
          height) -
        height / 2.0;
      const err = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      sum += err;
    }
    return sum / (this.n * percent);
  };

  public absoluteError = (r: Robot): number => {
    return (
      (Math.abs(r.position.x - this.previousEstimate.x) +
        Math.abs(r.position.y - this.previousEstimate.y)) /
      2
    );
  };
}

class WeightedSamples {
  public particle: Robot;
  public weight: number;

  public constructor(particle: Robot, weight: number) {
    this.particle = particle;
    this.weight = weight;
  }
}
