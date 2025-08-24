///////////////////////////////////
///
//////////////////////////////////

class ObjPlayer extends ObjBase 
{
    constructor( pos ) 
    {
        super() ;

        this.mPos = pos ;
        this.mSize = sys.createVector(24, 32) ; // プレイヤーのサイズ（幅、高さ）
        this.mVelocity = sys.createVector(0, 0) ; // 速度
        this.mColor = sys.color(100, 150, 255, 255) ; // 青いプレイヤー
        
        // アクション用パラメータ
        this.mGrounded = false ; // 地面に接触しているか
        this.mMaxSpeed = 4.0 ; // 最大移動速度
        this.mAcceleration = 0.3 ; // 地上での加速度
        this.mAirAcceleration = 0.15 ; // 空中での加速度（地上の半分）
        this.mGroundFriction = 0.92 ; // 地面摩擦（減速）
        this.mAirResistance = 0.98 ; // 空気抵抗（ジャンプ中の減速）
        
        // ジャンプ用パラメータ
        this.mJumpPower = -6.0 ; // 初期ジャンプ力（負の値で上向き・低めに設定）
        this.mJumpHoldPower = -1.2 ; // 長押し時の追加上昇力（より強く）
        this.mGravity = 0.6 ; // 重力
        this.mMaxFallSpeed = 15.0 ; // 最大落下速度
        this.mIsJumping = false ; // ジャンプ中かどうか
        this.mMaxJumpHoldTime = 7 ; // 最大ジャンプ持続時間（フレーム）
        this.mJumpHoldCounter = 0 ; // ジャンプ長押しカウンター
        
        // 表情・スケール用パラメータ
        this.mEnableScaleAnimation = false ; // スケールアニメーションのオン/オフ
        this.mScaleY = new SpringF32( 1.0 ) ; // Y方向のスケール（バネ）
        this.mLastFallSpeed = 0.0 ; // 着地直前の落下速度を記録
        
        // 画像リソース
        this.mImgWait = null ; // マリオの待機画像
        this.mImgJump = null ; // マリオのジャンプ画像
        this.mImgSlip = null ; // マリオのスリップ画像
        this.mImgRun1 = null ; // マリオの走り画像1
        this.mImgRun2 = null ; // マリオの走り画像2
        this.mImgRun3 = null ; // マリオの走り画像3
        
        // 走りアニメーション用
        this.mRunAnimCounter = 0 ; // アニメーションカウンター
        this.mRunAnimSpeed = 6 ; // アニメーション速度（フレーム数）
        
    }
  
    Init()
    {
        super.Init() ;
        sys.print( "[ObjPlayer::Init]" );
        
        // 画像を読み込み
        this.mImgWait = sys.loadImage("img/mario_wait.png") ;
        this.mImgJump = sys.loadImage("img/mario_jump.png") ;
        this.mImgSlip = sys.loadImage("img/mario_slip.png") ;
        this.mImgRun1 = sys.loadImage("img/mario_run1.png") ;
        this.mImgRun2 = sys.loadImage("img/mario_run2.png") ;
        this.mImgRun3 = sys.loadImage("img/mario_run3.png") ;
    }
   
    Reset()
    {
        super.Reset() ;
        sys.print( "[ObjPlayer::Reset]" );
        this.mVelocity.set(0, 0) ;
        this.mGrounded = false ;
        this.mIsJumping = false ;
        this.mJumpHoldCounter = 0 ;
        this.mScaleY.Set( 1.0 ) ;
        this.mLastFallSpeed = 0.0 ;
        this.mRunAnimCounter = 0 ;
    }
    
    Calc()
    {
        super.Calc() ;
        
        // === 左右移動の入力処理 ===
        this.handleInput() ;
        
        // === 物理計算 ===
        this.updatePhysics() ;
        
        // === 画面境界チェック ===
        this.checkBounds(app.CurrentScene) ;
        
        // === スケールアニメーション ===
        if( this.mEnableScaleAnimation )
        {
            this.updateScaleAnimation() ;
        }
        
        // === 走りアニメーション ===
        this.updateRunAnimation() ;
    }

    Draw()
    {
        sys.push() ;
        
        // スケールを取得
        var scaleY = this.mEnableScaleAnimation ? this.mScaleY.Get() : 1.0 ;
        
        // 足元の位置を計算（スケールしても足元は固定）
        var footY = this.mPos.y + this.mSize.y/2 ;
        var scaledHeight = this.mSize.y * scaleY ;
        var drawY = footY - scaledHeight/2 ;
        
        // 移動と変形
        sys.translate( this.mPos.x, drawY ) ;
        if( this.mEnableScaleAnimation )
        {
            sys.scale( 1.0, scaleY ) ;
        }
        
        sys.fill( this.mColor ) ;
        sys.stroke( sys.color(255, 255, 255, 150) ) ;
        sys.strokeWeight( 2 ) ;
        sys.rectMode(sys.CENTER) ;
        
        // プレイヤーを画像で描画（スケールが適用される）
        // 状態に応じて画像を選択
        var currentImg = null ;
        
        // デバッグ: 接地状態を確認
        if( this.mGrounded )
        {
            // 地上での状態判定
            var isSlipping = false ;
            
            // スリップ判定：入力方向と速度方向が逆で、かつ両方とも十分な値がある場合
            if( app.InputMgr.isHold('left') && this.mVelocity.x > 0.5 )
            {
                isSlipping = true ; // 左キー押下中だが右向きに移動
            }
            else if( app.InputMgr.isHold('right') && this.mVelocity.x < -0.5 )
            {
                isSlipping = true ; // 右キー押下中だが左向きに移動
            }
            
            if( isSlipping )
            {
                currentImg = this.mImgSlip ;
            }
            else if( Math.abs(this.mVelocity.x) > 0.5 )
            {
                // 移動中は走りアニメーション
                currentImg = this.getCurrentRunImage() ;
            }
            else
            {
                currentImg = this.mImgWait ;
            }
        }
        else
        {
            // 空中（ジャンプ中）はジャンプ画像
            currentImg = this.mImgJump ;
        }
        
        if( currentImg )
        {
            sys.imageMode(sys.CENTER) ;
            
            // 画像反転の判定
            var shouldFlip = false ;
            
            if( currentImg === this.mImgSlip )
            {
                // スリップ時は入力方向に応じて反転（左キー押下時は左向き表示）
                if( app.InputMgr.isHold('left') )
                {
                    shouldFlip = true ;
                }
            }
            else
            {
                // 通常時は移動方向に応じて反転
                if( this.mVelocity.x < 0 )
                {
                    shouldFlip = true ;
                }
            }
            
            if( shouldFlip )
            {
                sys.scale(-1, 1) ; // X軸を反転
            }
            
            sys.image( currentImg, 0, 0, this.mSize.x, this.mSize.y ) ;
        }
        else
        {
            // 画像が読み込まれていない場合は四角形で描画
            sys.rect( 0, 0, this.mSize.x, this.mSize.y ) ;
        }
        
        sys.pop() ;
    }
    
    handleInput()
    {
        // 左右移動（地面と空中で加速度を変える）
        var currentAcceleration = this.mGrounded ? this.mAcceleration : this.mAirAcceleration ;
        
        if( app.InputMgr.isHold('left') )
        {
            this.mVelocity.x -= currentAcceleration ;
            this.mVelocity.x = Math.max(this.mVelocity.x, -this.mMaxSpeed) ;
        }
        else if( app.InputMgr.isHold('right') )
        {
            this.mVelocity.x += currentAcceleration ;
            this.mVelocity.x = Math.min(this.mVelocity.x, this.mMaxSpeed) ;
        }
        else
        {
            // キーが押されていない時は摩擦で減速
            if( this.mGrounded )
            {
                // 地面にいる時は地面摩擦
                this.mVelocity.x *= this.mGroundFriction ;
            }
            else
            {
                // 空中にいる時は空気抵抗
                this.mVelocity.x *= this.mAirResistance ;
            }
            
            // 非常に小さい速度は0にする
            if( Math.abs(this.mVelocity.x) < 0.1 )
            {
                this.mVelocity.x = 0 ;
            }
        }
        
        // ジャンプ処理
        if( app.InputMgr.isTrig('z') && this.mGrounded )
        {
            // ジャンプ開始
            this.mVelocity.y = this.mJumpPower ;
            this.mGrounded = false ;
            this.mIsJumping = true ;
            this.mJumpHoldCounter = 0 ;
        }
        else if( app.InputMgr.isHold('z') && this.mIsJumping )
        {
            // ジャンプ長押し中（上昇中のみ）
            if( this.mVelocity.y < 0 && this.mJumpHoldCounter < this.mMaxJumpHoldTime )
            {
                this.mVelocity.y += this.mJumpHoldPower ;
                this.mJumpHoldCounter++ ;
            }
        }
        else if( !app.InputMgr.isHold('z') )
        {
            // Zキーを離したらジャンプ長押し終了
            this.mIsJumping = false ;
        }
    }
    
    updatePhysics()
    {
        // 重力を適用（空中にいる時のみ）
        if( !this.mGrounded )
        {
            this.mVelocity.y += this.mGravity ;
            
            // 最大落下速度を制限
            if( this.mVelocity.y > this.mMaxFallSpeed )
            {
                this.mVelocity.y = this.mMaxFallSpeed ;
            }
        }
        
        // 位置更新
        this.mPos.add(this.mVelocity) ;
        
        // 地形との衝突判定（シーンを直接渡す）
        this.checkTerrainCollision(app.CurrentScene) ;

    }
    
    checkBounds(scene)
    {
        // シーンの地形データをチェック
        if( !scene || !scene.mMapData ) return ;
        
        var halfWidth = this.mSize.x / 2 ;
        var mapPixelWidth = scene.mMapWidth * scene.mBlockSize ;
        
        // 画面左右の境界チェック（マップサイズに基づく）
        if( this.mPos.x - halfWidth < 0 )
        {
            this.mPos.x = halfWidth ;
            this.mVelocity.x = 0 ;
        }
        else if( this.mPos.x + halfWidth > mapPixelWidth )
        {
            this.mPos.x = mapPixelWidth - halfWidth ;
            this.mVelocity.x = 0 ;
        }
        
        // 画面下に落ちた場合の処理
        var mapPixelHeight = scene.mMapHeight * scene.mBlockSize ;
        if( this.mPos.y > mapPixelHeight + 100 )
        {
            // プレイヤーをスタート位置にリセット
            var startPos = scene.getPlayerStartPosition() ;
            this.mPos.x = startPos.x ;
            this.mPos.y = startPos.y ;
            this.mVelocity.set(0, 0) ;
            this.mGrounded = false ;
        }
    }
    
    updateScaleAnimation()
    {
        // デフォルトは標準スケール
        var targetScale = 1.0 ;
        
        // ジャンプ開始時は縮む
        if( app.InputMgr.isTrig('z') && this.mGrounded )
        {
            //this.mScaleY.Set( 0.7 ) ; // 瞬間的に縮む
            targetScale = 0.7 ;
        }
        
        // 空中にいる時は少し伸びる
        if( !this.mGrounded )
        {
            targetScale = 1.2 ;
        }
        
        // 着地時の演出
        if( this.mGrounded && this.mLastFallSpeed > 0 )
        {
            // 記録された落下速度を使って着地演出
            var landingIntensity = this.mLastFallSpeed / this.mMaxFallSpeed ;
            if( landingIntensity > 0.3 )
            {
                // 0.8-1.2の範囲で大きく揺れる - 一度にまとめて速度を追加
                var totalSpeedChange = -0.25 * landingIntensity  ;
                this.mScaleY.AddSpeed( totalSpeedChange ) ;
            }
            
            // 着地演出が完了したらリセット
            this.mLastFallSpeed = 0 ;
        }
        
        // バネでターゲットスケールに近づける
        this.mScaleY.UpdateToTarget( targetScale, 0.2, 0.8 ) ;
    }
    
    updateRunAnimation()
    {
        // 移動中のみアニメーションカウンターを進める
        if( this.mGrounded && Math.abs(this.mVelocity.x) > 0.5 )
        {
            this.mRunAnimCounter++ ;
        }
    }
    
    getCurrentRunImage()
    {
        // 3つの画像を順番に切り替える
        var animFrame = Math.floor(this.mRunAnimCounter / this.mRunAnimSpeed) % 3 ;
        
        switch( animFrame )
        {
            case 0: return this.mImgRun1 ;
            case 1: return this.mImgRun2 ;
            case 2: return this.mImgRun3 ;
            default: return this.mImgRun1 ;
        }
    }
    
    checkTerrainCollision(scene)
    {
        // シーンの地形データをチェック
        if( !scene || !scene.mMapData ) 
        {
            this.mGrounded = false ;
            return ;
        }
        
        var blockSize = scene.mBlockSize ;
        var wasGrounded = this.mGrounded ;
        var foundGroundSupport = false ;
        
        // プレイヤーの四角形
        var left = this.mPos.x - this.mSize.x/2 ;
        var right = this.mPos.x + this.mSize.x/2 ;
        var top = this.mPos.y - this.mSize.y/2 ;
        var bottom = this.mPos.y + this.mSize.y/2 ;
        
        // 接触しているブロックの範囲を計算
        var startX = Math.max(0, Math.floor(left / blockSize)) ;
        var endX = Math.min(scene.mMapWidth - 1, Math.floor(right / blockSize)) ;
        var startY = Math.max(0, Math.floor(top / blockSize)) ;
        var endY = Math.min(scene.mMapHeight - 1, Math.floor(bottom / blockSize)) ;
        
        // 各ブロックとの衝突をチェック
        for( var y = startY; y <= endY; y++ )
        {
            for( var x = startX; x <= endX; x++ )
            {
                if( y >= 0 && y < scene.mMapHeight && x >= 0 && x < scene.mMapWidth && 
                    scene.mMapData[y][x] === 1 )
                {
                    // ブロックの位置
                    var blockLeft = x * blockSize ;
                    var blockRight = (x + 1) * blockSize ;
                    var blockTop = y * blockSize ;
                    var blockBottom = (y + 1) * blockSize ;
                    
                    // 衝突判定
                    if( right > blockLeft && left < blockRight && 
                        bottom > blockTop && top < blockBottom )
                    {
                        // 衝突した場合の位置補正
                        if( this.resolveCollisionStable(blockLeft, blockRight, blockTop, blockBottom, wasGrounded) )
                        {
                            foundGroundSupport = true ;
                        }

                        return ; // 1つのブロックとの衝突処理で十分
                    }
                }
            }
        }

        // 地面サポートが見つからなかった場合のみ空中状態にする
        if( !foundGroundSupport && this.mGrounded )
        {
            this.mGrounded = false ;
        }
    }
    
    resolveCollisionStable(blockLeft, blockRight, blockTop, blockBottom, wasGrounded)
    {
        var playerLeft = this.mPos.x - this.mSize.x/2 ;
        var playerRight = this.mPos.x + this.mSize.x/2 ;
        var playerTop = this.mPos.y - this.mSize.y/2 ;
        var playerBottom = this.mPos.y + this.mSize.y/2 ;
        
        // 各方向への重なり量を計算
        var overlapLeft = playerRight - blockLeft ;
        var overlapRight = blockRight - playerLeft ;
        var overlapTop = playerBottom - blockTop ;
        var overlapBottom = blockBottom - playerTop ;
        
        // 最小重なり量を見つけて位置補正
        var minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom) ;
        
        if( minOverlap === overlapTop && this.mVelocity.y >= 0 )
        {
            // 上からの衝突（着地）- 正確にブロック上面に配置
            this.mPos.y = blockTop - this.mSize.y/2 ;
            
            // 着地直前の落下速度を記録（着地演出用）
            if( !wasGrounded && this.mVelocity.y > 0 )
            {
                this.mLastFallSpeed = this.mVelocity.y ;
            }
            
            // 接地状態の安定化処理
            this.mVelocity.y = 0 ;
            this.mGrounded = true ;
            this.mIsJumping = false ;
            this.mJumpHoldCounter = 0 ;
            
            return true ; // 地面サポートが見つかったことを示す
        }
        else if( minOverlap === overlapBottom && this.mVelocity.y < 0 )
        {
            // 下からの衝突（頭ぶつけ）
            this.mPos.y = blockBottom + this.mSize.y/2 ;
            this.mVelocity.y = 0 ;
        }
        else if( minOverlap === overlapLeft && this.mVelocity.x > 0 )
        {
            // 左からの衝突
            this.mPos.x = blockLeft - this.mSize.x/2 ;
            this.mVelocity.x = 0 ;
        }
        else if( minOverlap === overlapRight && this.mVelocity.x < 0 )
        {
            // 右からの衝突
            this.mPos.x = blockRight + this.mSize.x/2 ;
            this.mVelocity.x = 0 ;
        }
        
        return false ; // 地面サポートではない
    }
}

///////////////////////////////////
///
//////////////////////////////////

class Scene2DAction extends SceneBase
{
    constructor() 
    {
        super() ;
        
        this.mPlayer = null ;
        this.mShowDebugInfo = false ;
        
        // 背景色（アクションゲーム風）
        this.mBackgroundColor = sys.color(135, 206, 235, 255) ; // スカイブルー
        
        // 地形データ
        this.mMapData = null ; // CSVから読み込んだマップデータ
        this.mMapWidth = 0 ; // マップの幅（ブロック数）
        this.mMapHeight = 0 ; // マップの高さ（ブロック数）
        this.mBlockSize = 24 ; // 1ブロックのサイズ（ピクセル）
    }
  
    Init()
    {
        sys.print( "[Scene2DAction::Init]" );
        
        app.mBackground = this.mBackgroundColor ;
        
        // マップデータを読み込み（読み込み完了後にプレイヤーが生成される）
        this.loadMapData() ;
    }
    
    Reset()
    {
        sys.print( "[Scene2DAction::Reset]" );
    }
    
    Calc()
    {
        // デバッグ情報の表示切り替え
        if( app.InputMgr.isTrig('d') )
        {
            this.mShowDebugInfo = !this.mShowDebugInfo ;
        }
        
        // リセット機能
        if( app.InputMgr.isTrig('r') )
        {
            this.resetPlayer() ;
        }
    }

    Draw()
    {
        // 地形を描画
        this.drawTerrain() ;
        
        // デバッグ情報の表示
        if( this.mShowDebugInfo && this.mPlayer )
        {
            sys.fill( sys.color(0, 0, 0, 255) ) ; // 黒色
            sys.textSize(16) ;
            sys.text( "Player Position: (" + 
                     Math.round(this.mPlayer.mPos.x) + ", " + 
                     Math.round(this.mPlayer.mPos.y) + ")", 10, 25 ) ;
            sys.text( "Player Velocity: (" + 
                     this.mPlayer.mVelocity.x.toFixed(2) + ", " + 
                     this.mPlayer.mVelocity.y.toFixed(2) + ")", 10, 45 ) ;
            sys.text( "Grounded: " + this.mPlayer.mGrounded, 10, 65 ) ;
            sys.text( "Jumping: " + this.mPlayer.mIsJumping, 10, 85 ) ;
            var currentState = this.mPlayer.mGrounded ? "GROUND" : "AIR" ;
            sys.text( "State: " + currentState, 10, 105 ) ;
            sys.text( "Jump Hold: " + this.mPlayer.mJumpHoldCounter + "/" + this.mPlayer.mMaxJumpHoldTime, 10, 125 ) ;
            var frictionType = this.mPlayer.mGrounded ? "Ground Friction" : "Air Resistance" ;
            var acceleration = this.mPlayer.mGrounded ? this.mPlayer.mAcceleration : this.mPlayer.mAirAcceleration ;
            sys.text( "Friction: " + frictionType, 10, 145 ) ;
            sys.text( "Acceleration: " + acceleration.toFixed(1), 10, 165 ) ;
            sys.text( "Scale Y: " + this.mPlayer.mScaleY.Get().toFixed(3), 10, 185 ) ;
            sys.text( "Scale Speed: " + this.mPlayer.mScaleY.mfSpeed.toFixed(3), 10, 205 ) ;
            sys.text( "Map Size: " + this.mMapWidth + "x" + this.mMapHeight, 10, 225 ) ;
            sys.text( "Left/Right: Move player", 10, 245 ) ;
            sys.text( "Z: Jump (hold for higher jump)", 10, 265 ) ;
            sys.text( "R: Reset player position", 10, 285 ) ;
            sys.text( "D: Toggle debug info", 10, 305 ) ;
        }
    }
    
    loadMapData()
    {
        // CSVファイルを読み込み
        sys.loadStrings("data/map.csv", (data) => {
            this.parseMapData(data) ;
            
            // マップ読み込み完了後にプレイヤーを生成
            if( !this.mPlayer )
            {
                var playerStartPos = this.getPlayerStartPosition() ;
                this.mPlayer = new ObjPlayer( playerStartPos ) ;
                app.ObjMgr.RequestAdd( this.mPlayer ) ;
            }
        }) ;
    }
    
    parseMapData(csvLines)
    {
        this.mMapData = [] ;
        this.mMapHeight = csvLines.length ;
        
        for( var y = 0; y < csvLines.length; y++ )
        {
            var line = csvLines[y] ;
            var values = line.split(',') ;
            
            if( y === 0 )
            {
                this.mMapWidth = values.length ;
            }
            
            this.mMapData[y] = [] ;
            for( var x = 0; x < values.length; x++ )
            {
                this.mMapData[y][x] = parseInt(values[x]) ;
            }
        }
        
        sys.print( "[Map Loaded] Size: " + this.mMapWidth + "x" + this.mMapHeight ) ;
    }
    
    getPlayerStartPosition()
    {
        // マップデータから9を探してプレイヤー初期位置を決定
        if( this.mMapData )
        {
            for( var y = 0; y < this.mMapHeight; y++ )
            {
                for( var x = 0; x < this.mMapWidth; x++ )
                {
                    if( this.mMapData[y][x] === 9 )
                    {
                        return sys.createVector(
                            x * this.mBlockSize + this.mBlockSize / 2,
                            y * this.mBlockSize + this.mBlockSize / 2
                        ) ;
                    }
                }
            }
        }
        
        // 9が見つからない場合はデフォルト位置
        return sys.createVector(sys.width/2, sys.height - 100) ;
    }
    
    drawTerrain()
    {
        if( !this.mMapData ) return ;
        
        sys.fill( sys.color(101, 67, 33, 255) ) ; // 茶色のブロック
        sys.stroke( sys.color(139, 69, 19, 255) ) ; // 濃い茶色の境界線
        sys.strokeWeight( 1 ) ;
        
        for( var y = 0; y < this.mMapHeight; y++ )
        {
            for( var x = 0; x < this.mMapWidth; x++ )
            {
                if( this.mMapData[y][x] === 1 )
                {
                    var blockX = x * this.mBlockSize ;
                    var blockY = y * this.mBlockSize ;
                    
                    sys.rect( blockX, blockY, this.mBlockSize, this.mBlockSize ) ;
                }
            }
        }
    }
    
    resetPlayer()
    {
        if( this.mPlayer && this.mMapData )
        {
            // プレイヤーを初期位置に戻す
            var startPos = this.getPlayerStartPosition() ;
            this.mPlayer.mPos.x = startPos.x ;
            this.mPlayer.mPos.y = startPos.y ;
            
            // 速度と状態をリセット
            this.mPlayer.mVelocity.set(0, 0) ;
            this.mPlayer.mGrounded = false ;
            this.mPlayer.mIsJumping = false ;
            this.mPlayer.mJumpHoldCounter = 0 ;
            this.mPlayer.mLastFallSpeed = 0.0 ;
            this.mPlayer.mRunAnimCounter = 0 ;
            this.mPlayer.mScaleY.Set(1.0) ;
            
            sys.print( "[Player Reset] Position: (" + startPos.x + ", " + startPos.y + ")" ) ;
        }
    }
}

// end of file