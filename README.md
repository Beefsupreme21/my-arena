# my-arena

Fresh game project: **19 game-dev skills** + **minimal playable slice**.

## What's included

```
.cursor/skills/    ← all game-development skills from @MengTo/Skills
index.html         ← entry point
js/main.js         ← slice 0: green box, WASD, grid arena, follow camera
```

No copied box-mover code. Build from here using the skills.

## Run it

```bash
cd ~/Sites/my-arena
python3 -m http.server 8080
```

Open http://localhost:8080 — you should see a grid floor and a green box. **WASD** to move.

> Python here is only a file server (like `php artisan serve`). The game is HTML + JavaScript + Three.js from CDN.

## Open in Cursor

**File → Open Folder** → `~/Sites/my-arena`

Then in chat:

> Use build-isometric-arpg. Add one enemy with tune-enemy-ai.

## Next slices (via skills)

1. `build-isometric-arpg` — combat, encounters, progression
2. `build-game-monster-system` — enemy rigs
3. `test-playable-web-games` — browser QA before calling it done
# my-arena
