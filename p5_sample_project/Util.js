

///////////////////////////////////
///
//////////////////////////////////


class SpringF32
{
    constructor( value )
    {
        this.mfValue = value ;
        this.mfSpeed = 0.0 ;
    }

    Get()
    {
        return this.mfValue ;
    }

    Set( value )
    {
        this.mfValue = value ;
        this.mfSpeed = 0.0 ;
    }

    AddSpeed( add )
    {
        this.mfSpeed += add ;
    }

    UpdateToTarget( target, k, dump )
    {
        this.mfValue += this.mfSpeed ;
        this.mfSpeed*= dump ;
        this.mfSpeed += ( target - this.mfValue ) * k ;
    }

}







// end of file
