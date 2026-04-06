# SUPER HOPPER

Arcade endless runner made with `Three.js`.

## Features

- `1 PLAYER` and `2 PLAYERS`
- `10` unlockable levels
- different worlds and level goals
- coins collection
- shop with skins
- shop with effects
- separate skins for `P1` and `P2`
- rare `+5` coins
- `Magnet` effect
- mobile swipe controls
- keyboard controls
- saved progress with `localStorage`

## Controls

### Player 1
- `A` = move left
- `D` = move right
- `W` = jump

### Player 2
- `Arrow Left` = move left
- `Arrow Right` = move right
- `Arrow Up` = jump

### Mobile
- swipe left = move left
- swipe right = move right
- swipe up = jump

In `2 PLAYERS` mode:
- left half of screen controls `P1`
- right half of screen controls `P2`

## Game Modes

### 1 Player
Play solo, collect coins, unlock levels, buy skins and effects.

### 2 Players
Two players race on separate roads.
Both players can score independently.

## Levels

There are `10` levels.

Each level can have:
- different sky and ground theme
- different speed
- different target score
- different difficulty feeling

Only level `1` is open at the start.

When you complete a level:
- the next level becomes unlocked

## Coins

During gameplay you can collect:
- normal coins = `+1`
- rare big coins = `+5`

Coins are used in the shop.

Coins are saved automatically in `localStorage`.

## Shop

The shop includes:

### Skins
- separate skin selection for `PLAYER 1`
- separate skin selection for `PLAYER 2`

### Effects
- `None`
- `Spark`
- `Aqua`
- `Fire`
- `Magnet`

## Magnet Effect

`Magnet` pulls nearby coins toward the player.

It helps collect coins more easily without touching them exactly.

## Progress Saving

The game saves:
- coins
- unlocked levels
- owned skins
- owned effects
- selected skin for `P1`
- selected skin for `P2`
- selected effect

Progress is stored in browser `localStorage`.

## Files

- `index.html` — page structure
- `style.css` — styles
- `script.js` — game logic
- `README.md` — project description

## Tech

- `HTML`
- `CSS`
- `JavaScript`
- `Three.js`

## Run

Open the project in a local server.

Example:
```bash
python -m http.server
