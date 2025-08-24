using Raylib_cs;

namespace RaylibTest;

class Program
{
    [STAThread]
    public static void Main()
    {
        Console.WriteLine("Raylib-cs サンプル集");
        Console.WriteLine("====================");
        Console.WriteLine("1. Hello World デモ");
        Console.WriteLine("2. バウンシングボール デモ");
        Console.WriteLine("3. パーティクルシステム デモ (libosa)");
        Console.WriteLine("4. オセロゲーム デモ (libosa)");
        Console.WriteLine();
        Console.Write("実行したいデモを選択してください (1, 2, 3, または 4): ");
        
        string input = Console.ReadLine() ?? "1";
        
        switch (input)
        {
            case "2":
                ProgramWithBall.RunBouncingBallDemo();
                break;
            case "3":
                ParticleApp.RunParticleDemo();
                break;
            case "4":
                OthelloApp.RunOthelloDemo();
                break;
            default:
                RunHelloWorldDemo();
                break;
        }
    }

    private static void RunHelloWorldDemo()
    {
        const int screenWidth = 800;
        const int screenHeight = 450;

        Raylib.InitWindow(screenWidth, screenHeight, "Raylib-cs Sample - Hello World");
        
        Raylib.SetTargetFPS(60);

        while (!Raylib.WindowShouldClose())
        {
            Raylib.BeginDrawing();
            
            Raylib.ClearBackground(Color.RayWhite);
            
            Raylib.DrawText("こんにちは、Raylib-cs!", 190, 200, 20, Color.LightGray);
            Raylib.DrawText("Hello, Raylib-cs!", 190, 230, 20, Color.DarkGray);
            Raylib.DrawText("ESCキーで終了", 190, 280, 16, Color.DarkBlue);
            
            Raylib.DrawFPS(10, 10);
            
            Raylib.EndDrawing();
        }

        Raylib.CloseWindow();
    }
}
