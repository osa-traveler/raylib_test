using Raylib_cs;
using LibOsa;

namespace RaylibTest;

// 一時的なダミーシーン
internal class TempScene : SceneBase
{
}

class ParticleApp
{
    public static void RunParticleDemo()
    {
        const int screenWidth = 800;
        const int screenHeight = 450;

        Raylib.InitWindow(screenWidth, screenHeight, "Raylib-cs Particle Demo - libosa");
        Raylib.SetTargetFPS(60);

        // アプリケーションを作成
        App app = null!; // 後で初期化
        
        // パーティクルシーンを作成
        var particleScene = new SceneParticle(() => app); // ラムダで遅延評価
        
        // シーンの配列を作成
        var scenes = new SceneBase[] { particleScene };
        
        // 実際のAppを作成
        app = new App(scenes, 0);
        
        // アプリケーションの初期化
        app.Init();
        app.Reset();

        Console.WriteLine("=== Particle Demo Started ===");
        Console.WriteLine("Controls:");
        Console.WriteLine("- SPACE: Change background color");
        Console.WriteLine("- ESC: Exit");

        while (!Raylib.WindowShouldClose())
        {
            // 更新
            app.Calc();

            // 描画
            Raylib.BeginDrawing();
            
            app.Draw();
            
            // UI表示
            Raylib.DrawText("libosa Particle Demo", 10, 10, 20, Color.White);
            Raylib.DrawText("SPACE: Change BG Color", 10, screenHeight - 60, 16, Color.LightGray);
            Raylib.DrawText("ESC: Exit", 10, screenHeight - 40, 16, Color.LightGray);
            
            // オブジェクト数表示
            int objectCount = app.ObjMgr.GetObjectCount();
            Raylib.DrawText($"Objects: {objectCount}", screenWidth - 150, 10, 16, Color.Yellow);
            
            Raylib.DrawFPS(screenWidth - 80, 30);
            
            Raylib.EndDrawing();
        }

        Raylib.CloseWindow();
    }
}