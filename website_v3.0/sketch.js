//Inspiration + parts of code taken from: 
  //https://editor.p5js.org/moe/sketches/H1SOn3xO-
  //https://editor.p5js.org/chesterdols/sketches/B12rzkBQx
  //https://editor.p5js.org/generative-design/sketches/M_1_5_03
  //https://www.openprocessing.org/sketch/654366
  //https://www.youtube.com/watch?v=TaN5At5RWH8
  //https://p5js.org/examples/sound-sound-effect.html

//Bubble variable
let bubbles = [];

//first make a grid for the pixels to move on and then define vectors for each pixel/line to follow 

//declare "increments"
var inc = 0.5;
//declare "scale" -> vector every 30 pixels
var scl = 30;
//declare columns and rows
var cols, rows;
//declare offset z-index variable
var zoff = 0;
//particle array
var particles = [];
//declare flowfield variable
var flowfield;

function setup() {
  //create canvas based on window's current width and height
  createCanvas(windowWidth, windowHeight);
  
  //BUBBLES  
  //load sound -> formats mp3 and ogg
  soundFormats('mp3', 'ogg');
  bubblepop = loadSound('pop.mp3');
  //call resetSketch
  resetSketch();
  
  //for loop: i = 0 is TRUE-> i is less than 20 is TRUE -> i adds in increments of one
    for (let i = 0; i < 20; i++) {
    //set random x positioning
    let x = random(width);
    //set random y positioning
    let y = random(height);
    //set random radius between 20 and 60
    let r = random(20, 60);
    let b = new Bubble(x, y, r);
    bubbles.push(b);
  }   
  //create button activated on mousePress -> resets bubble code to generate more
  var button = createButton("More Bubbles!");
  button.mousePressed(resetSketch);
  
  
  
  
  
  
  //PARTICLES    
  //Hue, Saturation, Brightness colormode
  colorMode(HSB, 255);
  //'floor' -> gets rid of decimal points
  //columns formed by width divided by the scale 
  cols = floor(width / scl);
  //rows formed by height divided by the scale
  rows = floor(height / scl);

  //'Array' -> special variable that holds multiple values
  //flowfield are defined by the grid (columns + rows)
  flowfield = new Array(cols * rows);

  //for i = 0 is TRUE -> if i is less than 300 is TRUE -> increment i by one
  //determine number of particles
  for (var i = 0; i < 500; i++) {
    //create particles
    particles[i] = new Particle();
  }
}




//BUBBLES
//mousepress function
function mousePressed() {
  //for loop: i = 0 is TRUE -> i is less than the size of the bubble -> increment i by one
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].clicked(mouseX, mouseY);
  }
}




function draw() {
    background(0);
  
  //BUBBLES
  //for loop: i = 0 is TRUE -> i is less than the size of the bubble -> increment i by one
  for (let i = 0; i < bubbles.length; i++) {
    //bubble movement
    bubbles[i].move();
    //draw bubbles
    bubbles[i].show();
  }  
  
  
  //PARTICLES
  //create the flowfield using 'noise()' function
  //offset y-index
  var yoff = 0;
  //for y = 0 is TRUE -> y is less than row value is TRUE -> increment y by 1
  for (var y = 0; y < rows; y++) {
    //offset x-index
    var xoff = 0;
    //for x = 0 is TRUE -> x is less than column value is TRUE -> increment x by 1
    for (var x = 0; x < cols; x++) {
      //declare index variable -> x + y * column
      //takes two dimensional value and makes it into a one dimensional array
      var index = x + y * cols;
      //declare angle variable -> noise(x, y, z) multiplied by two pi to create tiny squiggles
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
      //declare v variable -> use of p5.Vector to create an angle
      var v = p5.Vector.fromAngle(angle);
      //set the magnitude -> how closely do the lines follow the flowfield
      v.setMag(5);
      flowfield[index] = v;
    
    //allow the particles to diverge from the path at times
    //xoff = xoff + inc
    xoff += inc;
    }
    //yoff = yoff + inc
    yoff += inc;
    //zoff = zoff + 0.0003
    zoff += 0.0003;
  }
  //tell each particle to update
  //for loop -> i = 0 is TRUE, i is less than particle length, increment i by one, --> execute particles below
  for (var i = 0; i < particles.length; i++) {
    //particles follow flowfield
    particles[i].follow(flowfield);
    //update movement of the particle flow
    particles[i].update();
    //edge boutdaries
    particles[i].edges();
    //draw the particles
    particles[i].show();
  }

}


//BUBBLES
class Bubble {
  //'constructor' creates and initializes an object created within a class
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.brightness = 0;
  }

  //relable mouseX, mouseY to px, py
  clicked(px, py) {
    //'dist' (x1, y1, x2, y2)
    //find distance between mouseX, mouseY and the bubbles' center
    let d = dist(px, py, this.x, this.y);
    //if distance is less than the radius of the circle = in the circle -> fill with brightness of alpha 255
    if (d < this.r) {
      this.brightness = 255;
      bubblepop.play();
    }
  }

  //determine "jitter" movement
  move() {
    //define "jitter" on the x value
    this.x = this.x + random(-0.5, 0.5);
    //define "jitter" on the y value
    this.y = this.y + random(-1, 0);
  }

  // draw the bubbles
  show() {
    stroke(255);
    strokeWeight(0.5);
    //fill with brightness of alpha 125
    fill(this.brightness, 125);
    ellipse(this.x, this.y, this.r * 2);
  }
  
}

//reset sketch function -> took same code from setup
function resetSketch(){
    for (let i = 0; i < 20; i++) {
    let x = random(width);
    let y = random(height);
    let r = random(20, 60);
    let b = new Bubble(x, y, r);
    bubbles.push(b);
  } 
}






//PARTICLES
function Particle() {
  //create vectors with random positioning
  this.pos = createVector(random(width), random(height));
  //establish vector velocity
  this.vel = createVector(0, 0);
  //establish vector acceleration
  this.acc = createVector(0, 0);
  //determine speed
  this.maxspeed = 2;
  //determine HSB coloring
  this.h = 0;

  //previous position and a copy of the original position
  this.prevPos = this.pos.copy();
  //define an update function
  this.update = function() {
    //velocity value adds the acceleration and gets added to the position 
    //update velocity based on acceleration
    this.vel.add(this.acc);
    //velocity value limited by maxspeed and gets added to the position
    //update velocity based on maxpeed
    this.vel.limit(this.maxspeed);
    //position value adds the velocity
    //update position based on velocity
    this.pos.add(this.vel);
    //reset acceleration to 0 by multiplying vector by 0
    this.acc.mult(0);
  }

  //follow function -> tells particles to follow the appropriate vector in that array
  this.follow = function(vectors) {
    //divide the x and y positions by scale -> scale down to grid size to find appropriate index
    //'floor' -> gets rid of decimal points
    var x = floor(this.pos.x / scl);
    var y = floor(this.pos.y / scl);
    //find the closest vector in the one dimensional array and apply force
    var index = x + y * cols;
    var force = vectors[index];
    this.applyForce(force);
  }

  //function that receives force
  this.applyForce = function(force) {
    //add force to acceleration
    this.acc.add(force);
  }
  
  //draws the particles
  //defines the stroke color of the line -> HSB
  this.show = function() {
    //hue of the stroke defined by 'this.h'
    stroke(this.h, 255, 255, 25);
    //add 1 to 'this.h' value
    this.h = this.h + 1;
    //if the value of 'this.h' is greater than 255, reset value to 0
    if (this.h > 255) {
      this.h = 0;
    }
    noFill();
    strokeWeight(10);
    //(current pos, current pos, previous pos, previous pos)
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  }

  //function to determine previous x and y positions
  //previous position becomes the current position
  this.updatePrev = function() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  //function to detect edge of the canvas
  this.edges = function() {
    //if x position is greater than the width, set back to 0
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    //if x position is less than the width, set back to 0
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    //if y position is greater than the height, set back to 0
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    //if y position is less than the height, set back to 0
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  }
}