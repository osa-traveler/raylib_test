using System;
using System.Collections.Generic;
using System.Linq;

namespace LibOsa;

public abstract class ObjBase
{
    protected bool _shouldRemove = false;

    public virtual void Init()
    {
        Console.WriteLine("[ObjBase::Init]");
    }

    public virtual void Reset()
    {
        Console.WriteLine("[ObjBase::Reset]");
    }

    public virtual void Calc()
    {
    }

    public virtual void Draw()
    {
    }

    public virtual void DrawAfter()
    {
    }

    public bool ShouldRemove()
    {
        return _shouldRemove;
    }

    protected void RequestRemove()
    {
        _shouldRemove = true;
    }
}

public class ObjMgr
{
    private Dictionary<int, ObjBase> _objects;
    private Dictionary<int, ObjBase> _addRequested;
    private int _objNum;
    private int _requestNum;

    public ObjMgr()
    {
        _objects = new Dictionary<int, ObjBase>();
        _addRequested = new Dictionary<int, ObjBase>();
        _objNum = 0;
        _requestNum = 0;
    }

    public void Init()
    {
        Console.WriteLine("[ObjMgr::Init]");

        // 初期化時に追加要求されたオブジェクトを追加
        foreach (var obj in _addRequested.Values)
        {
            AddInternal(obj);
        }
        _addRequested.Clear();
        _requestNum = 0;
    }

    public void Reset()
    {
        Console.WriteLine("[ObjMgr::Reset]");

        _addRequested.Clear();
        _requestNum = 0;

        foreach (var obj in _objects.Values)
        {
            obj.Reset();
        }
    }

    public void Calc()
    {
        // 既存オブジェクトの計算
        foreach (var obj in _objects.Values)
        {
            obj.Calc();
        }

        // 追加要求されたオブジェクトを追加
        foreach (var obj in _addRequested.Values)
        {
            AddInternal(obj);
        }
        _addRequested.Clear();
        _requestNum = 0;

        // 削除チェック
        CheckRemove();
    }

    public void Draw()
    {
        // 通常の描画
        foreach (var obj in _objects.Values)
        {
            obj.Draw();
        }

        // 後処理描画
        foreach (var obj in _objects.Values)
        {
            obj.DrawAfter();
        }
    }

    public void Clear()
    {
        _objects.Clear();
        _addRequested.Clear();
        _objNum = 0;
        _requestNum = 0;
    }

    public void RequestAdd(ObjBase obj)
    {
        _addRequested[_requestNum] = obj;
        _requestNum++;
    }

    private void CheckRemove()
    {
        var toRemove = _objects.Where(kvp => kvp.Value.ShouldRemove()).ToList();
        foreach (var kvp in toRemove)
        {
            _objects.Remove(kvp.Key);
        }
    }

    private void AddInternal(ObjBase obj)
    {
        obj.Init();
        obj.Reset();
        _objects[_objNum] = obj;
        _objNum++;
    }

    // デバッグ用：オブジェクト数を取得
    public int GetObjectCount()
    {
        return _objects.Count;
    }

    // 特定の型のオブジェクトを検索
    public List<T> FindObjectsOfType<T>() where T : ObjBase
    {
        return _objects.Values.OfType<T>().ToList();
    }
}