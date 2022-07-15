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
  
  constructor( pos, size, texbuf )
  {
    this.pos = pos;
    this.size = size;
    this.halfSize = this.size.divideScalar( 2 );
    this.texbuf = texbuf;
    this.v = new Vec2( 0, 0 );
  }
  
  updatePos()
  {
    this.pos = this.pos.addVec( this.v );
    
    //console.log( this.v );
    
    this.checkCollision();
  }
  
  checkCollision()
  {
    if ( this.pos.x > halfW - this.halfSize.x )
    {
      this.pos.x = halfW - this.halfSize.x;
    }
    else if ( this.pos.x < -halfW + this.halfSize.x )
    {
      this.pos.x = -halfW + this.halfSize.y;
    }
    
    if ( this.pos.y > halfH - this.halfSize.y )
    {
      this.pos.y = halfH - this.halfSize.y;
    }
    else if ( this.pos.y < -halfH + this.halfSize.y )
    {
      this.pos.y = -halfH + this.halfSize.y;
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
    if ( keyIsDown( LEFT_ARROW ) )
    {
      this.v.x = -this.speed;
      //console.log( "left" )
    }
    else if ( keyIsDown( RIGHT_ARROW ) )
    {
      this.v.x = this.speed;
      //console.log( "right" )
    }
    else this.v.x = 0;
    
    if ( keyIsDown( DOWN_ARROW ) )
    {
      this.v.y = -this.speed;
      //console.log( "down" )
    }
    else if ( keyIsDown( UP_ARROW ) )
    {
      this.v.y = this.speed;
      //console.log( "up" )
    }
    else this.v.y = 0;
  }
  
  blit()
  {
    // coming from a Java background, this is both familiar and weird
    this.handleMovement();
    super.blit();
  }
}

var halfW;
var halfH;

var playerTex;

var p;
var obstacle;
function setup() {
  createCanvas(400, 400);
  
  halfW = width/2;
  halfH = height/2;
  
  playerTex = createGraphics( 20, 20 );
  playerTex.background( 0 );
  playerTex.ellipse( playerTex.width/2, playerTex.height/2, playerTex.width, playerTex.height );
  
  p = new Player( new Vec2( 0, 0 ), new Vec2( 20, 20 ), playerTex );
  
  obstacle = new Sprite(
    new Vec2( 0, -halfH ),
    new Vec2( width, 10 ),
    playerTex
  );
}

function draw() {
  background( 255 );
  
  line( 0, height/2, width, height/2 );
  line( width/2, 0, width/2, height );
  
  //image( tex, 0, 0)
  
  p.blit();
  //obstacle.blit();
}
