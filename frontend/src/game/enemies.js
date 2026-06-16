const ALL_DIRS = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]

function rand(n) { return Math.floor(Math.random() * n) }

function bounce(dir, x, y, cols, rows) {
  let d = dir
  let nx = x + d.x, ny = y + d.y
  if (nx < 0 || nx >= cols) { d = { x: -d.x, y: d.y }; nx = x + d.x }
  if (ny < 0 || ny >= rows) { d = { x: d.x, y: -d.y }; ny = y + d.y }
  return { dir: d, nx, ny }
}

// Avoids every snake cell (including head) — passive, never actually catches the player by walking into it.
function moveAvoidant(enemy, ctx) {
  let { x, y, dir } = enemy
  if (Math.random() < 0.25) dir = ALL_DIRS[rand(4)]
  const { nx, ny, dir: d } = bounce(dir, x, y, ctx.cols, ctx.rows)
  const blocked =
    ctx.snake.some(s => s.x === nx && s.y === ny) ||
    ctx.enemies.some(e => e !== enemy && e.x === nx && e.y === ny)
  if (blocked) return { ...enemy, dir: ALL_DIRS[rand(4)] }
  return { ...enemy, x: nx, y: ny, dir: d }
}

// Biased toward the snake's head; may walk into it (real threat). Avoids body segments only.
function moveAggressive(enemy, ctx, aggression) {
  let { x, y, dir } = enemy
  const head = ctx.snake[0]
  if (Math.random() < aggression) {
    const scored = ALL_DIRS.map(d => {
      const nx = x + d.x, ny = y + d.y
      if (nx < 0 || nx >= ctx.cols || ny < 0 || ny >= ctx.rows) return null
      return { d, dist: Math.abs(nx - head.x) + Math.abs(ny - head.y) }
    }).filter(Boolean)
    scored.sort((a, b) => a.dist - b.dist)
    if (scored.length) dir = scored[rand(Math.min(2, scored.length))].d
  } else {
    dir = ALL_DIRS[rand(4)]
  }
  let nx = x + dir.x, ny = y + dir.y
  if (nx < 0 || nx >= ctx.cols) { dir = { x: -dir.x, y: dir.y }; nx = x + dir.x }
  if (ny < 0 || ny >= ctx.rows) { dir = { x: dir.x, y: -dir.y }; ny = y + dir.y }

  const body = ctx.snake.slice(1)
  const blocked =
    body.some(s => s.x === nx && s.y === ny) ||
    ctx.enemies.some(e => e !== enemy && e.x === nx && e.y === ny)
  if (blocked) return { ...enemy, dir: ALL_DIRS[rand(4)] }
  return { ...enemy, x: nx, y: ny, dir }
}

export const ENEMY_TYPES = {
  wanderer: {
    label: 'Errante',
    moveInterval: 3,
    move: (enemy, ctx) => moveAvoidant(enemy, ctx),
  },
  hunter: {
    label: 'Cazador',
    moveInterval: 3,
    move: (enemy, ctx) => moveAggressive(enemy, ctx, 0.7),
  },
  sprinter: {
    label: 'Veloz',
    moveInterval: 1,
    move: (enemy, ctx) => moveAvoidant(enemy, ctx),
  },
  phantom: {
    label: 'Fantasma',
    moveInterval: 3,
    move: (enemy, ctx) => {
      const next = moveAvoidant(enemy, ctx)
      const intangible = (ctx.tick % 40) < 12
      return { ...next, intangible }
    },
  },
  swarm: {
    label: 'Enjambre',
    moveInterval: 2,
    spawnCount: 3,
    move: (enemy, ctx) => moveAggressive(enemy, ctx, 0.45),
  },
}

export function spawnEnemyOfType(type, snake, enemies, cols, rows) {
  let pos, tries = 0
  do {
    pos = { x: rand(cols), y: rand(rows) }
    tries++
  } while (
    tries < 50 && (
      snake.some(s => s.x === pos.x && s.y === pos.y) ||
      enemies.some(e => e.x === pos.x && e.y === pos.y) ||
      Math.abs(pos.x - snake[0].x) + Math.abs(pos.y - snake[0].y) < 5
    )
  )
  return { ...pos, dir: ALL_DIRS[rand(4)], type, intangible: false }
}
