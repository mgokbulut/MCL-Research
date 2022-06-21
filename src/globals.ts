import P5, { Color } from 'p5';
import Boundary from './models/core/boundary';

// ------ Declerations ------ //

export const Keys = {
  w: 87,
  a: 65,
  s: 83,
  d: 68,
  space: 32,
  enter: 13,
};

export const keyboardSpeed = 5;
export const keyboardRotationAngle = 3; // 3 degrees

// Robot
export const particleSize = 6;
export let mainRobotColor: Color;
export let mainRobotHeadColor: Color;
export let particleRobotColor: Color;
export let particleRobotHeadColor: Color;

// Global Constants
export let width: number;
export let height: number;
export let minDimention: number;
export let robotSize: number;
export let walls: Array<Boundary> = [];
export let wallColor: Color;

// Sensors
//   * Lidar
//     lidarAngle = lidarSampling * (integer constant)
export const lidarAngle = 1;
export const lidarSampling = 1;
export const lidarDotSize = 4;
export const lidarNoiseAmplification = 40;
export const lidarNoiseOffset = 0.04;
export let lidarColor: Color;

//   * Anchor
export const anchorSize = 10;
export let anchorColor: Color;

export const initGlobals = (p5: P5) => {
  width = 1000;
  height = 1000;
  // width = p5.windowWidth * 0.8;
  // height = p5.windowHeight * 0.8;
  minDimention = Math.min(width, height);
  robotSize = minDimention / 20;
  initColors(p5);
  initBoundries(p5);
};

export const initColors = (p5: P5) => {
  mainRobotColor = p5.color(100, 0, 0);
  mainRobotHeadColor = p5.color(0, 255, 0);
  particleRobotColor = p5.color(130, 130, 130);
  particleRobotHeadColor = p5.color(255, 100, 100);
  lidarColor = p5.color(0, 200, 0);
  anchorColor = p5.color(255, 0, 0);
  wallColor = p5.color(0, 0, 0);
};

export const initBoundries = (p5: P5) => {
  // walls
  for (let i = 0; i < 5; i++) {
    let x1 = p5.random(width);
    let x2 = p5.random(width);
    let y1 = p5.random(height);
    let y2 = p5.random(height);
    p5.stroke(wallColor);
    walls[i] = new Boundary(p5, x1, y1, x2, y2);
    p5.noStroke();
  }

  // Edges of the screen
  p5.stroke(wallColor);
  // walls.push(new Boundary(p5, 0, 0, width, 0));
  // walls.push(new Boundary(p5, width, 0, width, height));
  // walls.push(new Boundary(p5, width, height, 0, height));
  // walls.push(new Boundary(p5, 0, height, 0, 0));
  p5.noStroke();
};
