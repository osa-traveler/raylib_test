using Raylib_cs;
using System;
using System.Collections.Generic;

namespace LibOsa;

public class InputMgr
{
    private Dictionary<string, bool> _oldPressed;
    private Dictionary<string, bool> _pressed;
    
    // キーマッピング
    private readonly Dictionary<string, KeyboardKey> _keyMap = new()
    {
        { "left", KeyboardKey.Left },
        { "right", KeyboardKey.Right },
        { "space", KeyboardKey.Space },
        { "1", KeyboardKey.One },
        { "2", KeyboardKey.Two },
        { "3", KeyboardKey.Three },
        { "4", KeyboardKey.Four },
        { "5", KeyboardKey.Five },
        { "a", KeyboardKey.A },
        { "d", KeyboardKey.D },
        { "z", KeyboardKey.Z },
        { "r", KeyboardKey.R }
    };

    public InputMgr()
    {
        _oldPressed = new Dictionary<string, bool>();
        _pressed = new Dictionary<string, bool>();

        // キーの初期化
        foreach (var key in _keyMap.Keys)
        {
            _oldPressed[key] = false;
            _pressed[key] = false;
        }
    }

    public void Init()
    {
        Console.WriteLine("[InputMgr::Init]");
    }

    public void Reset()
    {
        Console.WriteLine("[InputMgr::Reset]");
        
        foreach (var key in _keyMap.Keys)
        {
            _oldPressed[key] = false;
            _pressed[key] = false;
        }
    }

    public void Calc()
    {
        // 前フレームの状態を保存
        foreach (var key in _keyMap.Keys)
        {
            _oldPressed[key] = _pressed[key];
        }

        // 現在の状態を更新
        foreach (var kvp in _keyMap)
        {
            _pressed[kvp.Key] = Raylib.IsKeyDown(kvp.Value);
        }
    }

    // キーが押されている間true
    public bool IsHold(string key)
    {
        return _pressed.ContainsKey(key) && _pressed[key];
    }

    // キーが押された瞬間だけtrue
    public bool IsTrig(string key)
    {
        return _pressed.ContainsKey(key) && 
               _pressed[key] && 
               !_oldPressed[key];
    }

    // キーが離された瞬間だけtrue
    public bool IsRelease(string key)
    {
        return _pressed.ContainsKey(key) && 
               !_pressed[key] && 
               _oldPressed[key];
    }
}