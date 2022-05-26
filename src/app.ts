import P5 from 'p5';
import 'p5/lib/addons/p5.dom';
// import "p5/lib/addons/p5.sound";	// Include if needed
import './styles.scss';

// Importing Modules
import Boundary from './models/core/boundary';
import Globals from './globals';
import Robot from './models/robot';
import { Noise } from './models/core/noise';

// Local variables for adminstration
let firstClick: boolean = true;
let lockedMouseX: number = 0;
let lockedMouseY: number = 0;

// Local variables for simulation
let robot: Robot;
let robots: Array<Robot>;

// Creating the sketch itself
const sketch = (p5: P5) => {
  // The sketch setup method
  p5.setup = () => {
    // Setting Global variables
    Globals.g().init(p5);

    // Setting defaults
    p5.angleMode(p5.DEGREES);
    p5.rectMode(p5.CENTER).noFill().frameRate(60);
    const canvas = p5.createCanvas(p5.windowWidth * 0.8, p5.windowHeight * 0.8);
    canvas.parent('app');

    // Setup Local variables for simulation
    Noise.setBehavior(Noise.Behaviour.None);
    const pos: P5.Vector = p5.createVector(
      p5.windowWidth / 2,
      p5.windowHeight / 2
    );
    robot = new Robot(p5, pos, p5.createVector(1, -1).normalize());
    robot.setColor(Globals.g().mainRobotColor, Globals.g().mainRobotHeadColor);
  };

  // The sketch draw method
  p5.draw = () => {
    // CLEAR BACKGROUND
    p5.background(0);

    // handles adding new boundaries to the array of walls
    drawBoundaries(p5);

    // display walls
    showWalls();

    // display robot
    // let keyboardRotation: number = handleKeyboardRotation(p5);
    // const updatedDirection = robot.direction.rotate(keyboardRotation);
    // const theta: number = keyboardRotation;
    robot.update(handleKeyboard(p5), handleKeyboardRotation(p5));
    robot.show();
  };

  // ---------- Administrative Methods ---------- //

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth * 0.8, p5.windowHeight * 0.8);
  };

  p5.mouseClicked = () => {
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

      Globals.g().walls.push(newBoundary);
      firstClick = true;
    }
  };
};

const showWalls = (): void => {
  // Walls
  for (let wall of Globals.g().walls) {
    wall.show();
  }
};

const drawBoundaries = (p5: P5): void => {
  if (!firstClick) {
    p5.stroke(
      Globals.g().wallColor.r,
      Globals.g().wallColor.g,
      Globals.g().wallColor.b
    );
    p5.line(lockedMouseX, lockedMouseY, p5.mouseX, p5.mouseY);
    p5.noStroke();
  }
};

const handleKeyboard = (p5: P5): P5.Vector => {
  let navigation = p5.createVector(0, 0);
  if (p5.keyIsDown(Globals.g().Keys.w)) {
    navigation.set(1, 1).mult(Globals.g().keyboardSpeed);
  }
  if (p5.keyIsDown(Globals.g().Keys.s)) {
    navigation.set(-1, -1).mult(Globals.g().keyboardSpeed);
  }
  return navigation;
};

const handleKeyboardRotation = (p5: P5): number => {
  let rotation = 0;
  if (p5.keyIsDown(Globals.g().Keys.a)) {
    rotation -= Globals.g().keyboardRotationAngle;
  }
  if (p5.keyIsDown(Globals.g().Keys.d)) {
    rotation += Globals.g().keyboardRotationAngle;
  }
  return rotation;
};

new P5(sketch);
