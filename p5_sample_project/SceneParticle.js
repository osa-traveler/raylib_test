


///////////////////////////////////
///
//////////////////////////////////


class ObjEmitter extends ObjBase  
{
    constructor( pos ) 
    {
        super() ;

        this.mPos = pos ;
        this.mnCounter = 0 ;
        this.mnState = 0 ;
        this.mnInterval = 100000 ;
        this.mScale = new SpringF32( 1.0 ) ;
        
    }
  
    Init()
    {
        sys.print( "[ObjEmitter::Init]" );
        super.Init() ;
    }
   
    Reset()
    {
        sys.print( "[ObjEmitter::Reset]" );
        super.Reset() ;

        this.mnCounter = 0 ;
        this.mnState = 0 ;
        this.mnInterval =  100000 ;
        this.mScale.Set( 1.0 ) ;
        this.mScale.AddSpeed( 0.5 ) ;

    }
    
    Calc()
    {
        super.Calc() ;

        //SceneParticle sp = (SceneParticle)app.mCurrentScene ;
    
        this.mScale.UpdateToTarget( 1.0, 0.1, 0.90 ) ;
        
        switch( this.mnState )
        {
          case 0 :
          {
            if( 5 == this.mnCounter )
            {
              //mScale.addSpeed(0.25f) ;
              this.emit_( this.mPos.x, this.mPos.y ) ;
              this.mnState = 1 ;
              this.mnInterval = 120 ;
              return ;
            }
            
            break ; 
          }
          case 1 :
          {
            if( 0 == ( this.mnCounter % /*sp.mnEmitInterval*/16 ) )
            {
                this.mScale.AddSpeed( 0.25 ) ;
                this.emit_( this.mPos.x, this.mPos.y ) ;
            }
            break ; 
          }
          
        }
    
        ++this.mnCounter ;
    }

    Draw()
    {
        var fScale =  this.mScale.Get() ;
        if( fScale < 0.001 ){ fScale = 0.001 ; }
        sys.strokeWeight( 20 * fScale );
        sys.stroke( sys.color( 255, 255, 255, 255 ) ) ;
        sys.point( this.mPos.x, this.mPos.y ) ;
        
        sys.strokeWeight( 3 );
        sys.stroke( sys.color( 255, 64, 64, 255 ) ) ;
        sys.line( this.mPos.x -4*fScale , this.mPos.y, this.mPos.x +4*fScale, this.mPos.y ) ;
        sys.line( this.mPos.x , this.mPos.y-4*fScale, this.mPos.x , this.mPos.y +4*fScale) ;

    }

    DrawAfter()
    {
    }
    
    emit_( x, y )
    {
        for( var n = 0 ; n < 12 ; ++n )
        {
          var s = 3 * sys.random( 2.0 ) ;
          var v = sys.createVector( sys.cos( sys.radians( n * 30 ) ) * s, sys.sin( sys.radians( n * 30 ) ) * s ) ;
         
          var c = sys.color( 229 + sys.random(-50,50), 23+ sys.random(-15,128), 23+ sys.random(-15,128), 255 ) ;
          if( 0 == parseInt( sys.random(0,4) ) )
          {
            c = sys.color( 23+ sys.random(-15,128), 23+ sys.random(-15,128), 229 + sys.random(-50,50), 255 ) ;
          }
         
          app.ObjMgr.RequestAdd
          (
            new ObjParticle( c, sys.createVector( x, y ), v )
          ) ;
          
        }
    }


}

///////////////////////////////////
///
//////////////////////////////////


class ObjGravityGenerator extends ObjBase  
{
    constructor( pos ) 
    {
        super() ;

        this.mPos = pos ;
        this.mnCounter = 0 ;
        this.mnPower = 40.0 ;
        this.mScale = new SpringF32( 1.0 ) ;
        
    }

    Init()
    {
        sys.print( "[ObjGravityGenerator::Init]" );
        super.Init() ;
    }
   
    Reset()
    {
        sys.print( "[ObjGravityGenerator::Reset]" );
        super.Reset() ;

        this.mnCounter = 0 ;
        this.mnPower = 40.0 ;
        this.mScale.Set( 1.0 ) ; 

    }

    Calc() 
    {
      super.Calc() ;
      
      ++this.mnCounter ;
      
      if( 6000000 == this.mnCounter || this.mbShouldRemove )
      {
          //mbShouldRemove = true ;
        
          //SceneParticle sp = (SceneParticle)app.mCurrentScene ;
         //sp.removeGravityGenerator( this ) ;
      }
      
      this.mScale.UpdateToTarget( 1.0, 0.2, 0.8 ) ;
      
    }
    
    Draw()
    {
      //float fScale =  mScale.get() ;
      //if( fScale < 0.1f ){ fScale = 0.1f ; }
      //strokeWeight( 20 * fScale );
      //stroke( color( 255, 255, 255, 255 ) ) ;
      //point( mPos.x, mPos.y ) ;
      //strokeWeight( 3 );
      //stroke( color( 64, 64, 255, 255 ) ) ;
      //line( mPos.x -4*fScale , mPos.y, mPos.x +4*fScale, mPos.y ) ;
  
    }

}


///////////////////////////////////
///
//////////////////////////////////


class ObjParticle extends ObjBase 
{
    constructor( color, pos, vel ) 
    {
        super() ;

        this.mColor = color ;
        this.mPos   = pos ;
        this.mSpeed = vel ;
        this.mOldSpeed =  this.mSpeed ;

        this.mScale = new SpringF32( 1.0 ) ;
        this.mnFadeCounter = -1 ;
        this.mnCounter = 0 ;

    }
  
    Init()
    {

    }
   
    Reset()
    {
        this.mnCounter = 0 ;
    }
    
    Calc()
    {
        // scene
        var sp = app.CurrentScene ;
      
        // grav 
        this.mOldSpeed.set( this.mSpeed ) ;
        if( -1 == this.mnFadeCounter )
        {
            this.mSpeed.add( sp.calcGravity( this.mPos ) ) ;    
        }
    
        this.mPos.x += this.mSpeed.x ;
        this.mPos.y += this.mSpeed.y ;
    
        if( 600 == this.mnCounter || ( this.mnCounter == 15 && sp.mGGList.length==0 ) )
        {
            this.mnFadeCounter = 60 ;    
        }
    
        if( this.mnCounter == 60 && sp.mGGList.length==0 )
        {
            this.mnFadeCounter = 60 ;
        }
    
        if( this.mnFadeCounter > -1 )
        {
            --this.mnFadeCounter  ;
            if( 0 == this.mnFadeCounter )
            {
                this.mbShouldRemove = true ;
           }
        }

        this.mScale.UpdateToTarget( 1.0, 0.05, 0.85 ) ;

        this.mSpeed.x *= 0.975 ;
        this.mSpeed.y *= 0.975 ;

        // color
        {
            var fSpeed = this.mSpeed.mag() ;
            if( fSpeed > 10 ) { fSpeed = 10 ; }
            var alpha = sys.map( fSpeed, 0, 10, 255, 64) ;
            this.mColor = sys.color( sys.red( this.mColor), sys.green( this.mColor), sys.blue( this.mColor), alpha ) ;//( this.mColor & 0x00ffffff ) | ( alpha << 24 ) ;
        }

        if( sp.checkCollision( this ) )
        {
            this.mbShouldRemove = true ;
        }

        ++this.mnCounter  ;
    
    }

    Draw()
    {
        sys.strokeWeight( sys.sqrt( this.mSpeed.mag() ) / 0.5 ) ;
        sys.stroke(  this.mColor ) ;
        var fLength = 3 ;
        sys.line
        ( 
            this.mPos.x, this.mPos.y, 
            this.mPos.x + this.mSpeed.x * fLength, 
            this.mPos.y + this.mSpeed.y * fLength ) 
    }



    


}







///////////////////////////////////
///
//////////////////////////////////


class SceneParticle extends SceneBase
{

    constructor() 
    {
        super() ;

        this.mGGList = {} ;
        this.mnGGNum = 0 ;

        // 背景色の配列
        this.mBackgroundColors = [
            sys.color(80, 50, 120, 255),   // 暗い紫
            sys.color(20, 20, 60, 255),    // 濃い青
            sys.color(60, 20, 20, 255),    // 濃い赤
            sys.color(20, 60, 20, 255),    // 濃い緑
            sys.color(0, 0, 0, 255),       // 黒
            sys.color(40, 40, 40, 255)     // 濃いグレー
        ];
        this.mnCurrentColorIndex = 0;

    }
  
    Init()
    {
        sys.print( "[TestScene::Init]" );

        app.mBackground = this.mBackgroundColors[this.mnCurrentColorIndex] ;
        

        // エミッタ
        this.emitter = new ObjEmitter( sys.createVector( 200, 400 ) ) ;
        app.ObjMgr.RequestAdd( this.emitter ) ;

        // 2つ目のエミッタ
        this.emitter2 = new ObjEmitter( sys.createVector( 100, 100 ) ) ;
        app.ObjMgr.RequestAdd( this.emitter2 ) ;

        // 重力
        this.gravity = new ObjGravityGenerator( sys.createVector( 400, 300 ) ) ;
        app.ObjMgr.RequestAdd( this.gravity ) ;
        this.addGravityGenerator(this.gravity) ;
    }
    
    Reset()
    {
        sys.print( "[TestScene::Reset]" );

        //this.mGGList = {} ;
        //this.mnGGNum = 0 ;
    }
    
    Calc()
    {
        // スペースキーで背景色を変更
        if( app.InputMgr.isTrig('space') )
        {
            this.changeBackgroundColor();
        }

        /*
        if( app.InputMgr.isTrig('left') )
        {
            var c = sys.color( sys.int( sys.random(255) ), sys.int( sys.random(255) ), sys.int( sys.random(255) ),255 ) ;
            var pos   = sys.createVector( sys.random(300),sys.random(300) ,sys.random(300)  ) ;
            var vel   = sys.createVector( sys.random(5),sys.random(5) ,sys.random(5)  ) ;
            app.ObjMgr.RequestAdd( new ObjParticle( c, pos, vel  ) ) ;
        }*/



    }

    Draw()
    {

    }

    addGravityGenerator( gg )
    {
        this.mGGList[this.mnGGNum] = gg ;
        ++this.mnGGNum ;

        console.log(this.mGGList); 
    }
    removeGravityGenerator( gg )
    {
        for( var obj in this.mGGList )
        {
            if( this.mGGList[ obj ] == gg )
            {
                delete this.mGGList[ obj ] ;
            }
        }

    }

    calcGravity( pos )
    {
        var result = sys.createVector( 0,0 ) ;
        
        //console.log(this.mGGList);

        for( var obj in this.mGGList )
        {
            
            var gg = this.mGGList[ obj ] ;
            var tmp = gg.mPos.copy() ;
            var dist = p5.Vector.dist( tmp, pos ) ;
            if( dist < 20 ) { dist = 20 ; }
  
            tmp.sub( pos ) ;
            tmp.normalize();
            tmp.setMag( gg.mnPower / sys.sqrt( dist * dist ) ) ;

            result.add( tmp ) ;
        }
 
        return result ;

    }

    checkCollision( op )
    {
        for( var obj in this.mGGList )
        {
            
            var gg = this.mGGList[ obj ] ;

            var dist = p5.Vector.dist( gg.mPos, op.mPos ) ;
            if( dist < 20 && ( sys.abs( op.mSpeed.mag()) < 20.0 ) )
            {
                gg.mScale.AddSpeed( 0.1 ) ;
                return true ;
            }
        }
      
        return false ;
      
    }

    changeBackgroundColor()
    {
        this.mnCurrentColorIndex = (this.mnCurrentColorIndex + 1) % this.mBackgroundColors.length;
        app.mBackground = this.mBackgroundColors[this.mnCurrentColorIndex];
    }


}

// end of file
