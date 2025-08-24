





///////////////////////////////////
///
//////////////////////////////////


class TestObj extends ObjBase 
{
    constructor( x, y ) 
    {
        super() ;

        this.xpos = x ;
        this.ypos = y ;
        this.counter = 0 ;

    }
  
    Init()
    {
        sys.print( "[TestObj::Init]" );


    }
   
    Reset()
    {
        sys.print( "[TestObj::Reset]" );

    }
    
    Calc()
    {
        if( app.InputMgr.isHold( 'right' ) )
        {
            //this.xpos = this.xpos + 1.0 ;
        }
        if( app.InputMgr.isHold( "left" ) )
        {
            //this.xpos = this.xpos - 1.0 ;
        }

        if( 120 == this.counter )
        {
            this.mbShouldRemove = true ;

        }

        ++this.counter ;



    }

    Draw()
    {
        sys.ellipse( this.xpos, this.ypos, 100, 100 ) ;

    }

    DrawAfter()
    {
    }
    

    


}

///////////////////////////////////
///
//////////////////////////////////


class TestScene extends SceneBase
{

    constructor() 
    {
        super() ;
    }
  
    Init()
    {
        sys.print( "[TestScene::Init]" );

        app.ObjMgr.RequestAdd( new TestObj( sys.random(50,600), sys.random(0,400 )) ) ;

    }
   
    Reset()
    {
        sys.print( "[TestScene::Reset]" );

    }
    
    Calc()
    {
        if( app.InputMgr.isTrig('left') )
        {
            app.ObjMgr.RequestAdd( new TestObj( sys.random(50,600), sys.random(0,400 )) ) ;

        }



    }

    Draw()
    {

    }

}




// end of file
