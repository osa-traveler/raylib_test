
///////////////////////////////////
///
//////////////////////////////////






///////////////////////////////////
///
//////////////////////////////////


class ObjBase 
{
    constructor() 
    {
        this.mbShouldRemove = false ;
    }
  
    Init()
    {
        sys.print( "[ObjBase::Init]" );
    }
   
    Reset()
    {
        sys.print( "[ObjBase::Reset]" );

    }
    
    Calc()
    {
    }

    Draw()
    {
    }

    DrawAfter()
    {
    }
    
    shouldRemove()
    {
      return this.mbShouldRemove ;
    }
    


}


///////////////////////////////////
///
//////////////////////////////////


class ObjMgr 
{
    constructor() 
    {
        this.Objs = {} ;
        this.AddRequested = {} ;
        this.ObjNum = 0 ;
        this.RequestNum = 0 ;
    }
  
    Init()
    {
        sys.print( "[SceneBase::Init]" );

        // scene.initで初期追加されていることがある
        for( var obj in this.AddRequested )
        {
            this.add_( this.AddRequested[ obj ] ) ;
        }


    }
   
    Reset()
    {
        sys.print( "[SceneBase::Reset]" );

        this.AddRequested = {} ;
        this.RequestNum = 0 ;

        for( var obj in this.Objs )
        {
            this.Objs[ obj ].Reset() ;
        }


    }
    
    Calc()
    {
        var bCalc = true ;

        if( bCalc )
        {
            for( var obj in this.Objs )
            {
                this.Objs[ obj ].Calc() ;
            }
        }

        for( var obj in this.AddRequested )
        {
            this.add_( this.AddRequested[ obj ] ) ;
        }

        this.AddRequested = {} ;
        this.RequestNum = 0 ;

        this.checkRemove_() ;

    }

    Draw()
    {
        for( var obj in this.Objs )
        {
            this.Objs[ obj ].Draw() ;
        }
        for( var obj in this.Objs )
        {
            this.Objs[ obj ].DrawAfter() ;
        }

    }

    Clear()
    {
        this.Objs = {} ;
        this.ObjNum = 0 ;
    }

    RequestAdd( obj )
    {
        this.AddRequested[ this.RequestNum ] = obj ; 
        ++this.RequestNum ;
    }

    checkRemove_() 
    {
        for( var obj in this.Objs )
        {
            if( this.Objs[ obj ].shouldRemove() )
            {
                delete this.Objs[ obj ] ;
            }
        }
    }

    add_( obj )
    {
        obj.Init() ;
        obj.Reset() ;
        this.Objs[ this.ObjNum ] = obj ;

        ++this.ObjNum ;

    }



}



// end of file
