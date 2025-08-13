using Raylib_cs;
using System;
using System.Collections.Generic;
using System.Numerics;

namespace LibOsa;

public class ObjEmitter(Vector2 position) : ObjBase
{
    private Vector2 _position = position;
    private int _counter = 0;
    private int _state = 0;
    private int _interval = 100000;
    private SpringF32 _scale = new SpringF32(1.0f);
    private Random _random = new Random();

    public Vector2 Position => _position;

    public override void Init()
    {
        Console.WriteLine("[ObjEmitter::Init]");
        base.Init();
    }

    public override void Reset()
    {
        Console.WriteLine("[ObjEmitter::Reset]");
        base.Reset();

        _counter = 0;
        _state = 0;
        _interval = 100000;
        _scale.Set(1.0f);
        _scale.AddSpeed(0.5f);
    }

    public override void Calc()
    {
        base.Calc();

        _scale.UpdateToTarget(1.0f, 0.1f, 0.90f);

        switch (_state)
        {
            case 0:
                if (_counter == 5)
                {
                    // Emit呼び出しは外部から行う
                    _state = 1;
                    _interval = 120;
                    return;
                }
                break;

            case 1:
                if (_counter % 16 == 0)
                {
                    _scale.AddSpeed(0.25f);
                    // Emit呼び出しは外部から行う
                }
                break;
        }

        _counter++;
    }

    public override void Draw()
    {
        float scale = _scale.Get();
        if (scale < 0.001f) scale = 0.001f;

        // 白い中心点
        Raylib.DrawCircle((int)_position.X, (int)_position.Y, 10 * scale, Color.White);

        // 赤い十字マーク
        float crossSize = 4 * scale;
        Raylib.DrawLineEx(
            new Vector2(_position.X - crossSize, _position.Y),
            new Vector2(_position.X + crossSize, _position.Y),
            3, Color.Red
        );
        Raylib.DrawLineEx(
            new Vector2(_position.X, _position.Y - crossSize),
            new Vector2(_position.X, _position.Y + crossSize),
            3, Color.Red
        );
    }

    private void Emit(float x, float y)
    {
        for (int n = 0; n < 12; n++)
        {
            float speed = 3 * (float)_random.NextDouble() * 2.0f;
            float angle = n * 30 * MathF.PI / 180.0f;
            Vector2 velocity = new Vector2(MathF.Cos(angle) * speed, MathF.Sin(angle) * speed);

            Color color;
            if (_random.Next(0, 4) == 0)
            {
                // 青系
                color = ColorUtil.CreateColor(
                    (byte)(23 + _random.Next(-15, 128)),
                    (byte)(23 + _random.Next(-15, 128)),
                    (byte)(229 + _random.Next(-50, 50)),
                    255
                );
            }
            else
            {
                // 赤系
                color = ColorUtil.CreateColor(
                    (byte)(229 + _random.Next(-50, 50)),
                    (byte)(23 + _random.Next(-15, 128)),
                    (byte)(23 + _random.Next(-15, 128)),
                    255
                );
            }

            // グローバルなObjMgrに追加要求
            // これは後でAppクラスから渡されるようにします
        }
    }

    public bool ShouldEmit()
    {
        return (_state == 0 && _counter == 5) || (_state == 1 && _counter % 16 == 0);
    }

    public void EmitParticles(ObjMgr objMgr, float x, float y)
    {
        for (int n = 0; n < 12; n++)
        {
            float speed = 3 * (float)_random.NextDouble() * 2.0f;
            float angle = n * 30 * MathF.PI / 180.0f;
            Vector2 velocity = new Vector2(MathF.Cos(angle) * speed, MathF.Sin(angle) * speed);

            Color color;
            if (_random.Next(0, 4) == 0)
            {
                color = ColorUtil.CreateColor(
                    (byte)(23 + _random.Next(-15, 128)),
                    (byte)(23 + _random.Next(-15, 128)),
                    (byte)(229 + _random.Next(-50, 50)),
                    255
                );
            }
            else
            {
                color = ColorUtil.CreateColor(
                    (byte)(229 + _random.Next(-50, 50)),
                    (byte)(23 + _random.Next(-15, 128)),
                    (byte)(23 + _random.Next(-15, 128)),
                    255
                );
            }

            objMgr.RequestAdd(new ObjParticle(color, new Vector2(x, y), velocity));
        }
    }
}

public class ObjGravityGenerator(Vector2 position) : ObjBase
{
    private Vector2 _position = position;
    private int _counter = 0;
    private float _power = 40.0f;
    private SpringF32 _scale = new SpringF32(1.0f);

    public Vector2 Position => _position;
    public float Power => _power;

    public override void Init()
    {
        Console.WriteLine("[ObjGravityGenerator::Init]");
        base.Init();
    }

    public override void Reset()
    {
        Console.WriteLine("[ObjGravityGenerator::Reset]");
        base.Reset();

        _counter = 0;
        _power = 40.0f;
        _scale.Set(1.0f);
    }

    public override void Calc()
    {
        base.Calc();

        _counter++;

        if (_counter == 6000000 || _shouldRemove)
        {
            // 長時間経過で削除
        }

        _scale.UpdateToTarget(1.0f, 0.2f, 0.8f);
    }

    public override void Draw()
    {
        // 重力ジェネレーターは見た目を描画しない（元のコードでコメントアウトされている）
    }

    public void AddScale(float value)
    {
        _scale.AddSpeed(value);
    }
}

public class ObjParticle(Color color, Vector2 position, Vector2 velocity) : ObjBase
{
    private Color _color = color;
    private Vector2 _position = position;
    private Vector2 _velocity = velocity;
    private Vector2 _oldVelocity = velocity;
    private SpringF32 _scale = new SpringF32(1.0f);
    private int _fadeCounter = -1;
    private int _counter = 0;

    public Vector2 Position => _position;
    public Vector2 Velocity => _velocity;

    public override void Init()
    {
        // パーティクルは初期化なし
    }

    public override void Reset()
    {
        _counter = 0;
    }

    public override void Calc()
    {
        _oldVelocity = _velocity;

        // 重力計算は外部から行われる
        if (_fadeCounter == -1)
        {
            // 重力影響を受ける場合の処理は外部から
        }

        _position.X += _velocity.X;
        _position.Y += _velocity.Y;

        // フェードアウト開始条件
        if (_counter == 600 || (_counter == 15 /* && no gravity generators */))
        {
            _fadeCounter = 60;
        }

        if (_counter == 60 /* && no gravity generators */)
        {
            _fadeCounter = 60;
        }

        if (_fadeCounter > -1)
        {
            _fadeCounter--;
            if (_fadeCounter == 0)
            {
                _shouldRemove = true;
            }
        }

        _scale.UpdateToTarget(1.0f, 0.05f, 0.85f);

        _velocity.X *= 0.975f;
        _velocity.Y *= 0.975f;

        // 色の透明度を速度に応じて変更
        float speed = _velocity.Length();
        if (speed > 10) speed = 10;
        byte alpha = (byte)MathUtil.Map(speed, 0, 10, 255, 64);
        _color = new Color(_color.R, _color.G, _color.B, alpha);

        _counter++;
    }

    public override void Draw()
    {
        float lineWidth = MathF.Sqrt(_velocity.Length()) / 0.5f;
        if (lineWidth < 1.0f) lineWidth = 1.0f;

        float length = 3;
        Raylib.DrawLineEx(
            _position,
            new Vector2(_position.X + _velocity.X * length, _position.Y + _velocity.Y * length),
            lineWidth,
            _color
        );
    }

    public void ApplyGravity(Vector2 gravity)
    {
        if (_fadeCounter == -1)
        {
            _velocity += gravity;
        }
    }

    public bool CheckCollisionWithGravityGenerator(ObjGravityGenerator generator)
    {
        float distance = Vector2.Distance(generator.Position, _position);
        if (distance < 20 && Math.Abs(_velocity.Length()) < 20.0f)
        {
            generator.AddScale(0.1f);
            return true;
        }
        return false;
    }
}