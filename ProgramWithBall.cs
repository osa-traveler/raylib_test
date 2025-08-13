using Raylib_cs;

namespace RaylibTest;

class ProgramWithBall
{
    public static void RunBouncingBallDemo()
    {
        const int screenWidth = 800;
        const int screenHeight = 450;

        Raylib.InitWindow(screenWidth, screenHeight, "Raylib-cs Sample - Bouncing Ball");
        
        Raylib.SetTargetFPS(60);

        var bouncingBall = new BouncingBallDemo(screenWidth, screenHeight);

        while (!Raylib.WindowShouldClose())
        {
            bouncingBall.Update();

            Raylib.BeginDrawing();
            
            Raylib.ClearBackground(Color.RayWhite);
            
            Raylib.DrawText("Raylib-cs で動くボールのデモ", 10, 10, 20, Color.DarkGray);
            
            bouncingBall.Draw();
            
            Raylib.DrawFPS(screenWidth - 80, 10);
            
            Raylib.EndDrawing();
        }

        Raylib.CloseWindow();
    }
}