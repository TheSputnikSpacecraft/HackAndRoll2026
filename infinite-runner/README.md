# Infinite Runner - Hack & Roll 2026

A sophisticated, browser-compatible endless runner engine built with Three.js and TypeScript.
Designed for performance, extensibility, and game feel.

## Controls
- **Arrow Left / A**: Move Left
- **Arrow Right / D**: Move Right
- **Space / Up / W**: Jump
- **Down / S / Shift**: Slide
- **Esc / P**: Pause (Log only for now)

## Architecture

The project follows a strict Entity-Component-System (ECS) inspired structure (though simplified for TypeScript classes).

### Directory Structure
- `/core`: `Game` (entry point), `Loop` (RAF handling), `StateMachine` (State management).
- `/entities`: `Player`, `Track`, `Obstacle`. Self-contained visual + logic units.
- `/systems`: `Spawner` (Logic), `CollisionSystem` (Physics), `InputManager` (Input abstraction).
- `/rendering`: `Renderer`, `Scene`, `Camera`. Wrappers around Three.js boilerplates.
- `/ui`: `HUD`, `GameOver`. DOM-based overlays.

### Extensions
To extend the game:
1. **New Obstacles**: Add types to `Obstacle.ts` and update `Spawner.ts`.
2. **Powerups**: Create a new Entity and add a check in `CollisionSystem`.
3. **Difficulty**: Tune `speed` increments in `Game.ts`.

## Development
```bash
npm install
npm run dev
```
