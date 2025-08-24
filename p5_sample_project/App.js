

class App
{
    constructor()
    {
        sys.print( '[App::constructor]' ) ;

        this.mBackground = sys.color( 128, 128, 128 , 255 ) ;
        this.InputMgr = new InputMgr() ;
        
        // シーン管理
        this.mScenes = [
            new SceneParticle(),
            new SceneRain(),
            new SceneDance(),
            new Scene2DAction(),
            new SceneSnow()
        ];
        this.mnCurrentSceneIndex = 4 ; // 2DActionシーンをデフォルトに変更
        this.CurrentScene = this.mScenes[this.mnCurrentSceneIndex] ;
        this.ObjMgr = new ObjMgr() ;
        


    }

    Init()
    {
        sys.print( '[App::Init]' ) ;

        this.InputMgr.Init() ;
        this.CurrentScene.Init() ;
        this.ObjMgr.Init() ;

    }

    Reset()
    {
        sys.print( '[App::Reset]' ) ;

        this.InputMgr.Reset() ;
        this.CurrentScene.Reset() ;
        this.ObjMgr.Reset() ;
    }

    Calc()
    {
        // シーン切り替え（1キー、2キー、3キー、4キー）
        if( this.InputMgr.isTrig('1') )
        {
            this.changeScene(0) ;
        }
        if( this.InputMgr.isTrig('2') )
        {
            this.changeScene(1) ;
        }
        if( this.InputMgr.isTrig('3') )
        {
            this.changeScene(2) ;
        }
        if( this.InputMgr.isTrig('4') )
        {
            this.changeScene(3) ;
        }
        if( this.InputMgr.isTrig('5') )
        {
            this.changeScene(4) ;
        }
        
        this.CurrentScene.Calc() ;

        this.ObjMgr.Calc() ;

        this.InputMgr.Calc() ;
    }

    Draw()
    {
        sys.background( this.mBackground ) ;
 
        this.ObjMgr.Draw() ;
        
        this.CurrentScene.Draw() ;
      
    }

    changeScene( sceneIndex )
    {
        if( sceneIndex >= 0 && sceneIndex < this.mScenes.length )
        {
            this.mnCurrentSceneIndex = sceneIndex ;
            this.CurrentScene = this.mScenes[this.mnCurrentSceneIndex] ;
            
            // オブジェクトマネージャーをクリア
            this.ObjMgr.Clear() ;
            
            // 新しいシーンを初期化
            this.CurrentScene.Init() ;
            this.CurrentScene.Reset() ;
            
            sys.print( '[App::changeScene] Scene changed to: ' + sceneIndex ) ;
        }
    }


}






// end of file
