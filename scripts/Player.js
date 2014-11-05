// ==========
// Player STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Player(descr) {
    console.log(descr);
    // Common inherited setup logic from Entity
    this.setup(descr);

    this.rememberResets();
};

Player.prototype = new Entity();

Player.prototype.rememberResets = function () {
    // Remember my reset positions
    this.reset_cx = this.cx;
    this.reset_cy = this.cy;
    this.last_cx = this.cx - this.velX;
    this.last_cy = this.cy - this.velY;
    this.reset_timestep = this.timestep;
};

Player.prototype.keys = {
    UP: 'W'.charCodeAt(0),
    DN: 'S'.charCodeAt(0),
    LT: 'A'.charCodeAt(0),
    RT: 'D'.charCodeAt(0),
}
/*
Player.prototype.KEY_UP = 'W'.charCodeAt(0);
Player.prototype.KEY_DN = 'S'.charCodeAt(0);
Player.prototype.KEY_LT = 'A'.charCodeAt(0);
Player.prototype.KEY_RT = 'D'.charCodeAt(0);
*/
Player.prototype.KEY_TURBO   = ' '.charCodeAt(0);

// Initial, inheritable, default values
Player.prototype.cx = 0;
Player.prototype.cy = 0;
Player.prototype.velX = 1;
Player.prototype.velY = 0;
//At the vertex, we determine the vertex we are headed for
//and save this information to dx and dy
Player.prototype.requestedVelX = 1;
Player.prototype.requestedVelY = 0;

Player.prototype.maxWallLength = 5;
Player.prototype.anxiousness = 0;

    
Player.prototype.update = function(du)
{

    this.handleInputs();

    //At the vertex, we determine the vertex we are headed for
    //and save this information to dx and dy

    // We only move the actual entity once every reset_timestep
    this.timestep -= du;
    if (this.timestep <= 0)
    {
        spatialManager.unregister(this);

        var last_cx = this.cx;
        var last_cy = this.cy;

        this.cx += this.velX;
        this.cy += this.velY;
        this.velX = this.requestedVelX;
        this.velY = this.requestedVelY;

        this.timestep = this.reset_timestep;
        this.generateWall(last_cx, last_cy);
        this.checkCorrectWallLength();
        // TODO: HANDLE COLLISIONS
        spatialManager.register(this);
    }

    if (this._isDeadNow) return entityManager.KILL_ME_NOW;
};

Player.prototype.handleInputs = function()
{
    if (keys.getState(this.keys['UP']))
    {
        this.requestedVelX = 0;
        this.requestedVelY = -1;
    }
    else if (keys.getState(this.keys['DN']))
    {
        this.requestedVelX = 0;
        this.requestedVelY = 1;
    }
    else if (keys.getState(this.keys['LT']))
    {
        this.requestedVelX = -1;
        this.requestedVelY = 0;
    }
    else if (keys.getState(this.keys['RT']))
    {
        this.requestedVelX = 1;
        this.requestedVelY = 0;
    }
};


Player.prototype.generateWall = function (x, y)
{
    entityManager.generateWall({cx: x, cy: y, color: this.color});
    spatialManager.register(entityManager._walls[entityManager._walls.length-1]);
    //spatialManager.register(Wall.getLatestWallEntity());
};

Player.prototype.checkCorrectWallLength = function ()
{
    if (entityManager._walls.length > this.maxWallLength) {
        spatialManager.unregister(entityManager._walls[0]);
        entityManager._walls.splice(0,1);
    }
};

Player.prototype.isColliding = function()
{
    //TODO
}



Player.prototype.getRadius = function ()
{
    return 1;
};

Player.prototype.getPos = function()
{
    return {x: this.cx, y: this.cy};
};

Player.prototype.reset = function()
{
    spatialManager.unregister(this);
    this.cx = this.reset_cx;
    this.cy = this.reset_cy;
    this.timestep = this.reset_timestep;
    spatialManager.register(this);
};

Player.prototype.render = function (ctx)
{
    //current vertex position
    var currPos = spatialManager.getWorldCoordinates(this.cx, this.cy);
    
    //destination vertex position
    //var revTimestep = (this.timestep - 10)*(-1);
    //var destX = this.cx + (1/revTimestep)*(this.velX);
    //var destY = this.cy + (1/revTimestep)*(this.velY);
    var progress = (this.reset_timestep - this.timestep) / this.reset_timestep;
    var destX = this.cx + (progress * this.velX);
    var destY = this.cy + (progress * this.velY);
    var destPos = spatialManager.getWorldCoordinates(destX, destY);
    //console.log(pos);
    
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(currPos.x, currPos.y);
    ctx.lineTo(destPos.x,destPos.y);
    ctx.stroke();
    ctx.restore();    


    ctx.save();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    util.strokeCircle (
	   ctx, currPos.x, currPos.y, 10
    );
    ctx.restore();
};

Player.prototype.makeMove = function(N)
{
    if (Math.random() < this.anxiousness)
    {
        this.makeRandomMove();
    }
    var nextX = this.cx + this.velX;
    var nextY = this.cy + this.velY;
    var vertex = spatialManager.getVertex(x, y);
    if (vertex.isWall && N)
    {
        this.makeRandomMove();
        this.makeMove(N - 1);
    }
};

Player.prototype.makeRandomMove = function()
{
    for (var key in this.keys)
        keys.clearKey(this.keys[key])
    var pivot = Math.random();
    if (pivot < 0.25)
        keys.setKey(this.keys['UP']);
    else if (pivot < 0.5)
        keys.setKey(this.keys['DN']);
    else if (pivot < 0.75)
        keys.setKey(this.keys['LT']);
    else
        keys.setKey(this.keys['RT']);
}
