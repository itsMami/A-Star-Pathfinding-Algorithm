//Muhammed Halil Ayhan
//https://github.com/itsMami
//Grid Variables
var cols = 50;
var rows = 50;
var grid = new Array(cols);

//Colorize the Grid, set the color in Setup function
var startEndColor;
var obstacleColor;

//The chance of a grid element becoming an obstacle
var obstacleProbability = 0.3;

//OpenSet,ClosedSet,Start Point,End Point,Path Array
var startPoint, endPoint;
var openSet = [];
var closedSet = [];
var path = [];

//Node Class
function Node(x, y) {
  this.x = x; //X-Position
  this.y = y; //Y-Position
  this.start = false; //If this point is a start point
  this.end = false; //If this point is a end point
  this.obstacle = false; //If this point is an obstacle
  this.previous = null; //I am setting the previous depending on the path it came from at the end
  this.f = 0; //F value
  this.g = 0; //G value
  this.h = 0; //H value
  this.neighbours = []; //Neighbours array

  //TZhe probability of this node's becoming of an obstacle
  if (random(1) < obstacleProbability)
    this.obstacle = true;

  //Display the node on the grid with the given color
  this.Display = function(color) {
    noStroke();
    if (this.start || this.end) {
      color = startEndColor;
      if (this.obstacle)
        this.obstacle = false;
    }
    if (this.obstacle)
      color = obstacleColor;
    fill(color)
    rect(this.x * width / cols, this.y * height / rows, width / cols - 1, height / rows - 1);
  }

  //Find the neighbours of this node
  this.findNeighbours = function(grid) {
    //4 Way Movement
    if (this.x > 0 /*&& !grid[x - 1][y].obstacle*/ ) //I have commented these because it is unnecessary,I can just check it
      this.neighbours.push(grid[x - 1][y]); // on Line 148
    if (this.x < cols - 1 /*&& !grid[x + 1][y].obstacle*/ )
      this.neighbours.push(grid[x + 1][y]);
    if (this.y > 0 /* && !grid[x][y - 1].obstacle*/ )
      this.neighbours.push(grid[x][y - 1]);
    if (this.y < rows - 1 /* && !grid[x][y + 1].obstacle*/ )
      this.neighbours.push(grid[x][y + 1]);
    //Diagonal Movement
    if (this.x > 0 && this.y > 0 /*&& !grid[x - 1][y - 1].obstacle*/ )
      this.neighbours.push(grid[x - 1][y - 1]);
    if (this.x < cols - 1 && this.y > 0 /* && !grid[x + 1][y - 1].obstacle*/ )
      this.neighbours.push(grid[x + 1][y - 1]);
    if (this.x < cols - 1 && this.y < rows - 1 /* && !grid[x + 1][y + 1].obstacle*/ )
      this.neighbours.push(grid[x + 1][y + 1]);
    if (this.x > 0 && this.y < rows - 1 /*&& !grid[x - 1][y + 1].obstacle*/ )
      this.neighbours.push(grid[x - 1][y + 1]);
  }

}

//Return the distance between 2 points using diagonal distance
function heuristic(x, y) { // I am using diagonal distance heuristic for 8 way movement
  var distance = dist(x, y, endPoint.x, endPoint.y);
  return distance;
}

function setup() {
  //Create the window
  createCanvas(600, 600);
  //Set the start,end and obstacle colors
  startEndColor = color(255, 255, 0);
  obstacleColor = color(0);
  //Create the 2 Dimensional Array Grid
  for (var x = 0; x < cols; x++) {
    grid[x] = new Array(rows);
  }
  //Create a node in every point in the grid
  for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
      grid[x][y] = new Node(x, y);
    }
  }
  //Find all the neighbours of every possible point in the grid
  for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
      grid[x][y].findNeighbours(grid);
    }
  }
  //Set the start point
  grid[0][0].start = true;
  //Set the end point
  grid[cols - 1][rows - 1].end = true;

  //Get the start and end points to variables so I can use them globally
  for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
      if (grid[x][y].start)
        startPoint = grid[x][y];
      if (grid[x][y].end)
        endPoint = grid[x][y];
    }
  }
  //Push the start point to openSet to create a start location
  openSet.push(startPoint);
}

function draw() {

  //If OpenSet is not empty
  if (openSet.length > 0) {
    var index = 0;

    //Find the index of the lowest f value in the openset 
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[index].f) {
        index = i;
      }
    }

    //Set the current to lowest f element
    var q = openSet[index];

    //If q is the end point , finish
    if (q.end) {
      console.log("Congratulations!");
      noLoop();
    }

    //Pop the q from the OpenSet
    for (var i = openSet.length - 1; i >= 0; i--) {
      if (openSet[i] == q) {
        openSet.splice(i, 1);
      }
    }

    //For every neighbour of q
    for (var i = 0; i < q.neighbours.length; i++) {
      var successor = q.neighbours[i]; //Set the successor to current neighbour
      if (!closedSet.includes(successor) && !successor.obstacle) { //If the successor is not in the closedSet and its not an obstacle
        var temp = q.g + dist(successor.x, successor.y, q.x, q.y); //Set the temp G to distance from start point to successor
        if (openSet.includes(successor)) { // If the successor is already in the set
          if (temp < successor.g) { //If the new temp g lower than previous path's g value
            successor.g = temp; //Set the new g and calculate h and f
            successor.h = heuristic(successor.x, successor.y);
            successor.f = successor.g + successor.h;
            successor.previous = q;
          }
        } else { //If the successor is not in the OpenSet
          successor.g = temp; //Calculate the successor's values
          successor.h = heuristic(successor.x, successor.y);
          successor.f = successor.g + successor.h;
          successor.previous = q;
          openSet.push(successor); //And add the successor to openSet
        }
      }
    }
    closedSet.push(q); //Add the processed q element to closedSet 
  } else { //There is no Path!
    console.log("No Solutione!");
    noLoop();
    return;
  }

  //------------------White Background------------------
  background(255);

  //------------------Display the grid elements in white color------------------
  for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
      grid[x][y].Display(color(255));
    }
  }

  //------------------Display and draw  the OpenSet and ClosedSet on the Grid--------------------
  // for (var i = 0; i < openSet.length; i++) {
  //   openSet[i].Display(color(0, 255, 0));
  // }
  // for (var i = 0; i < closedSet.length; i++) {
  //   closedSet[i].Display(color(255, 0, 0));
  // }

  //------------------Display the Path in every Frame------------------
  path = [];
  var tempPath = q;
  path.push(tempPath);

  while (tempPath.previous) {
    path.push(tempPath.previous);
    tempPath = tempPath.previous;
  }

  for (var i = 0; i < path.length; i++) {
    path[i].Display(color(0, 255, 255));
  }

}