import P5, { Vector } from 'p5';
import {
  keyboardRotationAngle,
  keyboardSpeed,
  Keys,
  wallColor,
  walls,
} from './globals';

import Gaussian from 'gaussian';
import Boundary from './models/core/boundary';

// Local variables for adminstration
let firstClick: boolean = true;
let lockedMouseX: number = 0;
let lockedMouseY: number = 0;

export const drawBoundaries = (p5: P5): void => {
  if (!firstClick) {
    p5.stroke(wallColor);
    p5.line(lockedMouseX, lockedMouseY, p5.mouseX, p5.mouseY);
    p5.noStroke();
  }
};

export const handleKeyboard = (p5: P5): Vector => {
  let navigation = p5.createVector(0, 0);
  if (p5.keyIsDown(Keys.w)) {
    navigation.set(1, 1).mult(keyboardSpeed);
  }
  if (p5.keyIsDown(Keys.s)) {
    navigation.set(-1, -1).mult(keyboardSpeed);
  }
  return navigation;
};

export const handleKeyboardRotation = (p5: P5): number => {
  let rotation = 0;
  if (p5.keyIsDown(Keys.a)) {
    rotation -= keyboardRotationAngle;
  }
  if (p5.keyIsDown(Keys.d)) {
    rotation += keyboardRotationAngle;
  }
  return rotation;
};

export const mouseClicked = (p5: P5) => {
  if (firstClick) {
    lockedMouseX = p5.mouseX;
    lockedMouseY = p5.mouseY;
    firstClick = false;
  } else {
    let newBoundary: Boundary = new Boundary(
      p5,
      lockedMouseX,
      lockedMouseY,
      p5.mouseX,
      p5.mouseY
    );

    walls.push(newBoundary);
    firstClick = true;
  }
};

// Functions

export const gaussian = (mu: number, sigma: number, x: number): number => {
  // Probability of x for 1-dim Gaussian with mean mu and var. sigma
  return (
    Math.exp(-Math.pow(mu - x, 2) / Math.pow(sigma, 2) / 2.0) /
    Math.sqrt(2.0 * Math.PI * Math.pow(sigma, 2))
  );
};

export const gaussianRandom = (mean: number, stdev: number): number => {
  const distribution = Gaussian(mean, stdev * stdev);
  return distribution.random(1)[0];
};
