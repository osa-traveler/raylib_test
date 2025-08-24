///////////////////////////////////
///
//////////////////////////////////

class ObjDancingShape extends ObjBase 
{
    constructor( pos, shapeType, color, size ) 
    {
        super() ;

        this.mPos = pos ;
        this.mOriginalPos = pos.copy() ; // 元の位置を保存
        this.mShapeType = shapeType ; // 0: 円, 1: 四角, 2: 三角, 3: 星
        this.mColor = color ;
        this.mSize = size ;
        
        // ダンス用パラメータ
        this.mDancePhase = sys.random(0, sys.TWO_PI) ; // 踊りの位相
        this.mDanceSpeed = sys.random(0.02, 0.08) ; // 踊りの速度
        this.mDanceRadius = sys.random(20, 60) ; // 踊りの半径
        this.mRotation = 0 ; // 回転角度
        this.mRotationSpeed = sys.random(-0.05, 0.05) ; // 回転速度
        this.mScale = new SpringF32( 1.0 ) ; // サイズのバネ
        this.mBouncePhase = sys.random(0, sys.TWO_PI) ; // バウンスの位相
        this.mBounceSpeed = sys.random(0.03, 0.1) ; // バウンス速度
        
        // 色の変化用
        this.mColorPhase = sys.random(0, sys.TWO_PI) ;
        this.mColorSpeed = sys.random(0.01, 0.04) ;
        this.mBaseHue = sys.random(360) ; // 基本色相
        
    }
  
    Init()
    {
        super.Init() ;
    }
   
    Reset()
    {
        super.Reset() ;
        this.mScale.Set( 1.0 ) ;
    }
    
    Calc()
    {
        super.Calc() ;
        
        // === 円運動のダンス ===
        var danceX = sys.cos(this.mDancePhase) * this.mDanceRadius ;
        var danceY = sys.sin(this.mDancePhase) * this.mDanceRadius * 0.5 ; // 縦方向は少し控えめ
        this.mPos.x = this.mOriginalPos.x + danceX ;
        this.mPos.y = this.mOriginalPos.y + danceY ;
        this.mDancePhase += this.mDanceSpeed ;
        
        // === 回転 ===
        this.mRotation += this.mRotationSpeed ;
        
        // === サイズのバウンス（あほっぽいイージング） ===
        this.mBouncePhase += this.mBounceSpeed ;
        
        // より大げさで弾力のあるバウンス
        var bounce1 = sys.sin(this.mBouncePhase) ;
        var bounce2 = sys.sin(this.mBouncePhase * 2.3) * 0.4 ;
        var bounce3 = sys.sin(this.mBouncePhase * 4.7) * 0.2 ;
        var combinedBounce = bounce1 + bounce2 + bounce3 ;
        
        // 適度な拡大縮小（0.7〜1.4倍）
        var bounceScale = 1.0 + combinedBounce * 0.35 ;
        
        // より弾力のあるスプリング設定
        this.mScale.UpdateToTarget( bounceScale, 0.2, 0.6 ) ;
        
        // === 色の変化 ===
        this.mColorPhase += this.mColorSpeed ;
        var hue = (this.mBaseHue + sys.sin(this.mColorPhase) * 60) % 360 ;
        var saturation = 80 + sys.cos(this.mColorPhase * 1.3) * 20 ;
        var brightness = 70 + sys.sin(this.mColorPhase * 0.7) * 30 ;
        sys.colorMode(sys.HSB, 360, 100, 100, 255) ;
        this.mColor = sys.color(hue, saturation, brightness, 200) ;
        sys.colorMode(sys.RGB, 255, 255, 255, 255) ; // 元に戻す
    }

    Draw()
    {
        sys.push() ;
        
        // 位置と回転を設定
        sys.translate( this.mPos.x, this.mPos.y ) ;
        sys.rotate( this.mRotation ) ;
        
        var currentSize = this.mSize * this.mScale.Get() ;
        
        sys.fill( this.mColor ) ;
        sys.stroke( sys.color(255, 255, 255, 100) ) ;
        sys.strokeWeight( 2 ) ;
        
        // 図形の種類に応じて描画
        switch( this.mShapeType )
        {
            case 0: // 円
                sys.ellipse( 0, 0, currentSize, currentSize ) ;
                break ;
            case 1: // 四角
                sys.rectMode(sys.CENTER) ;
                sys.rect( 0, 0, currentSize, currentSize ) ;
                break ;
            case 2: // 三角
                this.drawTriangle( currentSize ) ;
                break ;
            case 3: // 星
                this.drawStar( currentSize ) ;
                break ;
        }
        
        sys.pop() ;
    }
    
    drawTriangle( size )
    {
        var h = size * 0.5 ;
        sys.triangle( 0, -h, -h, h, h, h ) ;
    }
    
    drawStar( size )
    {
        var outerRadius = size * 0.5 ;
        var innerRadius = outerRadius * 0.4 ;
        var numPoints = 5 ;
        
        sys.beginShape() ;
        for( var i = 0; i < numPoints * 2; i++ )
        {
            var angle = (i * sys.PI) / numPoints ;
            var radius = (i % 2 == 0) ? outerRadius : innerRadius ;
            var x = sys.cos(angle) * radius ;
            var y = sys.sin(angle) * radius ;
            sys.vertex( x, y ) ;
        }
        sys.endShape(sys.CLOSE) ;
    }
}

///////////////////////////////////
///
//////////////////////////////////

class SceneDance extends SceneBase
{
    constructor() 
    {
        super() ;
        
        this.mShapes = [] ; // 図形の配列
        this.mBeatCounter = 0 ; // ビートカウンター
        this.mBeatInterval = 60 ; // ビート間隔（フレーム）
        this.mCurrentBeat = 0 ; // 現在のビート
        this.mShowDebugInfo = false ; // デバッグ情報の表示フラグ
        
        // 背景色（より派手に）
        this.mBackgroundColors = [
            sys.color(50, 20, 80, 255),    // 鮮やかな紫
            sys.color(80, 20, 20, 255),    // 鮮やかな赤
            sys.color(20, 80, 20, 255),    // 鮮やかな緑
            sys.color(20, 20, 80, 255),    // 鮮やかな青
            sys.color(80, 50, 20, 255),    // 鮮やかなオレンジ
            sys.color(80, 20, 80, 255),    // 鮮やかなマゼンタ
            sys.color(20, 80, 80, 255),    // 鮮やかなシアン
            sys.color(60, 60, 20, 255),    // 鮮やかな黄色系
        ];
        this.mnCurrentColorIndex = 0;
    }
  
    Init()
    {
        sys.print( "[SceneDance::Init]" );
        
        app.mBackground = this.mBackgroundColors[this.mnCurrentColorIndex] ;
        
        // 踊る図形を生成
        this.createDancingShapes() ;
    }
    
    Reset()
    {
        sys.print( "[SceneDance::Reset]" );
        this.mBeatCounter = 0 ;
        this.mCurrentBeat = 0 ;
    }
    
    Calc()
    {
        // ビート管理
        this.mBeatCounter++ ;
        if( this.mBeatCounter >= this.mBeatInterval )
        {
            this.mBeatCounter = 0 ;
            this.mCurrentBeat++ ;
            this.onBeat() ; // ビート時の処理
        }
        
        // 背景色切り替え
        if( app.InputMgr.isTrig('space') )
        {
            this.changeBackgroundColor() ;
        }
        
        // ビート間隔調整
        if( app.InputMgr.isTrig('right') )
        {
            this.mBeatInterval = Math.max(this.mBeatInterval - 5, 20) ; // ビートを速く
        }
        if( app.InputMgr.isTrig('left') )
        {
            this.mBeatInterval = Math.min(this.mBeatInterval + 5, 120) ; // ビートを遅く
        }
        
        // 新しい図形を追加
        if( app.InputMgr.isTrig('a') )
        {
            this.addRandomShape() ;
        }
        
        // デバッグ情報の表示切り替え
        if( app.InputMgr.isTrig('d') )
        {
            this.mShowDebugInfo = !this.mShowDebugInfo ;
        }
    }

    Draw()
    {
        // デバッグ情報の表示（Dキーで切り替え）
        if( this.mShowDebugInfo )
        {
            sys.fill( sys.color(255, 255, 255, 180) ) ;
            sys.textSize(16) ;
            sys.text( "Beat Interval: " + this.mBeatInterval, 10, 25 ) ;
            sys.text( "Beat Count: " + this.mCurrentBeat, 10, 45 ) ;
            sys.text( "Left/Right: Change beat speed", 10, 65 ) ;
            sys.text( "Space: Change background", 10, 85 ) ;
            sys.text( "A: Add random shape", 10, 105 ) ;
            sys.text( "D: Toggle debug info", 10, 125 ) ;
            
            // ビートインジケーター
            var beatProgress = this.mBeatCounter / this.mBeatInterval ;
            sys.fill( sys.color(255, 255, 0, 150) ) ;
            sys.rect( 10, 140, 200 * beatProgress, 10 ) ;
            sys.noFill() ;
            sys.stroke( sys.color(255, 255, 255, 100) ) ;
            sys.rect( 10, 140, 200, 10 ) ;
        }
    }
    
    createDancingShapes()
    {
        // 初期図形を配置（50個に増加）
        for( var i = 0; i < 50; i++ )
        {
            this.addRandomShape() ;
        }
    }
    
    addRandomShape()
    {
        var x = sys.random(100, sys.width - 100) ;
        var y = sys.random(100, sys.height - 100) ;
        var shapeType = sys.int(sys.random(4)) ; // 0-3の図形タイプ
        var size = sys.random(30, 80) ;
        
        // SceneParticleを参考にした調和のある色配置
        var color ;
        if( sys.random() < 0.7 ) // 70%の確率で暖色系（赤〜オレンジ系）
        {
            var r = 200 + sys.random(-30, 55) ; // 170-255
            var g = 50 + sys.random(-20, 80) ;  // 30-130
            var b = 50 + sys.random(-20, 80) ;  // 30-130
            color = sys.color(r, g, b, 220) ;
        }
        else // 30%の確率で寒色系（青系）
        {
            var r = 50 + sys.random(-20, 80) ;  // 30-130
            var g = 50 + sys.random(-20, 80) ;  // 30-130
            var b = 200 + sys.random(-30, 55) ; // 170-255
            color = sys.color(r, g, b, 220) ;
        }
        
        var shape = new ObjDancingShape( 
            sys.createVector(x, y), 
            shapeType, 
            color, 
            size 
        ) ;
        
        app.ObjMgr.RequestAdd( shape ) ;
    }
    
    onBeat()
    {
        // ビート時に全図形にパルス効果を与える
        // この処理はObjMgrを通じて実行される各図形のCalc()で個別に処理
        
        // 4ビートごとに新しい図形を追加
        if( this.mCurrentBeat % 4 == 0 )
        {
            if( sys.random() < 0.3 ) // 30%の確率
            {
                this.addRandomShape() ;
            }
        }
        
        // 8ビートごとに背景色を変更
        if( this.mCurrentBeat % 8 == 0 )
        {
            this.changeBackgroundColor() ;
        }
    }
    
    changeBackgroundColor()
    {
        this.mnCurrentColorIndex = (this.mnCurrentColorIndex + 1) % this.mBackgroundColors.length;
        app.mBackground = this.mBackgroundColors[this.mnCurrentColorIndex];
    }
}

// end of file