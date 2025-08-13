using System;

namespace LibOsa;

public abstract class SceneBase
{
    public virtual void Init()
    {
        Console.WriteLine("[SceneBase::Init]");
    }

    public virtual void Reset()
    {
        Console.WriteLine("[SceneBase::Reset]");
    }

    public virtual void Calc()
    {
    }

    public virtual void Draw()
    {
    }
}

public class SceneMgr
{
    private SceneBase[] _scenes;
    private int _currentSceneIndex;
    private SceneBase _currentScene;

    public SceneBase CurrentScene => _currentScene;
    public int CurrentSceneIndex => _currentSceneIndex;

    public SceneMgr(SceneBase[] scenes, int initialSceneIndex = 0)
    {
        _scenes = scenes ?? throw new ArgumentNullException(nameof(scenes));
        if (scenes.Length == 0)
        {
            throw new ArgumentException("At least one scene is required", nameof(scenes));
        }

        _currentSceneIndex = Math.Clamp(initialSceneIndex, 0, scenes.Length - 1);
        _currentScene = _scenes[_currentSceneIndex];
    }

    public void Init()
    {
        Console.WriteLine("[SceneMgr::Init]");
        _currentScene.Init();
    }

    public void Reset()
    {
        Console.WriteLine("[SceneMgr::Reset]");
        _currentScene.Reset();
    }

    public void Calc()
    {
        _currentScene.Calc();
    }

    public void Draw()
    {
        _currentScene.Draw();
    }

    public bool ChangeScene(int sceneIndex)
    {
        if (sceneIndex >= 0 && sceneIndex < _scenes.Length && sceneIndex != _currentSceneIndex)
        {
            _currentSceneIndex = sceneIndex;
            _currentScene = _scenes[_currentSceneIndex];

            // 新しいシーンを初期化
            _currentScene.Init();
            _currentScene.Reset();

            Console.WriteLine($"[SceneMgr::ChangeScene] Scene changed to: {sceneIndex}");
            return true;
        }

        return false;
    }

    public int GetSceneCount()
    {
        return _scenes.Length;
    }

    public T? GetCurrentScene<T>() where T : SceneBase
    {
        return _currentScene as T;
    }
}