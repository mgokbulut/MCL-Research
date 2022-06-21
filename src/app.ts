import P5, { Vector } from 'p5';
import 'p5/lib/addons/p5.dom';
import './styles.scss';

// Importing Modules
import { Noise } from './models/core/noise';
import { drawBoundaries, mouseClicked } from './helpers';
import Robot from './models/robot';
import Mcl from './mcl';
import {
  height,
  initGlobals,
  lidarColor,
  mainRobotColor,
  mainRobotHeadColor,
  width,
} from './globals';
import { Lidar } from './models/sensors/lidar';
import { Anchor } from './models/sensors/anchor';
import { Simulation } from './simulation';

// Local variables for simulation
let robot: Robot;

// Filters
let mcl: Mcl;

let anchors: Array<Anchor> = [];

// DOM
let nextFrameButtonDOM: any;
let paragraphDOM: any;
let drawNextFrame: boolean = true;
let t = 0;
const steps = 100;
const particleNumber = 500;
const anchorNumber = 3;
let simulateButtonDOM: any;
let particleSizeDOM: any;

// For perlin noise movement
let noiseCounterTurn = 0;

// Creating the sketch itself
const sketch = (p5: P5) => {
  // The sketch setup method
  p5.setup = () => {
    setupSimulation(p5);

    // Setting defaults
    p5.angleMode(p5.DEGREES);
    p5.rectMode(p5.CENTER).noFill().frameRate(2);

    const canvas = p5.createCanvas(width, height);
    canvas.parent('app');

    // Setup DOM
    nextFrameButtonDOM = document.getElementById('nextButton');
    nextFrameButtonDOM.addEventListener('click', () => {
      drawNextFrame = true;
    });

    paragraphDOM = document.getElementById('paragraphDOM');
    particleSizeDOM = document.getElementById('particleNum');

    simulateButtonDOM = document.getElementById('simulateButton');
    simulateButtonDOM.addEventListener('click', () => {
      // console.log(particleSizeDOM.value);
      let simulation = new Simulation(p5, 100, particleSizeDOM.value, 25, 3);
      simulation.simulate();
      // console.log('yoo ' + particleSizeDOM.value);
    });
  };

  // The sketch draw method
  p5.draw = () => {
    if (drawNextFrame && t < steps) {
      // Update globals
      drawNextFrame = false;
      t = t + 1;

      // Clear background for the next frame
      p5.background(255);

      // Update the Monte Carlo Localization for next frame
      // mcl.update(robot);

      // handles adding new boundaries to the array of walls
      drawBoundaries(p5);

      // display walls
      // Boundary.showWalls(walls);

      // display anchors
      anchors.forEach((anchor: Anchor) => anchor.show());

      const rotationAngle = (p5.noise(noiseCounterTurn) - 0.5) * 60; // in degrees
      noiseCounterTurn += 1;
      const newPos = p5.createVector(5, 5);

      // display robot
      robot.update(newPos, rotationAngle);
      Robot.displayRobot(robot, p5);
      // p5.stroke(0, 0, 0);
      // p5.fill(0, 0, 0);
      // p5.circle(robot.position.x, robot.position.y, particleSize);

      mcl.update(robot, anchors, newPos, rotationAngle);
      mcl.show();

      const evalRes =
        'Step: ' +
        t +
        ', Evaluation: ' +
        mcl.evaluation(robot) / 10 +
        '% error, Absolute Error: ' +
        mcl.absoluteError(robot) / 10 +
        '% error';
      // console.log(evalRes);
      paragraphDOM.innerHTML = evalRes;
    }
  };

  // ---------- Administrative Methods ---------- //

  p5.windowResized = () => {
    p5.resizeCanvas(width, height);
  };

  p5.mouseClicked = () => {
    mouseClicked(p5);
  };
};

const setupSimulation = (p5: P5): void => {
  // Setting Global variables
  initGlobals(p5);

  // Setup Local variables for simulation
  Noise.setBehavior(Noise.Behaviour.None);
  setupRobot(p5);

  // Setup Mcl
  mcl = new Mcl(p5, particleNumber);

  // Setup Anchors
  setupAnchors(p5, anchorNumber);
};

const setupAnchors = (p5: P5, n: number): void => {
  for (let i = 0; i < n; i++) {
    anchors.push(
      new Anchor(
        p5,
        p5.createVector(Math.random() * width, Math.random() * height)
      )
    );
  }
};
const setupRobot = (p5: P5): void => {
  // const pos: Vector = p5.createVector(width / 2, height / 2);
  // const dir: Vector = p5.createVector(-1, 0).normalize();
  const pos: Vector = p5.createVector(
    Math.random() * width,
    Math.random() * height
  );
  const dir: Vector = p5
    .createVector(Math.random() * 2.0 * Math.PI, Math.random() * 2.0 * Math.PI)
    .normalize();
  robot = new Robot(p5, pos, dir);
  // robot.set_noise(0.1, 0.1, 2);
  robot.setColor(mainRobotColor, mainRobotHeadColor);
  robot.setLidar(false, lidarColor, Lidar.Visual.Lines);
};

new P5(sketch);
