using Raylib_cs;
using LibOsa;

namespace RaylibTest;

class OthelloApp
{
    public static void RunOthelloDemo()
    {
        const int screenWidth = 800;
        const int screenHeight = 600;

        Raylib.InitWindow(screenWidth, screenHeight, "Raylib-cs Othello Game - libosa");
        Raylib.SetTargetFPS(60);

        // アプリケーションを作成
        App app = null!; // 後で初期化
        
        // オセロシーンを作成
        var othelloScene = new SceneOthello(() => app); // ラムダで遅延評価
        
        // シーンの配列を作成
        var scenes = new SceneBase[] { othelloScene };
        
        // 実際のAppを作成
        app = new App(scenes, 0);
        
        // アプリケーションの初期化
        app.Init();
        app.Reset();

        Console.WriteLine("=== Othello Game Started ===");
        Console.WriteLine("あなたは黒、CPUは白です");
        Console.WriteLine("Controls:");
        Console.WriteLine("- Mouse Click: Place piece (あなたの番のみ)");
        Console.WriteLine("- R: Reset game");
        Console.WriteLine("- ESC: Exit");

        while (!Raylib.WindowShouldClose())
        {
            // 更新
            app.Calc();

            // 描画
            Raylib.BeginDrawing();
            
            app.Draw();
            
            // UI表示
            Raylib.DrawText("libosa Othello Game", 10, 10, 20, Color.White);
            Raylib.DrawText("あなた: 黒, CPU: 白", 10, 35, 16, Color.Yellow);
            Raylib.DrawText("Mouse Click: Place piece", 10, screenHeight - 80, 16, Color.LightGray);
            Raylib.DrawText("R: Reset game", 10, screenHeight - 60, 16, Color.LightGray);
            Raylib.DrawText("ESC: Exit", 10, screenHeight - 40, 16, Color.LightGray);
            
            Raylib.DrawFPS(screenWidth - 80, 10);
            
            Raylib.EndDrawing();
        }

        Raylib.CloseWindow();
    }
}