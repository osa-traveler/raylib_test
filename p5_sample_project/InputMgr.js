


class InputMgr 
{
    constructor() 
    {
        this.OldPressed = { "right":false, "left":false, "space":false, "1":false, "2":false, "3":false, "4":false, "a":false, "d":false, "z":false, "r":false } ;
        this.Pressed = {  "right":false, "left":false, "space":false, "1":false, "2":false, "3":false, "4":false, "a":false, "d":false, "z":false, "r":false } ;
    }
  
    Init()
    {
        sys.print( "[InputMgr::Init]" );
    }
   
    Reset()
    {
        sys.print( "[InputMgr::Reset]" );
        
        for( var key in this.OldPressed )
        {
            this.OldPressed[ key ] = false ;
        }
        for( var key in this.Pressed )
        {
            this.Pressed[ key ]  = false ;
        }

        //mMousePos.set( mouseX, mouseY ) ;
    }
    
    Calc()
    {
        for( var key in this.OldPressed )
        {
            this.OldPressed[ key ] = this.Pressed[ key ] ;
            //sys.print(key);//right, left
        }




      
        // mouse
        //mbPressed[ Key.cMouse.ordinal()] = mousePressed ;
      
        //mMousePos.set( mouseX, mouseY ) ;
      
      
    }

    keyPressed()
    {
        switch( sys.key )
        {
        case '%' : { this.Pressed[ 'left' ] = true ;  break ; } 
        case '\'': { this.Pressed[ 'right' ] = true ; break ; } 
        case 'A': { this.Pressed[ 'a' ] = true ; break ; } 
        case 'D': { this.Pressed[ 'd' ] = true ; break ; } 
        case 'Z': { this.Pressed[ 'z' ] = true ; break ; } 
        case 'R': { this.Pressed[ 'r' ] = true ; break ; } 
        case ' ': { this.Pressed[ 'space' ] = true ; break ; } 
        case '1': { this.Pressed[ '1' ] = true ; break ; } 
        case '2': { this.Pressed[ '2' ] = true ; break ; } 
        case '3': { this.Pressed[ '3' ] = true ; break ; } 
        case '4': { this.Pressed[ '4' ] = true ; break ; } 
        }


    }

    keyReleased()
    {
        switch( sys.key )
        {
        case '%' : { this.Pressed[ 'left' ] = false ; break ; } 
        case '\'': { this.Pressed[ 'right' ] = false ; break ; } 
        case 'A': { this.Pressed[ 'a' ] = false ; break ; } 
        case 'D': { this.Pressed[ 'd' ] = false ; break ; } 
        case 'Z': { this.Pressed[ 'z' ] = false ; break ; } 
        case 'R': { this.Pressed[ 'r' ] = false ; break ; } 
        case ' ': { this.Pressed[ 'space' ] = false ; break ; } 
        case '1': { this.Pressed[ '1' ] = false ; break ; } 
        case '2': { this.Pressed[ '2' ] = false ; break ; } 
        case '3': { this.Pressed[ '3' ] = false ; break ; } 
        case '4': { this.Pressed[ '4' ] = false ; break ; } 
        

        }

    }
    

    isHold( k )
    {
        return this.Pressed[ k ] ;
    }
    isTrig( k )
    {
        return this.Pressed[ k ] && !this.OldPressed[ k ] ;
    }



  }













// end of file
