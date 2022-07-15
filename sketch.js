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
  
  physics;
  
  constructor( pos, size, texbuf )
  {
    this.pos = pos;
    this.size = size;
    this.halfSize = this.size.divideScalar( 2 );
    this.texbuf = texbuf;
    this.v = new Vec2( 0, 0 );
    
    this.physics = new PhysicsEngine( this );
  }
  
  updatePos()
  {
    this.physics.tick();
    this.pos = this.pos.addVec( this.v );
    
    //console.log( this.v );
    
    this.checkCollision();
  }
  
  checkCollision()
  {
    if ( this.pos.x > halfW - this.halfSize.x )
    {
      this.pos.x = halfW - this.halfSize.x;
      this.v.x = 0;
    }
    else if ( this.pos.x < -halfW + this.halfSize.x )
    {
      this.pos.x = -halfW + this.halfSize.y;
      this.v.x = 0;
    }
    
    if ( this.pos.y > halfH - this.halfSize.y )
    {
      this.pos.y = halfH - this.halfSize.y;
      this.v.y = 0;
    }
    else if ( this.pos.y < -halfH + this.halfSize.y )
    {
      this.pos.y = -halfH + this.halfSize.y;
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
  }
}

class Player extends Sprite
{
  speed;
  
  constructor( pos, size, texbuf )
  {
    super( pos, size, texbuf );
    
    this.speed = 10;
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
        this.v.x -= 1;
      else if ( this.v.x < 0 )
        this.v.x += 1;
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
    
    if ( keyIsDown( 32 ) )
    {
      // jump
      this.v.y += 3;
    }
  }
  
  blit()
  {
    // coming from a Java background, this is both familiar and weird
    this.handleMovement();
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
    
    this.terminalV = this.gravityScale * 10;
  }
  
  tick()
  {
    //console.log( frameCount );
    if ( frameCount % this.deltaGoal != 0 ) return;
    
    //if ( this.sprite.v.y < -this.terminalV )
    this.sprite.v.y -= 3;
    
    //else this.sprite.v.y = 0;
    
    console.log( this.sprite.v.y )
    
  }
}

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
    genPlayerTex()
  );
  
  obstacles.push(
    new Sprite(
      new Vec2( 0, -halfH ),
      new Vec2( width, 10 ),
      genPlayerTex()
    )
  );
}

function draw()
{
  background( 255 );
  
  //line( 0, height/2, width, height/2 );
  //line( width/2, 0, width/2, height );
  
  //image( tex, 0, 0)
  
  p.blit();
  
  for ( var obstacle of obstacles )
  {
    obstacle.blit();
  }
}

function genPlayerTex()
{
  var texbuf = createGraphics( 32, 32 );
  //atexbuf.background( 0 );
  texbuf.translate( texbuf.width/2, texbuf.height/2 );
  texbuf.noStroke();
  texbuf.fill( 0, 0, 255 );
  texbuf.ellipse( 0, 0, texbuf.width, texbuf.height );
  
  return texbuf;
}
