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
  
  magnitude()
  {
    return this.length;
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
  
  boundingSphereRadius; // precomputed; TODO: does not account for scaling of objects
  
  physics;
  
  constructor( pos, size, texbuf, active )
  {
    this.pos = pos;
    this.size = size;
    this.halfSize = this.size.divideScalar( 2 );
    this.texbuf = texbuf;
    this.v = new Vec2( 0, 0 );
    
    if ( active )
      this.physics = new PhysicsEngine( this );
    
    this.boundingSphereRadius = sqrt( this.size.x**2 + this.size.y**2 ) / 2;
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
  
  checkCollisionWithSprite( sprite )
  {
    // step 1. Bounding sphere check
      
    // compute the distance between us and the sprite
    var d = new Vec2(
      this.pos.x - sprite.pos.x,
      this.pos.y - sprite.pos.y
    ).magnitude();
      
    // compute te sum of the radii of bounding circles
    var r = this.boundingSphereRadius + sprite.boundingSphereRadius;
    //console.log( d )
    
    // check
    // these bounding spheres are purposely LARGER
    // than the objects themselves
    return d < r;
    
    // TODO: implement more tests, using the bounding sphere as a guide
  }
  
  blit()
  {
    var temp = this.pos.convertPos();
    
    image(
      this.texbuf,
      temp.x - this.size.x/2,
      temp.y - this.size.y/2,
      this.size.x,
      this.size.y
    );
  }
}

class Player extends Sprite
{
  speed;
  
  constructor( pos, size, texbuf )
  {
    super( pos, size, texbuf, true );
    
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
  
  updatePos()
  {
    this.physics.tick(); // add gravity
    
    this.pos = this.pos.addVec( this.v.multScalar( deltaTime/100 ) ); // update its position
    
    //console.log( this.v );
    this.checkCollision(); // correct its new position if needed
  }
  
  checkCollision()
  {
    // obstacle collision    
    for ( var obstacle of obstacles )
    {
      if ( obstacle.checkCollisionWithSprite( this ) )
      {
        this.v.y = 0;
      }
    }
    
    // screen bounds collision
    this.checkCollisionInsideBounds( -halfW, halfW, -halfH, halfH );
  }
  
  blit()
  {
    // coming from a Java background, this is both familiar and weird
    this.handleMovement();
    this.updatePos();
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
    
    this.terminalV = this.gravityScale * 20;
  }
  
  tick()
  {
    //console.log( frameCount );
    if ( frameCount % this.deltaGoal != 0 ) return;
    
    if ( this.sprite.v.y > -this.terminalV )
      this.sprite.v.y -= this.gravityScale * 10;    
  }
}

// TODO: use this class in collision detection
class Collider
{
  vertices = [];
}







// +------------+
// | Scene code |
// +------------+

var halfW;
var halfH;

var playerTex;

var p;
var obstacles = [];
function setup()
{
  createCanvas( 600, 600 );
  
  frameRate( 30 );
  
  halfW = width/2;
  halfH = height/2;
  
  p = new Player(
    new Vec2( 0, 0 ),
    new Vec2( 20, 20 ),
    genTestTex()
  );
  
  obstacles.push(
    new Sprite(
      new Vec2( 0, -100 ),
      new Vec2( 80, 80 ),
      genTestTex()
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
}

function genTestTex()
{
  var texbuf = createGraphics( 32, 32 );
  texbuf.background( 0 );
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
