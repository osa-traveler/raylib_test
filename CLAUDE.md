# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Raylib-cs (C#) game development project featuring a reusable game library called **libosa** and sample applications including particle systems, bouncing ball demos, and a foundation for 2D game development. The project also includes the original p5.js version as reference.

## Key Architecture

### Project Structure
- **Root directory** - Main C# project using .NET 8.0 and Raylib-cs 7.0.1
- **libosa/** - Shared game development library with core systems
- **RaylibTest/raylib/** - Complete raylib C library source (reference only)
- **p5_sample_project/** - Original p5.js implementation for reference (excluded from git)

### libosa Library Architecture
The libosa library follows a component-based architecture:

- **App.cs** - Central application coordinator managing all subsystems
- **SceneMgr.cs** - Scene management with SceneBase abstract class for different game states
- **ObjMgr.cs** - Object lifecycle management system
- **InputMgr.cs** - Input handling with Hold/Trig/Release state tracking
- **ParticleSystem.cs** - Physics-based particle simulation with gravity wells
- **Util.cs** - Mathematical utilities including SpringF32 for smooth animations
- **SceneParticle.cs** - Particle system demo scene implementation

### Key Design Patterns
- **Manager Pattern**: Separate managers for Input, Objects, and Scenes
- **Scene Pattern**: Abstract SceneBase class for different application states
- **Component Coordination**: App class orchestrates all managers in proper order
- **Cross-Platform**: Designed for Windows, macOS, and Linux compatibility

## Common Development Commands

### Building and Running
```bash
# Build the project
dotnet build RaylibTest.csproj

# Run the main application (interactive demo selector)
dotnet run

# Run in release mode
dotnet run --configuration Release
```

### Development Workflow
The main application provides three demo options:
1. Hello World demo
2. Bouncing Ball demo  
3. **Particle System demo (libosa)** - Main feature showcasing the library

### Runtime Controls
- **SPACE** - Background color cycling (in particle demo)
- **ESC** - Exit application
- **1-5 keys** - Scene switching (when implemented in App)

## Technical Implementation Notes

### libosa Integration
- libosa source files are compiled directly into the main project via `<Compile Include="../libosa/*.cs" />`
- No separate library compilation needed - all C# files are built together
- The library uses C# primary constructors and modern .NET 8.0 features

### Physics and Animation
- SpringF32 system for smooth value transitions
- Gravity well physics in particle system
- Frame-rate independent calculations
- Particle lifecycle management with emission and decay

### p5.js Migration Reference
The original p5.js implementation in `p5_sample_project/` serves as the reference for:
- Original game logic and physics calculations
- Scene architecture that was ported to C#
- Input handling patterns adapted to Raylib-cs

### Extensibility Points
- **New Scenes**: Inherit from SceneBase and add to App constructor
- **New Particle Types**: Extend ParticleSystem classes
- **Additional Managers**: Follow the pattern of InputMgr/ObjMgr
- **Platform-Specific Code**: Use Raylib-cs cross-platform capabilities

## Planned Extensions
Based on README, future scenes to implement:
- SceneRain - Rain particle effects
- SceneDance - Dance animation system  
- Scene2DAction - 2D platformer/action game mechanics
- UI system integration

## Development Environment
- Requires .NET 8.0 SDK
- Uses Raylib-cs NuGet package (no native raylib compilation needed)
- Cross-platform development supported
- No external dependencies beyond Raylib-cs package