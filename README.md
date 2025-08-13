# Raylib-cs with libosa Library

このプロジェクトは、Raylib-csを使用したゲーム開発用の共通ライブラリ「libosa」と、パーティクルシステムのサンプルアプリケーションです。

## 構成

### libosa - 共通ライブラリ
- **InputMgr.cs** - キー入力管理（Hold, Trig, Release判定）
- **ObjMgr.cs** - オブジェクトライフサイクル管理
- **SceneMgr.cs** - シーン管理と切り替え
- **App.cs** - アプリケーション統合クラス
- **Util.cs** - SpringF32, 数学・色ユーティリティ
- **ParticleSystem.cs** - パーティクル、エミッタ、重力システム
- **SceneParticle.cs** - パーティクルシーン実装

### サンプルアプリケーション
- **ParticleApp.cs** - libosaを使ったパーティクルデモ
- **Program.cs** - メインエントリーポイント
- **BouncingBall.cs** - バウンシングボールデモ（別デモ）
- **ProgramWithBall.cs** - バウンシングボールデモ実行部

## 実行方法

```bash
dotnet run
```

実行後、以下のオプションから選択：
1. Hello World デモ
2. バウンシングボール デモ  
3. **パーティクルシステム デモ (libosa)** ← メインの機能

## パーティクルデモの操作

- **SPACE** - 背景色変更（6色サイクル）
- **ESC** - 終了

## 技術仕様

- **.NET 8.0**
- **Raylib-cs 7.0.1**
- **C# Primary Constructors**使用
- **クロスプラットフォーム対応**（Windows, macOS, Linux）

## 特徴

### p5.jsからの移植
元々p5.jsで作成されたパーティクルシステムを、Raylib-csに移植し、C#の型安全性とパフォーマンスを活用。

### libosaライブラリの設計思想
- **再利用可能性** - 他のプロジェクトでも使用可能
- **モジュラー設計** - 各コンポーネントが独立
- **拡張性** - 新しいシーンやオブジェクト型を簡単に追加

### 物理シミュレーション
- 重力井戸による引力計算
- パーティクルの慣性と減衰
- 衝突検知とフィードバック
- SpringF32による滑らかなアニメーション

## 開発履歴

1. p5.jsプロジェクトの解析
2. Raylib-cs環境構築
3. libosa共通ライブラリ設計・実装
4. パーティクルシステム移植
5. サンプルアプリケーション完成

## 今後の拡張予定

- レインシーン（SceneRain）の実装
- ダンスシーン（SceneDance）の実装
- 2Dアクションシーン（Scene2DAction）の実装
- UI要素の追加