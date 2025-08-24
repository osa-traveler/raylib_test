using Raylib_cs;
using System.Numerics;

namespace RaylibTest;

public class BouncingBallDemo
{
    private Vector2 ballPosition;
    private Vector2 ballSpeed;
    private float ballRadius;
    private Color ballColor;
    
    private readonly int screenWidth;
    private readonly int screenHeight;

    public BouncingBallDemo(int width, int height)
    {
        screenWidth = width;
        screenHeight = height;
        
        ballPosition = new Vector2(width / 2.0f, height / 2.0f);
        ballSpeed = new Vector2(300.0f, 200.0f);
        ballRadius = 20.0f;
        ballColor = Color.Red;
    }

    public void Update()
    {
        float deltaTime = Raylib.GetFrameTime();
        
        ballPosition.X += ballSpeed.X * deltaTime;
        ballPosition.Y += ballSpeed.Y * deltaTime;

        if (ballPosition.X - ballRadius <= 0 || ballPosition.X + ballRadius >= screenWidth)
        {
            ballSpeed.X *= -1;
            ballColor = GetRandomColor();
        }
        
        if (ballPosition.Y - ballRadius <= 0 || ballPosition.Y + ballRadius >= screenHeight)
        {
            ballSpeed.Y *= -1;
            ballColor = GetRandomColor();
        }
    }

    public void Draw()
    {
        Raylib.DrawCircleV(ballPosition, ballRadius, ballColor);
        
        Raylib.DrawText($"Ball Position: ({(int)ballPosition.X}, {(int)ballPosition.Y})", 
                       10, 40, 20, Color.DarkBlue);
        Raylib.DrawText($"Ball Speed: ({(int)ballSpeed.X}, {(int)ballSpeed.Y})", 
                       10, 70, 20, Color.DarkBlue);
    }

    private Color GetRandomColor()
    {
        var colors = new[] { Color.Red, Color.Blue, Color.Green, Color.Yellow, Color.Purple, Color.Orange };
        return colors[Raylib.GetRandomValue(0, colors.Length - 1)];
    }
}