import P5 from 'p5';
import 'p5/lib/addons/p5.dom';
// import "p5/lib/addons/p5.sound";	// Include if needed
import './styles.scss';

// Importing Modules
import Globals from './globals';
import { Noise } from './models/core/noise';
import {
  displayMcl,
  displayRobot,
  drawBoundaries,
  mcl,
  mouseClicked,
  setupMcl,
  setupRobot,
  showWalls,
} from './helpers';

// Creating the sketch itself
const sketch = (p5: P5) => {
  // The sketch setup method
  p5.setup = () => {
    // Setting Global variables
    Globals.g().init(p5);

    // Setting defaults
    p5.angleMode(p5.DEGREES);
    p5.rectMode(p5.CENTER).noFill().frameRate(60);

    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    canvas.parent('app');

    // Setup Local variables for simulation
    Noise.setBehavior(Noise.Behaviour.None);
    setupRobot(p5);

    setupMcl(p5);
  };

  // The sketch draw method
  p5.draw = () => {
    // CLEAR BACKGROUND
    p5.background(0);

    displayMcl(p5);

    // handles adding new boundaries to the array of walls
    drawBoundaries(p5);

    // display walls
    showWalls();

    // display robot
    displayRobot(p5);

    // mcl.heatMap();
    // Coordinate system
    // p5.stroke('white');
    // p5.line(0, p5.windowHeight / 2, p5.windowWidth, p5.windowHeight / 2);
    // p5.line(p5.windowWidth / 2, 0, p5.windowWidth / 2, p5.windowHeight);

    // if (deneme) {
    //   gauss(robot.getLidarReading(), robots[0].getLidarReading());
    //   console.log('--------------');
    //   gaussDeneme();
    //   robots.forEach((current, index) => {
    //     console.log(' --- ' + index + ' ---------');
    //     singleGaussian(
    //       current.getLidarReading()[0],
    //       robot.getLidarReading()[0]
    //     );
    //   });
    //
    //   deneme = false;
    // }
  };

  // ---------- Administrative Methods ---------- //

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.mouseClicked = () => {
    mouseClicked(p5);
  };
};

let deneme = true;

new P5(sketch);
