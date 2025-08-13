using Raylib_cs;
using System;
using System.Collections.Generic;
using System.Numerics;

namespace LibOsa;

public class SceneParticle : SceneBase
{
    private List<ObjGravityGenerator> _gravityGenerators;
    private Color[] _backgroundColors;
    private int _currentColorIndex;
    private Func<App> _appProvider;
    private App App => _appProvider();
    private ObjEmitter? _emitter1;
    private ObjEmitter? _emitter2;
    private ObjGravityGenerator? _gravity;

    public List<ObjGravityGenerator> GravityGenerators => _gravityGenerators;

    public SceneParticle(Func<App> appProvider)
    {
        _appProvider = appProvider;
        _gravityGenerators = new List<ObjGravityGenerator>();

        // 背景色の配列
        _backgroundColors = new Color[]
        {
            ColorUtil.CreateColor(80, 50, 120, 255),   // 暗い紫
            ColorUtil.CreateColor(20, 20, 60, 255),    // 濃い青
            ColorUtil.CreateColor(60, 20, 20, 255),    // 濃い赤
            ColorUtil.CreateColor(20, 60, 20, 255),    // 濃い緑
            ColorUtil.CreateColor(0, 0, 0, 255),       // 黒
            ColorUtil.CreateColor(40, 40, 40, 255)     // 濃いグレー
        };
        _currentColorIndex = 0;
    }

    public override void Init()
    {
        Console.WriteLine("[SceneParticle::Init]");

        App.SetBackgroundColor(_backgroundColors[_currentColorIndex]);

        // エミッタ1
        _emitter1 = new ObjEmitter(new Vector2(200, 400));
        App.ObjMgr.RequestAdd(_emitter1);

        // エミッタ2
        _emitter2 = new ObjEmitter(new Vector2(100, 100));
        App.ObjMgr.RequestAdd(_emitter2);

        // 重力ジェネレータ
        _gravity = new ObjGravityGenerator(new Vector2(400, 300));
        App.ObjMgr.RequestAdd(_gravity);
        AddGravityGenerator(_gravity);
    }

    public override void Reset()
    {
        Console.WriteLine("[SceneParticle::Reset]");
        // 必要に応じてリセット処理
    }

    public override void Calc()
    {
        // スペースキーで背景色変更
        if (App.InputMgr.IsTrig("space"))
        {
            ChangeBackgroundColor();
        }

        // エミッタからパーティクル生成
        if (_emitter1 != null && _emitter1.ShouldEmit())
        {
            EmitParticlesFromEmitter(_emitter1);
        }

        if (_emitter2 != null && _emitter2.ShouldEmit())
        {
            EmitParticlesFromEmitter(_emitter2);
        }

        // パーティクルに重力を適用
        ApplyGravityToParticles();

        // パーティクルと重力ジェネレータの衝突チェック
        CheckParticleCollisions();
    }

    public override void Draw()
    {
        // シーン固有の描画があればここに
    }

    public void AddGravityGenerator(ObjGravityGenerator generator)
    {
        _gravityGenerators.Add(generator);
        Console.WriteLine($"Gravity generator added. Total: {_gravityGenerators.Count}");
    }

    public void RemoveGravityGenerator(ObjGravityGenerator generator)
    {
        _gravityGenerators.Remove(generator);
        Console.WriteLine($"Gravity generator removed. Total: {_gravityGenerators.Count}");
    }

    public Vector2 CalcGravity(Vector2 position)
    {
        Vector2 result = Vector2.Zero;

        foreach (var generator in _gravityGenerators)
        {
            Vector2 direction = generator.Position - position;
            float distance = direction.Length();
            if (distance < 20) distance = 20;

            direction = Vector2.Normalize(direction);
            float force = generator.Power / (distance * distance);
            result += direction * force;
        }

        return result;
    }

    public bool CheckCollision(ObjParticle particle)
    {
        foreach (var generator in _gravityGenerators)
        {
            if (particle.CheckCollisionWithGravityGenerator(generator))
            {
                return true;
            }
        }
        return false;
    }

    private void ChangeBackgroundColor()
    {
        _currentColorIndex = (_currentColorIndex + 1) % _backgroundColors.Length;
        App.SetBackgroundColor(_backgroundColors[_currentColorIndex]);
    }

    private void EmitParticlesFromEmitter(ObjEmitter emitter)
    {
        // エミッタの発射ロジックを呼び出し
        emitter.EmitParticles(App.ObjMgr, emitter.Position.X, emitter.Position.Y);
    }

    private void ApplyGravityToParticles()
    {
        var particles = App.ObjMgr.FindObjectsOfType<ObjParticle>();
        foreach (var particle in particles)
        {
            Vector2 gravity = CalcGravity(particle.Position);
            particle.ApplyGravity(gravity);
        }
    }

    private void CheckParticleCollisions()
    {
        var particles = App.ObjMgr.FindObjectsOfType<ObjParticle>();
        foreach (var particle in particles)
        {
            CheckCollision(particle);
        }
    }
}