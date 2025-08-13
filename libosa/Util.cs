using System;
using System.Numerics;

namespace LibOsa;

public class SpringF32
{
    private float _value;
    private float _speed;

    public SpringF32(float value)
    {
        _value = value;
        _speed = 0.0f;
    }

    public float Get()
    {
        return _value;
    }

    public void Set(float value)
    {
        _value = value;
        _speed = 0.0f;
    }

    public void AddSpeed(float add)
    {
        _speed += add;
    }

    public void UpdateToTarget(float target, float k, float dump)
    {
        _value += _speed;
        _speed *= dump;
        _speed += (target - _value) * k;
    }
}

// 数学ユーティリティ
public static class MathUtil
{
    public static float Clamp(float value, float min, float max)
    {
        return Math.Max(min, Math.Min(max, value));
    }

    public static int Clamp(int value, int min, int max)
    {
        return Math.Max(min, Math.Min(max, value));
    }

    public static float Lerp(float a, float b, float t)
    {
        return a + (b - a) * t;
    }

    public static float Map(float value, float fromMin, float fromMax, float toMin, float toMax)
    {
        return toMin + (value - fromMin) * (toMax - toMin) / (fromMax - fromMin);
    }

    public static Vector2 CreateVector2(float x, float y)
    {
        return new Vector2(x, y);
    }

    public static float Distance(Vector2 a, Vector2 b)
    {
        return Vector2.Distance(a, b);
    }

    public static Vector2 Normalize(Vector2 vector)
    {
        return Vector2.Normalize(vector);
    }

    public static float RadiansToDegrees(float radians)
    {
        return radians * (180.0f / MathF.PI);
    }

    public static float DegreesToRadians(float degrees)
    {
        return degrees * (MathF.PI / 180.0f);
    }
}

// 色ユーティリティ
public static class ColorUtil
{
    public static Raylib_cs.Color CreateColor(byte r, byte g, byte b, byte a = 255)
    {
        return new Raylib_cs.Color(r, g, b, a);
    }

    public static Raylib_cs.Color CreateColorF(float r, float g, float b, float a = 1.0f)
    {
        return new Raylib_cs.Color(
            (byte)(r * 255), 
            (byte)(g * 255), 
            (byte)(b * 255), 
            (byte)(a * 255)
        );
    }

    public static Raylib_cs.Color RandomColor(Random random)
    {
        return CreateColor(
            (byte)random.Next(256),
            (byte)random.Next(256),
            (byte)random.Next(256),
            255
        );
    }
}

// タイマーユーティリティ
public class Timer
{
    private float _duration;
    private float _currentTime;
    private bool _isRunning;

    public Timer(float duration)
    {
        _duration = duration;
        _currentTime = 0.0f;
        _isRunning = false;
    }

    public void Start()
    {
        _currentTime = 0.0f;
        _isRunning = true;
    }

    public void Stop()
    {
        _isRunning = false;
    }

    public void Reset()
    {
        _currentTime = 0.0f;
    }

    public void Update(float deltaTime)
    {
        if (_isRunning)
        {
            _currentTime += deltaTime;
        }
    }

    public bool IsFinished()
    {
        return _currentTime >= _duration;
    }

    public float GetProgress()
    {
        return MathUtil.Clamp(_currentTime / _duration, 0.0f, 1.0f);
    }

    public float GetRemainingTime()
    {
        return Math.Max(0.0f, _duration - _currentTime);
    }

    public bool IsRunning => _isRunning;
}