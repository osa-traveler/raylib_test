///////////////////////////////////
///
//////////////////////////////////

class ObjSnowflake extends ObjBase 
{
    constructor( pos, size, depth ) 
    {
        super() ;

        this.mPos = pos ;
        this.mSize = size ;
        this.mDepth = depth ; // 奥行き情報 (0: 手前, 1: 中間, 2: 奥)
        this.mSpeed = sys.random(0.5, 2.0) ; // 落下速度
        this.mRotation = sys.random(0, sys.TWO_PI) ; // 回転角度
        this.mRotationSpeed = sys.random(-0.02, 0.02) ; // 回転速度
        
        // 雪の特性的な横移動（風の影響）
        this.mDriftX = sys.random(-0.3, 0.3) ;
        this.mDriftY = 0 ;
        
        // ノイズベースの軌道用
        this.mNoiseOffsetX = sys.random(10000) ;
        this.mNoiseOffsetY = sys.random(10000) ;
        this.mNoiseScale = 0.005 ; // 雨より遅いノイズ
        this.mNoiseStrength = 0.8 ; // ノイズの強さ
        
        // 生存時間管理
        this.mLifeTime = 0 ;
        this.mMaxLifeTime = sys.random(600, 1200) ; // 雨より長い寿命
        
        // 雪片の透明度
        this.mAlpha = sys.random(150, 255) ;
        this.mInitialAlpha = this.mAlpha ;
        
        // 奥行きに応じて色とサイズを調整
        this.setPropertiesByDepth() ;
        
        // 初期色を設定
        this.updateColor() ;
    }
  
    Init()
    {
        super.Init() ;
    }
   
    Reset()
    {
        super.Reset() ;
    }
    
    Calc()
    {
        super.Calc() ;
        
        // 雪片の落下（重力）
        this.mPos.y += this.mSpeed ;
        
        // 風による横移動
        this.mPos.x += this.mDriftX ;
        
        // ノイズベースの自然な動き
        var timeOffset = sys.frameCount * this.mNoiseScale ;
        var noiseX = sys.noise(this.mNoiseOffsetX + timeOffset) ;
        var noiseY = sys.noise(this.mNoiseOffsetY + timeOffset) ;
        
        // ノイズ値を-1〜1の範囲に変換して適用
        this.mPos.x += (noiseX - 0.5) * this.mNoiseStrength ;
        this.mSpeed += (noiseY - 0.5) * 0.05 ; // 微細な落下速度変動
        
        // 回転
        this.mRotation += this.mRotationSpeed ;
        
        // 画面下に到達したら削除
        if( this.mPos.y > sys.height + this.mSize )
        {
            this.mbShouldRemove = true ;
        }
        
        // 横に画面外に出た場合は反対側に移動
        if( this.mPos.x > sys.width + this.mSize )
        {
            this.mPos.x = -this.mSize ;
        }
        else if( this.mPos.x < -this.mSize )
        {
            this.mPos.x = sys.width + this.mSize ;
        }
        
        // 時間経過による微細なフェード
        this.mLifeTime++ ;
        var fadeRatio = 1.0 - (this.mLifeTime / this.mMaxLifeTime) ;
        this.mAlpha = this.mInitialAlpha * Math.max(fadeRatio, 0.3) ; // 完全に消えないよう最低30%は保持
        
        // 色を更新
        this.updateColor() ;
    }

    Draw()
    {
        sys.push() ;
        
        // 雪片の位置に移動
        sys.translate( this.mPos.x, this.mPos.y ) ;
        sys.rotate( this.mRotation ) ;
        
        sys.fill( this.mColor ) ;
        sys.noStroke() ;
        
        // 雪片を6角形で描画
        this.drawSnowflake() ;
        
        sys.pop() ;
    }
    
    setPropertiesByDepth()
    {
        switch( this.mDepth )
        {
            case 0: // 手前 - 大きくて濃い白
                this.mSize *= 1.2 ;
                this.mSpeed *= 0.8 ; // ゆっくり落下
                break ;
            case 1: // 中間 - 普通サイズ
                this.mSize *= 1.0 ;
                this.mSpeed *= 1.0 ;
                break ;
            case 2: // 奥 - 小さくて薄い
                this.mSize *= 0.7 ;
                this.mSpeed *= 1.3 ; // 速く落下
                this.mAlpha *= 0.6 ;
                break ;
        }
    }
    
    updateColor()
    {
        // 奥行きと時間に応じて色を調整
        var baseAlpha = this.mAlpha ;
        
        switch( this.mDepth )
        {
            case 0: // 手前 - 濃い白
                this.mColor = sys.color(255, 255, 255, baseAlpha) ;
                break ;
            case 1: // 中間 - 少し薄い白
                this.mColor = sys.color(240, 240, 250, baseAlpha * 0.8) ;
                break ;
            case 2: // 奥 - 薄い白
                this.mColor = sys.color(220, 220, 240, baseAlpha * 0.6) ;
                break ;
        }
    }
    
    drawSnowflake()
    {
        var size = this.mSize ;
        
        // シンプルな雪片形状（6本の線で構成）
        sys.stroke( this.mColor ) ;
        sys.strokeWeight( this.mDepth == 0 ? 2 : 1 ) ;
        
        for( var i = 0; i < 6; i++ )
        {
            var angle = i * sys.PI / 3 ;
            var x1 = sys.cos(angle) * size * 0.5 ;
            var y1 = sys.sin(angle) * size * 0.5 ;
            var x2 = sys.cos(angle) * size * 0.2 ;
            var y2 = sys.sin(angle) * size * 0.2 ;
            
            // メインの線
            sys.line( 0, 0, x1, y1 ) ;
            
            // 枝の線
            var branchAngle1 = angle + sys.PI / 6 ;
            var branchAngle2 = angle - sys.PI / 6 ;
            var branchX1 = sys.cos(branchAngle1) * size * 0.15 ;
            var branchY1 = sys.sin(branchAngle1) * size * 0.15 ;
            var branchX2 = sys.cos(branchAngle2) * size * 0.15 ;
            var branchY2 = sys.sin(branchAngle2) * size * 0.15 ;
            
            sys.line( x2, y2, x2 + branchX1, y2 + branchY1 ) ;
            sys.line( x2, y2, x2 + branchX2, y2 + branchY2 ) ;
        }
        
        // 中央の小さな円
        sys.noStroke() ;
        sys.fill( this.mColor ) ;
        sys.ellipse( 0, 0, size * 0.1, size * 0.1 ) ;
    }
}

///////////////////////////////////
///
//////////////////////////////////

class SceneSnow extends SceneBase
{
    constructor() 
    {
        super() ;
        
        this.mnSnowflakeCounter = 0 ;
        this.mnSnowIntensity = 2 ; // 雪の強さ（1フレームに生成する雪片数）
        this.mnWindStrength = 0.3 ; // 風の強さ
        
        // 背景色（雪の日の空）
        this.mBackgroundColors = [
            sys.color(200, 210, 220, 255),    // 明るい雪空
            sys.color(180, 190, 200, 255),    // 曇りの雪空
            sys.color(160, 170, 185, 255),    // 薄暗い雪空
            sys.color(220, 225, 235, 255),    // 非常に明るい雪空
        ];
        this.mnCurrentColorIndex = 0;
    }
  
    Init()
    {
        sys.print( "[SceneSnow::Init]" );
        
        app.mBackground = this.mBackgroundColors[this.mnCurrentColorIndex] ;
    }
    
    Reset()
    {
        sys.print( "[SceneSnow::Reset]" );
        this.mnSnowflakeCounter = 0 ;
    }
    
    Calc()
    {
        // 雪片を生成
        for( var i = 0; i < this.mnSnowIntensity; i++ )
        {
            this.createSnowflake() ;
        }
        
        // 背景色切り替え
        if( app.InputMgr.isTrig('space') )
        {
            this.changeBackgroundColor() ;
        }
        
        // 雪の強さ調整
        if( app.InputMgr.isTrig('right') )
        {
            this.mnSnowIntensity = Math.min(this.mnSnowIntensity + 1, 8) ;
        }
        if( app.InputMgr.isTrig('left') )
        {
            this.mnSnowIntensity = Math.max(this.mnSnowIntensity - 1, 0) ;
        }
        
        ++this.mnSnowflakeCounter ;
    }

    Draw()
    {
        // 雪の情報を表示
        sys.fill( sys.color(80, 80, 80, 200) ) ;
        sys.textSize(16) ;
        sys.text( "Snow Intensity: " + this.mnSnowIntensity, 10, 25 ) ;
        sys.text( "Left/Right: Change intensity", 10, 45 ) ;
        sys.text( "Space: Change sky color", 10, 65 ) ;
    }
    
    createSnowflake()
    {
        var x = sys.random(-20, sys.width + 20) ;
        var y = sys.random(-50, -10) ;
        
        // 奥行きをランダムに決定 (0: 手前 30%, 1: 中間 40%, 2: 奥 30%)
        var depth = sys.random() < 0.3 ? 0 : (sys.random() < 0.57 ? 1 : 2) ;
        
        // 雪片のサイズ
        var size = sys.random(4, 12) ;
        
        var snowflake = new ObjSnowflake( 
            sys.createVector(x, y), 
            size,
            depth
        ) ;
        
        app.ObjMgr.RequestAdd( snowflake ) ;
    }
    
    changeBackgroundColor()
    {
        this.mnCurrentColorIndex = (this.mnCurrentColorIndex + 1) % this.mBackgroundColors.length;
        app.mBackground = this.mBackgroundColors[this.mnCurrentColorIndex];
    }
}

// end of file