using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using Raylib_cs;

namespace LibOsa;

public class SceneOthello : SceneBase
{
    private const int BOARD_SIZE = 8;
    private const int CELL_SIZE = 60;
    private const int BOARD_OFFSET_X = 100;
    private const int BOARD_OFFSET_Y = 80;
    
    // 0: 空, 1: 黒, 2: 白
    private int[,] _board;
    private int _currentPlayer; // 1: 黒(人間), 2: 白(CPU)
    private bool _gameOver;
    private int _blackCount;
    private int _whiteCount;
    private bool _isCpuTurn;
    private float _cpuMoveTimer;
    private const float CPU_MOVE_DELAY = 1.0f; // CPU思考時間（秒）
    
    private Func<App> _getApp;

    public SceneOthello(Func<App> getApp)
    {
        _getApp = getApp;
        _board = new int[BOARD_SIZE, BOARD_SIZE];
        _currentPlayer = 1; // 黒から開始
        _gameOver = false;
    }

    public override void Init()
    {
        base.Init();
        ResetGame();
    }

    public override void Reset()
    {
        base.Reset();
        ResetGame();
    }

    private void ResetGame()
    {
        // ボードをクリア
        for (int x = 0; x < BOARD_SIZE; x++)
        {
            for (int y = 0; y < BOARD_SIZE; y++)
            {
                _board[x, y] = 0;
            }
        }
        
        // 初期配置
        _board[3, 3] = 2; // 白
        _board[3, 4] = 1; // 黒
        _board[4, 3] = 1; // 黒
        _board[4, 4] = 2; // 白
        
        _currentPlayer = 1; // 黒から開始
        _gameOver = false;
        _isCpuTurn = false;
        _cpuMoveTimer = 0.0f;
        CountPieces();
    }

    public override void Calc()
    {
        var app = _getApp();
        
        // Rキーでリセット
        if (app.InputMgr.IsTrig("r"))
        {
            ResetGame();
            return;
        }
        
        if (_gameOver) return;
        
        // CPUの手番処理
        if (_currentPlayer == 2) // 白(CPU)の番
        {
            _isCpuTurn = true;
            _cpuMoveTimer += 1.0f / 60.0f; // 60FPS想定
            
            if (_cpuMoveTimer >= CPU_MOVE_DELAY)
            {
                var cpuMove = GetBestCpuMove();
                if (cpuMove.HasValue)
                {
                    var (x, y) = cpuMove.Value;
                    PlacePiece(x, y, _currentPlayer);
                    FlipPieces(x, y, _currentPlayer);
                    CountPieces();
                    
                    // プレイヤー交代
                    _currentPlayer = 1;
                    _isCpuTurn = false;
                    _cpuMoveTimer = 0.0f;
                    
                    // 次のプレイヤー（人間）が打てない場合はCPUに戻す
                    if (!HasValidMoves(_currentPlayer))
                    {
                        _currentPlayer = 2;
                        
                        // CPUも打てない場合はゲーム終了
                        if (!HasValidMoves(_currentPlayer))
                        {
                            _gameOver = true;
                            _isCpuTurn = false;
                        }
                    }
                }
                else
                {
                    // CPUが打てない場合は人間に交代
                    _currentPlayer = 1;
                    _isCpuTurn = false;
                    _cpuMoveTimer = 0.0f;
                    
                    // 人間も打てない場合はゲーム終了
                    if (!HasValidMoves(_currentPlayer))
                    {
                        _gameOver = true;
                    }
                }
            }
        }
        else // 黒(人間)の番
        {
            _isCpuTurn = false;
            
            // マウスクリック処理
            if (Raylib.IsMouseButtonPressed(MouseButton.Left))
            {
                var mousePos = Raylib.GetMousePosition();
                int boardX = (int)((mousePos.X - BOARD_OFFSET_X) / CELL_SIZE);
                int boardY = (int)((mousePos.Y - BOARD_OFFSET_Y) / CELL_SIZE);
                
                if (IsValidPosition(boardX, boardY) && _board[boardX, boardY] == 0)
                {
                    if (CanPlacePiece(boardX, boardY, _currentPlayer))
                    {
                        PlacePiece(boardX, boardY, _currentPlayer);
                        FlipPieces(boardX, boardY, _currentPlayer);
                        CountPieces();
                        
                        // CPUに交代
                        _currentPlayer = 2;
                        _cpuMoveTimer = 0.0f;
                        
                        // CPUが打てない場合は人間に戻す
                        if (!HasValidMoves(_currentPlayer))
                        {
                            _currentPlayer = 1;
                            
                            // 人間も打てない場合はゲーム終了
                            if (!HasValidMoves(_currentPlayer))
                            {
                                _gameOver = true;
                            }
                        }
                    }
                }
            }
        }
    }

    public override void Draw()
    {
        // 背景
        Raylib.ClearBackground(ColorUtil.CreateColor(40, 80, 40, 255));
        
        // ボードの描画
        DrawBoard();
        
        // 駒の描画
        DrawPieces();
        
        // UI情報
        DrawUI();
    }

    private void DrawBoard()
    {
        // ボード背景
        var boardRect = new Rectangle(BOARD_OFFSET_X - 5, BOARD_OFFSET_Y - 5, 
                                     BOARD_SIZE * CELL_SIZE + 10, BOARD_SIZE * CELL_SIZE + 10);
        Raylib.DrawRectangleRec(boardRect, ColorUtil.CreateColor(139, 69, 19, 255)); // 茶色
        
        // グリッド線
        for (int i = 0; i <= BOARD_SIZE; i++)
        {
            // 縦線
            int x = BOARD_OFFSET_X + i * CELL_SIZE;
            Raylib.DrawLine(x, BOARD_OFFSET_Y, x, BOARD_OFFSET_Y + BOARD_SIZE * CELL_SIZE, Color.Black);
            
            // 横線
            int y = BOARD_OFFSET_Y + i * CELL_SIZE;
            Raylib.DrawLine(BOARD_OFFSET_X, y, BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE, y, Color.Black);
        }
    }

    private void DrawPieces()
    {
        for (int x = 0; x < BOARD_SIZE; x++)
        {
            for (int y = 0; y < BOARD_SIZE; y++)
            {
                if (_board[x, y] != 0)
                {
                    var centerX = BOARD_OFFSET_X + x * CELL_SIZE + CELL_SIZE / 2;
                    var centerY = BOARD_OFFSET_Y + y * CELL_SIZE + CELL_SIZE / 2;
                    var radius = CELL_SIZE / 2 - 4;
                    
                    Color color = _board[x, y] == 1 ? Color.Black : Color.White;
                    Raylib.DrawCircle(centerX, centerY, radius, color);
                    
                    // 境界線
                    Raylib.DrawCircleLines(centerX, centerY, radius, Color.Gray);
                }
            }
        }
        
        // 置ける場所のヒント表示
        if (!_gameOver)
        {
            for (int x = 0; x < BOARD_SIZE; x++)
            {
                for (int y = 0; y < BOARD_SIZE; y++)
                {
                    if (_board[x, y] == 0 && CanPlacePiece(x, y, _currentPlayer))
                    {
                        var centerX = BOARD_OFFSET_X + x * CELL_SIZE + CELL_SIZE / 2;
                        var centerY = BOARD_OFFSET_Y + y * CELL_SIZE + CELL_SIZE / 2;
                        
                        Color hintColor = _currentPlayer == 1 ? 
                            ColorUtil.CreateColor(64, 64, 64, 128) : 
                            ColorUtil.CreateColor(192, 192, 192, 128);
                        
                        Raylib.DrawCircle(centerX, centerY, 8, hintColor);
                    }
                }
            }
        }
    }

    private void DrawUI()
    {
        // 現在のプレイヤー
        if (!_gameOver)
        {
            string currentPlayerText;
            if (_isCpuTurn)
            {
                currentPlayerText = "CPU思考中...";
            }
            else
            {
                currentPlayerText = _currentPlayer == 1 ? "黒の番（あなた）" : "白の番（CPU）";
            }
            Color playerColor = _currentPlayer == 1 ? Color.Black : Color.White;
            
            Raylib.DrawText(currentPlayerText, BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 20, BOARD_OFFSET_Y, 24, playerColor);
            
            // 現在のプレイヤーの駒を表示
            Raylib.DrawCircle(BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 140, BOARD_OFFSET_Y + 12, 12, playerColor);
            if (_currentPlayer == 2)
            {
                Raylib.DrawCircleLines(BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 140, BOARD_OFFSET_Y + 12, 12, Color.Gray);
            }
        }
        
        // スコア表示
        Raylib.DrawText($"黒: {_blackCount}", BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 20, BOARD_OFFSET_Y + 60, 20, Color.Black);
        Raylib.DrawText($"白: {_whiteCount}", BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 20, BOARD_OFFSET_Y + 90, 20, Color.White);
        
        // ゲーム終了時の表示
        if (_gameOver)
        {
            string resultText;
            Color resultColor;
            
            if (_blackCount > _whiteCount)
            {
                resultText = "黒の勝利！";
                resultColor = Color.Black;
            }
            else if (_whiteCount > _blackCount)
            {
                resultText = "白の勝利！";
                resultColor = Color.White;
            }
            else
            {
                resultText = "引き分け";
                resultColor = Color.Gray;
            }
            
            Raylib.DrawText(resultText, BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 20, BOARD_OFFSET_Y + 140, 24, resultColor);
            Raylib.DrawText("Rキーでリセット", BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 20, BOARD_OFFSET_Y + 170, 16, Color.LightGray);
        }
    }

    private bool IsValidPosition(int x, int y)
    {
        return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
    }

    private bool CanPlacePiece(int x, int y, int player)
    {
        if (!IsValidPosition(x, y) || _board[x, y] != 0) return false;
        
        // 8方向をチェック
        int[] dx = { -1, -1, -1, 0, 0, 1, 1, 1 };
        int[] dy = { -1, 0, 1, -1, 1, -1, 0, 1 };
        
        for (int dir = 0; dir < 8; dir++)
        {
            if (CanFlipInDirection(x, y, dx[dir], dy[dir], player))
            {
                return true;
            }
        }
        
        return false;
    }

    private bool CanFlipInDirection(int x, int y, int dx, int dy, int player)
    {
        int opponent = player == 1 ? 2 : 1;
        int nx = x + dx;
        int ny = y + dy;
        bool foundOpponent = false;
        
        while (IsValidPosition(nx, ny))
        {
            if (_board[nx, ny] == 0) return false;
            if (_board[nx, ny] == opponent)
            {
                foundOpponent = true;
            }
            else if (_board[nx, ny] == player)
            {
                return foundOpponent;
            }
            
            nx += dx;
            ny += dy;
        }
        
        return false;
    }

    private void PlacePiece(int x, int y, int player)
    {
        _board[x, y] = player;
    }

    private void FlipPieces(int x, int y, int player)
    {
        int[] dx = { -1, -1, -1, 0, 0, 1, 1, 1 };
        int[] dy = { -1, 0, 1, -1, 1, -1, 0, 1 };
        
        for (int dir = 0; dir < 8; dir++)
        {
            if (CanFlipInDirection(x, y, dx[dir], dy[dir], player))
            {
                FlipInDirection(x, y, dx[dir], dy[dir], player);
            }
        }
    }

    private void FlipInDirection(int x, int y, int dx, int dy, int player)
    {
        int nx = x + dx;
        int ny = y + dy;
        
        while (IsValidPosition(nx, ny) && _board[nx, ny] != player)
        {
            _board[nx, ny] = player;
            nx += dx;
            ny += dy;
        }
    }

    private void CountPieces()
    {
        _blackCount = 0;
        _whiteCount = 0;
        
        for (int x = 0; x < BOARD_SIZE; x++)
        {
            for (int y = 0; y < BOARD_SIZE; y++)
            {
                if (_board[x, y] == 1) _blackCount++;
                else if (_board[x, y] == 2) _whiteCount++;
            }
        }
    }

    private bool HasValidMoves(int player)
    {
        for (int x = 0; x < BOARD_SIZE; x++)
        {
            for (int y = 0; y < BOARD_SIZE; y++)
            {
                if (_board[x, y] == 0 && CanPlacePiece(x, y, player))
                {
                    return true;
                }
            }
        }
        return false;
    }

    // CPUの最適手を選択するAIロジック
    private (int x, int y)? GetBestCpuMove()
    {
        var validMoves = new List<(int x, int y, int score)>();
        
        // 全ての有効な手を評価
        for (int x = 0; x < BOARD_SIZE; x++)
        {
            for (int y = 0; y < BOARD_SIZE; y++)
            {
                if (_board[x, y] == 0 && CanPlacePiece(x, y, 2)) // CPU=白=2
                {
                    int score = EvaluateMove(x, y, 2);
                    validMoves.Add((x, y, score));
                }
            }
        }
        
        if (validMoves.Count == 0) return null;
        
        // スコアの高い手を選択
        var bestMoves = validMoves.Where(m => m.score == validMoves.Max(move => move.score)).ToList();
        
        // 同じスコアの手が複数ある場合はランダムに選択
        var random = new Random();
        var selectedMove = bestMoves[random.Next(bestMoves.Count)];
        
        return (selectedMove.x, selectedMove.y);
    }

    // 手の評価値を計算（シンプルなAI）
    private int EvaluateMove(int x, int y, int player)
    {
        int score = 0;
        
        // 角の位置は高得点
        if ((x == 0 || x == BOARD_SIZE - 1) && (y == 0 || y == BOARD_SIZE - 1))
        {
            score += 100;
        }
        // 端の位置は中程度の得点
        else if (x == 0 || x == BOARD_SIZE - 1 || y == 0 || y == BOARD_SIZE - 1)
        {
            score += 10;
        }
        
        // 角に隣接する位置は避ける（相手に角を取られる危険）
        if (IsAdjacentToCorner(x, y))
        {
            score -= 50;
        }
        
        // ひっくり返せる駒の数を評価
        score += CountFlippablePieces(x, y, player);
        
        return score;
    }

    // 角に隣接する位置かチェック
    private bool IsAdjacentToCorner(int x, int y)
    {
        // 角の隣接位置
        var dangerousPositions = new[]
        {
            (1, 0), (0, 1), (1, 1), // 左上角の隣接
            (BOARD_SIZE-2, 0), (BOARD_SIZE-1, 1), (BOARD_SIZE-2, 1), // 右上角の隣接
            (0, BOARD_SIZE-2), (1, BOARD_SIZE-1), (1, BOARD_SIZE-2), // 左下角の隣接
            (BOARD_SIZE-2, BOARD_SIZE-1), (BOARD_SIZE-1, BOARD_SIZE-2), (BOARD_SIZE-2, BOARD_SIZE-2) // 右下角の隣接
        };
        
        return dangerousPositions.Any(pos => pos.Item1 == x && pos.Item2 == y);
    }

    // その位置に置いた時にひっくり返せる駒の数を数える
    private int CountFlippablePieces(int x, int y, int player)
    {
        int count = 0;
        int[] dx = { -1, -1, -1, 0, 0, 1, 1, 1 };
        int[] dy = { -1, 0, 1, -1, 1, -1, 0, 1 };
        
        for (int dir = 0; dir < 8; dir++)
        {
            count += CountFlippableInDirection(x, y, dx[dir], dy[dir], player);
        }
        
        return count;
    }

    // 特定方向でひっくり返せる駒の数を数える
    private int CountFlippableInDirection(int x, int y, int dx, int dy, int player)
    {
        int opponent = player == 1 ? 2 : 1;
        int nx = x + dx;
        int ny = y + dy;
        int count = 0;
        
        while (IsValidPosition(nx, ny))
        {
            if (_board[nx, ny] == 0) return 0;
            if (_board[nx, ny] == opponent)
            {
                count++;
            }
            else if (_board[nx, ny] == player)
            {
                return count;
            }
            
            nx += dx;
            ny += dy;
        }
        
        return 0;
    }
}