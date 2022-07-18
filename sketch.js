/**
 * 2D Game Engine
 *
 * Project codename: Jay2D
 *
 * Description: A 2D game engine with physics.
 */

class Vec2
{
  x;
  y;
  length; // precompute for optimisation
  
  constructor( x, y )
  {
    this.x = x;
    this.y = y;
    
    this.length = sqrt( this.x**2 + this.y**2 );
  }
  
  addVec( other )
  {
    return new Vec2(
      this.x + other.x,
      this.y + other.y
    );
  }
  
  addScalar( x, y )
  {
    return new Vec2(
      this.x + x,
      this.y + y
    );
  }
  
  subVec( other )
  {
    return new Vec2(
      this.x - other.x,
      this.y - other.y
    );
  }
  
  subScalar( x, y )
  {
    return new Vec2(
      this.x - x,
      this.y - y
    );
  }
  
  multVec( other )
  {
    return new Vec2(
      this.x * other.x,
      this.y * other.y
    );
  }
  
  multScalar( s )
  {
    return new Vec2(
      this.x * s,
      this.y * s
    );
  }
  
  divideScalar( s )
  {
    return new Vec2(
      this.x / s,
      this.y / s
    );
  }
  
  dot( other )
  {
    return (this.x * other.x) + (this.y * other.y);
  }
  
  angleFrom( other )
  {
    return acos( this.dot( other ) / (this.length * other.length ) );
  }
  
  magnitude()
  {
    return this.length;
  }
  
  normalise()
  {
    if ( this.length == 0 ) return new Vec2( 0, 0 );
    else return new Vec2(
      this.x / this.length,
      this.y / this.length
    );
  }
  
  inverseX()
  {
    return new Vec2(
      -this.x,
      this.y
    )
  }
  
  inverseY()
  {
    return new Vec2(
      this.x,
      -this.y
    )
  }
  
  convertPos()
  {
    return new Vec2(
      halfW + this.x,
      halfH - this.y
    );
  }
}


class Sprite
{
  pos; // Vec2
  v; // Vec2
  size; // Vec2
  halfSize; // precomputed
  texbuf; // p5.Image
  
  collider; // ? extends ColliderShape
  
  active; // boolean; does this object move?
  physics;
  
  constructor( pos, size, texbuf, collider, active = false )
  {
    this.pos = pos;
    this.size = size;
    this.halfSize = this.size.divideScalar( 2 );
    this.texbuf = texbuf;
    this.v = new Vec2( 0, 0 );
    
    this.collider = collider;
    
    this.active = active;
    
    if ( this.active )
      this.physics = new PhysicsEngine( this );
  }
  
  updatePos()
  {
    if ( this.active )
      this.physics.tick(); // add gravity
    
    this.pos = this.pos.addVec( this.v.multScalar( deltaTime/100 ) ); // update its position
    
    if ( this.active )
      this.checkCollision();
  }
  
  checkCollision()
  {
    this.checkCollisionInsideBounds( -halfW, halfW, -halfH, halfH );
  }
  
  checkCollisionInsideBounds( xMin, xMax, yMin, yMax )
  {
    // check for screen bounds collision
    if ( this.pos.x > xMax - this.halfSize.x )
    {
      this.pos.x = xMax - this.halfSize.x;
      this.v.x = 0;
    }
    else if ( this.pos.x < xMin + this.halfSize.x )
    {
      this.pos.x = xMin + this.halfSize.y;
      this.v.x = 0;
    }
    
    if ( this.pos.y > yMax - this.halfSize.y )
    {
      this.pos.y = yMax - this.halfSize.y;
      this.v.y = 0;
    }
    else if ( this.pos.y < yMin + this.halfSize.y )
    {
      this.pos.y = yMin + this.halfSize.y;
      this.v.y = 0;
    }
  }
  
  blit()
  {
    this.updatePos();
    
    var temp = this.pos.convertPos();
    
    image(
      this.texbuf,
      temp.x - this.size.x/2,
      temp.y - this.size.y/2,
      this.size.x,
      this.size.y
    );
    
    /*stroke( 0 );
    fill( 255 );
    circle( temp.x, temp.y, this.collider.boundingSphereRadius * 2 );*/
  }
}

class Player extends Sprite
{
  speed;
  
  constructor( pos, size, texbuf, collider )
  {
    super( pos, size, texbuf, collider, true );
    
    this.speed = 20;
  }
  
  handleMovement()
  {
    //console.log( "handleMovement" )
    //console.log( keyIsDown( "EFT_ARROW" ) )
    if ( keyIsDown( LEFT_ARROW ) || keyIsDown( 65 ) )
    {
      this.v.x = -this.speed;
      //console.log( "left" )
    }
    else if ( keyIsDown( RIGHT_ARROW ) || keyIsDown( 68 ) )
    {
      this.v.x = this.speed;
      //console.log( "right" )
    }
    else
    {
      // move v.x towards 0
      if ( this.v.x > 0 )
        this.v.x -= 10;
      else if ( this.v.x < 0 )
        this.v.x += 10;
    }
    
    /*if ( keyIsDown( DOWN_ARROW ) || keyIsDown( 83 ) )
    {
      this.v.y = -this.speed;
      //console.log( "down" )
    }
    else if ( keyIsDown( UP_ARROW ) || keyIsDown( 87 ) )
    {
      this.v.y = this.speed;
      //console.log( "up" )
    }
    else this.v.y = 0;*/
    
    if ( keyIsDown( 32 ) || keyIsDown( 87 ) || keyIsDown( UP_ARROW ) )
    {
      // jump
      this.v.y += this.speed * 0.6;
    }
  }
  
  boundingSphereCollision( other )
  {
    var r = this.collider.boundingSphereRadius + other.collider.boundingSphereRadius;
    
    var d = new Vec2(
      this.pos.x - other.pos.x,
      this.pos.y - other.pos.y
    ).magnitude();
    
    //console.log( d );
    
    return d < r;
  }
  
  updatePos()
  {
    super.updatePos();
  }
  
  checkCollision()
  {
    super.checkCollision(); // Screen bounds collision

    // obstacle collision    
    for ( var obstacle of obstacles )
    {
      //console.log( obstacle )
      //this.pos = new Vec2( 0, 200 );
      if ( this.boundingSphereCollision( obstacle ) )
      {
        // snap it to the surface of the collider
        this.v = this.v.normalise();
      }
    }
  }
  
  blit()
  {
    // coming from a Java background, this is both familiar and weird
    
    // control
    this.handleMovement();
    
    // position ticking and rendering
    super.blit();
  }
}

class PhysicsEngine
{
  tps;
  deltaGoal; // optimisation var; don't bother
  gravityScale;
  
  terminalV;
  
  sprite;
  
  constructor( sprite, tps = 10, gs = 1 )
  {
    this.sprite = sprite;
    
    this.tps = tps;
    this.gravityScale = gs;
    
    this.deltaGoal = 30 / tps;
    
    this.terminalV = this.gravityScale * 50;
  }
  
  tick()
  {
    //console.log( frameCount );
    if ( frameCount % this.deltaGoal != 0 ) return;
    
    if ( this.sprite.v.y > -this.terminalV )
      this.sprite.v.y -= this.gravityScale * 15;    
  }
}

// TODO: use this class in collision detection
class ColliderShape
{
  vertices; // array
  
  boundingSphereRadius; // Number
  
  constructor( vertices )
  {
    this.vertices = vertices;
    
    // TODO: calculate the bounding aphere
  }
}

class RectCollider extends ColliderShape
{
  constructor( width, height )
  {
    super(
      [
        new Vec2( -width/2, height/2 ),
        new Vec2( width/2, height/2 ),
        new Vec2( width/2, -height/2 ),
        new Vec2( -width/2, -height/2 )
      ] 
    );
    
    this.boundingSphereRadius = sqrt( width**2 + height**2 );
  }
}

class CircleCollider extends ColliderShape
{
  constructor( radius )
  {
    super( [] );
    
    this.boundingSphereRadius = radius;
  }
}








// +------------+
// | Scene code |
// +------------+

var halfW;
var halfH;

var playerTex;

var currentFps = 0;

var p;
var obstacles = [];

function setup()
{
  createCanvas( 600, 600 );
  
  // configurations
  frameRate( -1 );
  textSize( 30 );
  textAlign( LEFT, TOP );
  angleMode( DEGREES );
  
  // convenience vars
  halfW = width/2;
  halfH = height/2;
  
  // scene setup
  p = new Player(
    new Vec2( 0, 0 ),
    new Vec2( 20, 20 ),
    genTestTex(),
    new CircleCollider( 10 )
  );
  
  obstacles.push(
    new Sprite(
      new Vec2( 0, -100 ),
      new Vec2( 80, 80 ),
      genTestTex(),
      new CircleCollider( 40 ),
      false
    )
  );
}

function draw()
{
  background( 255 );
  
  //line( 0, height/2, width, height/2 );
  //line( width/2, 0, width/2, height );
  
  //image( tex, 0, 0)
  
  
  
  for ( var obstacle of obstacles )
  {
    obstacle.blit();
  }
  
  p.blit();
  
  // draw debug text
  if ( frameCount % 5 == 0 )
    currentFps = floor( 1000 / deltaTime );
  
  noStroke();
  fill( 0 );
  text(
    `FPS: ${currentFps}`,
    0, 0
  );
}

function genTestTex()
{
  var texbuf = createGraphics( 32, 32 );
  //texbuf.background( 0 );
  texbuf.translate( texbuf.width/2, texbuf.height/2 );
  texbuf.noStroke();
  texbuf.fill( randomCol() );
  texbuf.ellipse( 0, 0, texbuf.width, texbuf.height );
  
  return texbuf;
}

function randomCol()
{
  return [
    floor(random() * 256),
    floor(random() * 256),
    floor(random() * 256)
  ];
}
