using Raylib_cs;
using System;
using System.Numerics;

namespace LibOsa;

public class App
{
    private Color _backgroundColor;
    private InputMgr _inputMgr;
    private ObjMgr _objMgr;
    private SceneMgr _sceneMgr;

    public InputMgr InputMgr => _inputMgr;
    public ObjMgr ObjMgr => _objMgr;
    public SceneMgr SceneMgr => _sceneMgr;

    public App(SceneBase[] scenes, int initialSceneIndex = 0)
    {
        Console.WriteLine("[App::Constructor]");

        _backgroundColor = ColorUtil.CreateColor(128, 128, 128, 255);
        _inputMgr = new InputMgr();
        _objMgr = new ObjMgr();
        _sceneMgr = new SceneMgr(scenes, initialSceneIndex);
    }

    public void Init()
    {
        Console.WriteLine("[App::Init]");

        _inputMgr.Init();
        _sceneMgr.Init();
        _objMgr.Init();
    }

    public void Reset()
    {
        Console.WriteLine("[App::Reset]");

        _inputMgr.Reset();
        _sceneMgr.Reset();
        _objMgr.Reset();
    }

    public void Calc()
    {
        // シーン切り替え（1-5キー）
        for (int i = 1; i <= 5; i++)
        {
            if (_inputMgr.IsTrig(i.ToString()))
            {
                if (_sceneMgr.ChangeScene(i - 1))
                {
                    // シーン変更時はオブジェクトマネージャーをクリア
                    _objMgr.Clear();
                    _objMgr.Init();
                }
                break;
            }
        }

        _sceneMgr.Calc();
        _objMgr.Calc();
        _inputMgr.Calc();
    }

    public void Draw()
    {
        Raylib.ClearBackground(_backgroundColor);
        
        _objMgr.Draw();
        _sceneMgr.Draw();
    }

    public void SetBackgroundColor(Color color)
    {
        _backgroundColor = color;
    }

    public Color GetBackgroundColor()
    {
        return _backgroundColor;
    }

    // シーン取得のヘルパー
    public T GetCurrentScene<T>() where T : SceneBase
    {
        return _sceneMgr.GetCurrentScene<T>();
    }
}