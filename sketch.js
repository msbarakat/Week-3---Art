// Mariam Barakat - mb10568
let swarm = [];
const TOTAL = 80; // No. of particles

function setup() {
  createCanvas(600, 400);
  for (let i = 0; i < TOTAL; i++) {
    swarm.push(new Particle());
  }
}

function draw() {
  background(10, 0, 15); // Solid background (the particles handle their own trails)
  for (let p of swarm) {
    p.update();
    p.display();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.history = []; // Internal array to store previous positions
    this.maxHistory = 15; // Length of the "ribbon"
    this.maxSpeed = 4;
  }

  update() {
    // 1. BEHAVIOR SELECTION
    if (mouseIsPressed) {
      // --- MAGNETIC MODE ---
      let mouse = createVector(mouseX, mouseY);
      // Subtract current position from mouse position to get the "toward" vector
      let attraction = p5.Vector.sub(mouse, this.pos);
      // Normalizing the pull force to 0.6 keeps the movement constant and non-erratic
      attraction.setMag(0.6);
      this.acc.add(attraction);
    } else {
      // --- DISPERSE MODE ---
      // Sampling the noise field based on local coordinates for organic flow
      let n = noise(this.pos.x * 0.006, this.pos.y * 0.006, frameCount * 0.01);
      // Convert the noise value (0 to 1) into a steering angle
      let wander = p5.Vector.fromAngle(n * TWO_PI * 2);
      // Apply a weaker force for a graceful, drifting dispersion
      wander.mult(0.3);
      this.acc.add(wander);
    }

    // 2. PHYSICS
    this.vel.add(this.acc);          // Acceleration changes Velocity
    this.vel.limit(this.maxSpeed);   // Cap speed for smoothness
    this.pos.add(this.vel);          // Velocity changes Position
    this.vel.mult(0.97);             // Damping (Friction) for a liquid feel
    this.acc.mult(0);                // Reset for next frame

    // 3. HISTORY TRACKING (The "Ribbon" Logic)
    let v = createVector(this.pos.x, this.pos.y);
    this.history.push(v);            // Record position
    
    // If the ribbon gets too long, remove the oldest point
    if (this.history.length > this.maxHistory) {
      this.history.shift();          // Remove the tail end
    }

    this.checkEdges();
  }

  checkEdges() {
    if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) {
      this.pos = createVector(random(width), random(height));
      this.history = []; // Clear history if it teleports
    }
  }

  display() {
    // Draw the "Ribbon" by connecting history points
    noFill();
    for (let i = 0; i < this.history.length; i++) {
      let pos = this.history[i];
      
      // Calculate color: fades out at the tail
      let alpha = map(i, 0, this.history.length, 0, 200);
      let size = map(i, 0, this.history.length, 1, 5);
      
      stroke(255, 100, 200, alpha);
      strokeWeight(size);
      
      // If it is the head, draw a brighter point
      if (i === this.history.length - 1) {
        fill(255, 200, 255);
        ellipse(pos.x, pos.y, size + 2);
      } else {
        // Connect the trail points
        let next = this.history[i+1];
        if(next) line(pos.x, pos.y, next.x, next.y);
      }
    }
  }
}
