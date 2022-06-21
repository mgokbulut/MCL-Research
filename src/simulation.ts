import P5, { Vector } from 'p5';
import { initGlobals, width, height } from './globals';
import Mcl from './mcl';
import Robot from './models/robot';
import { Anchor } from './models/sensors/anchor';

export class Simulation {
  private percentUpper = 5;
  private percentLower = 0;
  private percentStepSize = 0.5;
  private percentArray: Array<Array<number>>;
  private percentArrayLock: Array<Array<boolean>>;
  private evaluationResultArray: Array<Array<number>>;
  //
  private experimentSize: number;
  private particleSize: number;
  private maxTime: number;
  private anchorSize: number;
  //
  private p5: P5;

  public constructor(
    p5: P5,
    experimentSize: number,
    particleSize: number,
    maxTime: number,
    anchorSize: number
  ) {
    this.p5 = p5;
    this.experimentSize = experimentSize;
    this.particleSize = particleSize;
    this.maxTime = maxTime;
    this.anchorSize = anchorSize;

    this.percentArray = new Array(this.experimentSize);
    this.percentArrayLock = new Array(this.experimentSize);
    this.evaluationResultArray = new Array(this.experimentSize);

    const size = (this.percentUpper - this.percentLower) / this.percentStepSize;
    for (let i = 0; i < this.percentArray.length; i++) {
      this.percentArray[i] = new Array<number>(size).fill(-1);
      this.percentArrayLock[i] = new Array<boolean>(size).fill(true);
      this.evaluationResultArray[i] = new Array<number>(size);
    }

    // Setting Global variables
    initGlobals(p5);
  }

  private enterEvalRes = (
    entryNo: number,
    value: number,
    time: number
  ): void => {
    const size = (this.percentUpper - this.percentLower) / this.percentStepSize;
    for (let i = 0; i < size; i++) {
      const percentLimit = this.percentLower + this.percentStepSize * (i + 1);
      // console.log(
      //   'percentLimit: ' +
      //     percentLimit +
      //     ', value: ' +
      //     value +
      //     ', entryNo: ' +
      //     entryNo
      // );
      if (this.percentArrayLock[entryNo][i] && value <= percentLimit) {
        this.percentArrayLock[entryNo][i] = false;
        this.percentArray[entryNo][i] = time;
      }
    }
    // console.log(this.percentArray);
  };

  public simulate = () => {
    for (let entryNo = 0; entryNo < this.experimentSize; entryNo++) {
      // Initialize Robot
      let experimentRobot = this.initializeRobot();

      // Initialize Particle Filter
      let particleFilter = new Mcl(this.p5, this.particleSize);

      // Initialize Anchors
      let anchors: Array<Anchor> = this.initializeAnchors(this.anchorSize);

      // TODO: Utilize the Noise class written
      let noiseCounter: number = 0;

      // Experiment Loop
      for (let time = 1; time < this.maxTime; time++) {
        const rotationAngle = (this.p5.noise(noiseCounter) - 0.5) * 60; // in degrees
        const newPos = this.p5.createVector(5, 5);
        noiseCounter += 1;
        // Update Robot Position
        experimentRobot.update(newPos, rotationAngle);

        // Update Particle Filter
        particleFilter.update(experimentRobot, anchors, newPos, rotationAngle);

        // Check the evaluation
        const evaluationResult =
          particleFilter.evaluation(experimentRobot) / 10;
        // const evaluationResult =
        //   particleFilter.absoluteError(experimentRobot) / 10;
        // this.enterEvalRes(entryNo, evaluationResult, time);
        this.evaluationResultArray[entryNo][time] = evaluationResult;
      }
    }

    // console.log(this.evaluationResultArray);
    // console.log('heya');
    // export to json
    let dataStr = JSON.stringify({ data: this.evaluationResultArray });
    console.log(dataStr);
    // let dataUri =
    //   'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    //
    // let exportFileDefaultName = 'data.json';
    //
    // let linkElement = document.createElement('a');
    // linkElement.setAttribute('href', dataUri);
    // linkElement.setAttribute('download', exportFileDefaultName);
    // linkElement.click();
  };

  private initializeRobot = (): Robot => {
    const pos: Vector = this.p5.createVector(
      width * Math.random(),
      height * Math.random()
    );
    const dir: Vector = this.p5
      .createVector(Math.random() - 0.5, Math.random() - 0.5)
      .normalize();
    return new Robot(this.p5, pos, dir);
  };

  private initializeAnchors = (anchorSize: number): Array<Anchor> => {
    let anchors: Array<Anchor> = new Array<Anchor>(anchorSize);
    for (let j = 0; j < anchorSize; j++) {
      anchors.push(
        new Anchor(
          this.p5,
          this.p5.createVector(Math.random() * width, Math.random() * height)
        )
      );
    }
    return anchors;
  };
}

// export const simulate = (p5: P5): void => {
//   // Setting Global variables
//   initGlobals(p5);
//
//   // 1000 particles
//   // 1 % forward noise error
//   // 1 % turn noise error
//   // 2 % sensor (anchor) noise error
//
//   const maxTime = 25;
//   const experimentSize = 10;
//   const anchorSize = 2;
//
//   for (let i = 0; i < experimentSize; i++) {
//     // Initialize Robot
//     let experimentRobot = this.initializeRobot(p5);
//
//     // Initialize Particle Filter
//     let particleFilter = new Mcl(p5, 1000);
//
//     // Initialize Anchors
//     let anchors: Array<Anchor> = this.initializeAnchors(p5, anchorSize);
//
//     // TODO: Utilize the Noise class written
//     let noiseCounter: number = 0;
//
//     // Experiment Loop
//     for (let time = 1; time < maxTime; time++) {
//       const rotationAngle = (p5.noise(noiseCounter) - 0.5) * 60; // in degrees
//       const newPos = p5.createVector(5, 5);
//       noiseCounter += 1;
//       // Update Robot Position
//       experimentRobot.update(newPos, rotationAngle);
//
//       // Update Particle Filter
//       particleFilter.update(experimentRobot, anchors, newPos, rotationAngle);
//
//       // Check the evaluation
//       const evaluationResult = particleFilter.evaluation(experimentRobot);
//       console.log(evaluationResult);
//     }
//     console.log('-------------------');
//   }
// };
