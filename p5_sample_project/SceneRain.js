///////////////////////////////////
///
//////////////////////////////////

class ObjRaindrop extends ObjBase 
{
    constructor( pos, speed, length, alpha, depth ) 
    {
        super() ;

        this.mPos = pos ;
        this.mSpeed = speed ;
        this.mLength = length ;
        this.mAlpha = alpha ;
        this.mDepth = depth ; // 奥行き情報 (0: 手前, 1: 中間, 2: 奥)
        
        // ノイズベースの軌道用オフセット
        this.mNoiseOffsetX = sys.random(10000) ;
        this.mNoiseOffsetY = sys.random(10000) ;
        this.mNoiseScale = 0.01 ; // ノイズの細かさ
        this.mNoiseStrength = 1.5 ; // ノイズの強さ
        
        // 時間経過によるフェード用
        this.mLifeTime = 0 ; // 生存時間
        this.mInitialAlpha = alpha ; // 初期のアルファ値を保存
        this.mFadeRate = 0.998 ; // フェード率（1に近いほどゆっくり）
        
        // 奥行きに応じて色を調整
        this.setColorByDepth() ;
        
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
        
        // 雨粒の落下
        this.mPos.y += this.mSpeed ;
        
        // 画面下に到達したら削除（地面での跳ね返りエフェクト付き）
        if( this.mPos.y > sys.height - 10 ) // 地面の少し手前で判定
        {
            // スプラッシュエフェクトを生成
            this.createSplash() ;
            this.mbShouldRemove = true ;
        }
        
        // === 元の風の効果（軽い横移動） - コメントアウトして保存 ===
        // this.mPos.x += sys.sin(this.mPos.y * 0.01) * 0.5 ;
        
        // === ノイズベースの軌道（新機能） ===
        var timeOffset = sys.frameCount * this.mNoiseScale ;
        var noiseX = sys.noise(this.mNoiseOffsetX + timeOffset) ;
        var noiseY = sys.noise(this.mNoiseOffsetY + timeOffset) ;
        
        // ノイズ値を-1〜1の範囲に変換して横移動に適用
        this.mPos.x += (noiseX - 0.5) * this.mNoiseStrength ;
        
        // 縦方向にも微細な変動を追加（より自然な落下）
        this.mSpeed += (noiseY - 0.5) * 0.1 ;
        
        // === 時間経過によるフェード効果 ===
        this.mLifeTime++ ;
        
        // アルファ値を徐々に減少させる
        this.mAlpha *= this.mFadeRate ;
        
        // 色を更新（フェード効果を反映）
        this.updateColorWithFade() ;
    }

    Draw()
    {
        // 奥行きに応じて線の太さも調整
        var strokeWeight = this.mDepth == 0 ? 2 : (this.mDepth == 1 ? 1.5 : 1) ;
        sys.strokeWeight( strokeWeight ) ;
        sys.stroke( this.mColor ) ;
        
        // 雨粒を線で描画
        sys.line( this.mPos.x, this.mPos.y, 
                  this.mPos.x, this.mPos.y + this.mLength ) ;
    }
    
    setColorByDepth()
    {
        switch( this.mDepth )
        {
            case 0: // 手前 - 濃い青白
                this.mColor = sys.color(150, 200, 255, this.mAlpha) ;
                break ;
            case 1: // 中間 - 少し薄い青白
                this.mColor = sys.color(120, 160, 200, this.mAlpha * 0.7) ;
                break ;
            case 2: // 奥 - 薄い青白
                this.mColor = sys.color(100, 130, 160, this.mAlpha * 0.5) ;
                break ;
        }
    }
    
    updateColorWithFade()
    {
        // 時間経過によるフェードを反映した色を設定
        switch( this.mDepth )
        {
            case 0: // 手前 - 濃い青白
                this.mColor = sys.color(150, 200, 255, this.mAlpha) ;
                break ;
            case 1: // 中間 - 少し薄い青白
                this.mColor = sys.color(120, 160, 200, this.mAlpha * 0.7) ;
                break ;
            case 2: // 奥 - 薄い青白
                this.mColor = sys.color(100, 130, 160, this.mAlpha * 0.5) ;
                break ;
        }
    }
    
    createSplash()
    {
        // 雨粒の大きさと速度に応じてスプラッシュの強さを決定
        var splashIntensity = this.mSpeed * 0.3 + this.mLength * 0.1 ;
        var splashCount = sys.random(2, 6) ; // スプラッシュ粒子の数
        
        for( var i = 0; i < splashCount; i++ )
        {
            // 地面位置
            var groundY = sys.height - 5 ;
            var splashPos = sys.createVector( this.mPos.x + sys.random(-3, 3), groundY ) ;
            
            // 跳ね返り速度（横方向にランダム、上方向に跳ね返り）
            var velX = sys.random(-splashIntensity, splashIntensity) ;
            var velY = sys.random(-splashIntensity * 1.5, -splashIntensity * 0.5) ;
            var splashVel = sys.createVector( velX, velY ) ;
            
            // スプラッシュパーティクルを生成
            var splash = new ObjSplash( splashPos, splashVel ) ;
            app.ObjMgr.RequestAdd( splash ) ;
        }
    }
}

///////////////////////////////////
///
//////////////////////////////////

class ObjSplash extends ObjBase 
{
    constructor( pos, velocity ) 
    {
        super() ;

        this.mPos = pos.copy() ;
        this.mVel = velocity ;
        this.mLifeTime = 0 ;
        this.mMaxLifeTime = sys.random(15, 30) ; // 短い寿命
        this.mSize = sys.random(1, 3) ;
        this.mColor = sys.color(180, 220, 255, 150) ; // 薄い青白
        this.mGravity = 0.3 ;
        
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
        
        // 重力で落下
        this.mVel.y += this.mGravity ;
        
        // 位置更新
        this.mPos.add(this.mVel) ;
        
        // 空気抵抗
        this.mVel.mult(0.98) ;
        
        // 寿命管理
        this.mLifeTime++ ;
        if( this.mLifeTime > this.mMaxLifeTime )
        {
            this.mbShouldRemove = true ;
        }
        
        // フェードアウト
        var fadeRatio = 1.0 - (this.mLifeTime / this.mMaxLifeTime) ;
        this.mColor = sys.color(180, 220, 255, 150 * fadeRatio) ;
    }

    Draw()
    {
        sys.fill( this.mColor ) ;
        sys.noStroke() ;
        sys.ellipse( this.mPos.x, this.mPos.y, this.mSize, this.mSize ) ;
    }
}

///////////////////////////////////
///
//////////////////////////////////

class ObjCloud extends ObjBase 
{
    constructor( pos, size ) 
    {
        super() ;

        this.mPos = pos ;
        this.mSize = size ;
        this.mAlpha = 100 ;
        this.mDrift = sys.random(-0.5, 0.5) ; // 雲のドリフト速度
        
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
        
        // 雲の移動
        this.mPos.x += this.mDrift ;
        
        // 画面端で反対側に移動
        if( this.mPos.x > sys.width + this.mSize )
        {
            this.mPos.x = -this.mSize ;
        }
        else if( this.mPos.x < -this.mSize )
        {
            this.mPos.x = sys.width + this.mSize ;
        }
    }

    Draw()
    {
        sys.fill( sys.color(80, 80, 80, this.mAlpha) ) ;
        sys.noStroke() ;
        
        // 雲を複数の円で描画
        for( var i = 0; i < 5; i++ )
        {
            var offsetX = (i - 2) * this.mSize * 0.3 ;
            var offsetY = sys.sin(i * 0.8) * this.mSize * 0.1 ;
            var circleSize = this.mSize * (0.7 + sys.sin(i * 1.2) * 0.3) ;
            
            sys.ellipse( this.mPos.x + offsetX, this.mPos.y + offsetY, circleSize, circleSize * 0.8 ) ;
        }
    }
}

///////////////////////////////////
///
//////////////////////////////////

class SceneRain extends SceneBase
{
    constructor() 
    {
        super() ;
        
        this.mnRainDropCounter = 0 ;
        this.mnRainIntensity = 3 ; // 雨の強さ（1フレームに生成する雨粒数）
        this.mnWindStrength = 0.5 ; // 風の強さ
        
        // 背景色（雨雲の色）
        this.mBackgroundColors = [
            sys.color(40, 50, 60, 255),    // 暗い雨雲
            sys.color(60, 70, 80, 255),    // 薄い雨雲
            sys.color(30, 40, 50, 255),    // 濃い雨雲
            sys.color(50, 60, 70, 255),    // 中程度の雨雲
        ];
        this.mnCurrentColorIndex = 0;
    }
  
    Init()
    {
        sys.print( "[SceneRain::Init]" );
        
        app.mBackground = this.mBackgroundColors[this.mnCurrentColorIndex] ;
        
        // 雲を生成 - 雨粒の検証に集中するため無効化
        /*
        for( var i = 0; i < 4; i++ )
        {
            var cloud = new ObjCloud( 
                sys.createVector( sys.random(sys.width), sys.random(50, 150) ),
                sys.random(60, 120)
            ) ;
            app.ObjMgr.RequestAdd( cloud ) ;
        }
        */
    }
    
    Reset()
    {
        sys.print( "[SceneRain::Reset]" );
        this.mnRainDropCounter = 0 ;
    }
    
    Calc()
    {
        // 雨粒を生成
        for( var i = 0; i < this.mnRainIntensity; i++ )
        {
            this.createRaindrop() ;
        }
        
        // 背景色切り替え
        if( app.InputMgr.isTrig('space') )
        {
            this.changeBackgroundColor() ;
        }
        
        // 雨の強さ調整
        if( app.InputMgr.isTrig('right') )
        {
            this.mnRainIntensity = Math.min(this.mnRainIntensity + 1, 10) ;
        }
        if( app.InputMgr.isTrig('left') )
        {
            this.mnRainIntensity = Math.max(this.mnRainIntensity - 1, 0) ;
        }
        
        ++this.mnRainDropCounter ;
    }

    Draw()
    {
        // 雨の情報を表示
        sys.fill( sys.color(255, 255, 255, 180) ) ;
        sys.textSize(16) ;
        sys.text( "Rain Intensity: " + this.mnRainIntensity, 10, 25 ) ;
        sys.text( "Left/Right: Change intensity", 10, 45 ) ;
        sys.text( "Space: Change sky color", 10, 65 ) ;
    }
    
    createRaindrop()
    {
        var x = sys.random(-20, sys.width + 20) ;
        var y = sys.random(-50, -10) ;
        
        // 奥行きをランダムに決定 (0: 手前 40%, 1: 中間 35%, 2: 奥 25%)
        var depth = sys.random() < 0.4 ? 0 : (sys.random() < 0.58 ? 1 : 2) ;
        
        // 奥行きに応じて速度と長さを調整
        var speed, length, alpha ;
        switch( depth )
        {
            case 0: // 手前 - 遅くて長い
                speed = sys.random(8, 12) ;
                length = sys.random(15, 30) ;
                alpha = sys.random(150, 220) ;
                break ;
            case 1: // 中間 - 普通
                speed = sys.random(8, 14) ;
                length = sys.random(10, 20) ;
                alpha = sys.random(100, 180) ;
                break ;
            case 2: // 奥 - 遅くて短い
                speed = sys.random(5, 10) ;
                length = sys.random(8, 15) ;
                alpha = sys.random(80, 140) ;
                break ;
        }
        
        var raindrop = new ObjRaindrop( 
            sys.createVector(x, y), 
            speed, 
            length, 
            alpha,
            depth
        ) ;
        
        app.ObjMgr.RequestAdd( raindrop ) ;
    }
    
    changeBackgroundColor()
    {
        this.mnCurrentColorIndex = (this.mnCurrentColorIndex + 1) % this.mBackgroundColors.length;
        app.mBackground = this.mBackgroundColors[this.mnCurrentColorIndex];
    }
}

// end of file