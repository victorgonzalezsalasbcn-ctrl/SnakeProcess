import { useEffect, useRef, useCallback } from 'react'
import styles from './Game.module.css'

const CELL = 18, COLS = 20, ROWS = 20
const W = COLS * CELL, H = ROWS * CELL
const MAX_ENEMIES = 5

const LIGHT = {
  bg: '#f2faf5', grid: 'rgba(0,0,0,0.04)',
  snakeHead: '#5aab7e', snakeBodyA: '#7dc49a', snakeBodyB: '#a8d8be',
  food: '#f4a0a0', foodStem: '#8abe78',
  enemy: '#f4b890', enemyBorder: '#e87a5a', enemyEye: '#3a1a0a',
  particle: '#f4d0a0',
  overlayBg: 'rgba(242,250,245,0.92)', overlayText: '#1a3328', overlayMuted: '#6b9e80',
}
const DARK = {
  bg: '#0f1f17', grid: 'rgba(255,255,255,0.04)',
  snakeHead: '#5aab7e', snakeBodyA: '#3d8a5f', snakeBodyB: '#2a6444',
  food: '#e87a8a', foodStem: '#6aaa66',
  enemy: '#e8906a', enemyBorder: '#c45a3a', enemyEye: '#fff',
  particle: '#f4c880',
  overlayBg: 'rgba(10,20,15,0.93)', overlayText: '#d4f0e0', overlayMuted: '#6aaa88',
}

function rand(n) { return Math.floor(Math.random() * n) }

function placeFood(snake, enemies) {
  let pos
  do { pos = { x: rand(COLS), y: rand(ROWS) } }
  while (
    snake.some(s => s.x === pos.x && s.y === pos.y) ||
    enemies.some(e => e.x === pos.x && e.y === pos.y)
  )
  return pos
}

function spawnEnemy(snake, enemies) {
  let pos, tries = 0
  do {
    pos = { x: rand(COLS), y: rand(ROWS) }
    tries++
  } while (
    tries < 50 && (
      snake.some(s => s.x === pos.x && s.y === pos.y) ||
      enemies.some(e => e.x === pos.x && e.y === pos.y) ||
      Math.abs(pos.x - snake[0].x) + Math.abs(pos.y - snake[0].y) < 5
    )
  )
  const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
  return { ...pos, dir: dirs[rand(4)] }
}

function moveEnemy(enemy, snake, enemies) {
  let { x, y, dir } = enemy
  const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]

  if (Math.random() < 0.25) dir = dirs[rand(4)]

  let nx = x + dir.x, ny = y + dir.y

  if (nx < 0 || nx >= COLS) { dir = { x: -dir.x, y: dir.y }; nx = x + dir.x }
  if (ny < 0 || ny >= ROWS) { dir = { x: dir.x, y: -dir.y }; ny = y + dir.y }

  const blocked =
    snake.some(s => s.x === nx && s.y === ny) ||
    enemies.some(e => e !== enemy && e.x === nx && e.y === ny)

  if (blocked) return { ...enemy, dir: dirs[rand(4)] }
  return { x: nx, y: ny, dir }
}

export default function Game({ onGameOver, darkMode }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const darkRef = useRef(darkMode)
  const touchRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const tickRef = useRef(0)

  useEffect(() => { darkRef.current = darkMode }, [darkMode])

  const c = () => darkRef.current ? DARK : LIGHT

  const spawnParticles = (x, y) => {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      particlesRef.current.push({
        x: x * CELL + CELL / 2, y: y * CELL + CELL / 2,
        vx: Math.cos(angle) * (1 + Math.random() * 2),
        vy: Math.sin(angle) * (1 + Math.random() * 2),
        life: 1,
      })
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const s = stateRef.current
    const t = c()
    const now = Date.now()

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = t.bg
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = t.grid
    ctx.lineWidth = 0.5
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke()
    }
    for (let j = 0; j <= ROWS; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(W, j * CELL); ctx.stroke()
    }

    s.snake.forEach((seg, i) => {
      const ratio = i / s.snake.length
      ctx.fillStyle = i === 0 ? t.snakeHead
        : ratio < 0.5 ? t.snakeBodyA : t.snakeBodyB
      ctx.globalAlpha = Math.max(0.3, 1 - ratio * 0.6)
      ctx.beginPath()
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, i === 0 ? 6 : 3)
      ctx.fill()
      ctx.globalAlpha = 1

      if (i === 0) {
        const { dir } = s
        const hx = seg.x * CELL + CELL / 2
        const hy = seg.y * CELL + CELL / 2
        const eyeOff = dir.y === 0
          ? [{ dx: 0, dy: -2.5 }, { dx: 0, dy: 2.5 }]
          : [{ dx: -2.5, dy: 0 }, { dx: 2.5, dy: 0 }]
        ctx.fillStyle = '#fff'
        eyeOff.forEach(e => {
          ctx.beginPath()
          ctx.arc(hx + dir.x * 3 + e.dx, hy + dir.y * 3 + e.dy, 2, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.fillStyle = '#222'
        eyeOff.forEach(e => {
          ctx.beginPath()
          ctx.arc(hx + dir.x * 3.5 + e.dx * 0.6, hy + dir.y * 3.5 + e.dy * 0.6, 1, 0, Math.PI * 2)
          ctx.fill()
        })
      }
    })

    // Food with pulse
    const pulse = 0.8 + Math.sin(now / 300) * 0.15
    const fr = (CELL / 2 - 2) * pulse
    ctx.fillStyle = t.food
    ctx.beginPath()
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, fr, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = t.foodStem
    ctx.fillRect(s.food.x * CELL + CELL / 2 - 1, s.food.y * CELL + 2, 2, 5)

    // Enemies
    s.enemies.forEach(e => {
      const ep = 0.85 + Math.sin(now / 400 + e.x) * 0.12
      const er = (CELL / 2 - 1) * ep
      ctx.fillStyle = t.enemy
      ctx.strokeStyle = t.enemyBorder
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(e.x * CELL + CELL / 2 - er, e.y * CELL + CELL / 2 - er, er * 2, er * 2, 4)
      ctx.fill()
      ctx.stroke()
      // X eyes
      ctx.strokeStyle = t.enemyEye
      ctx.lineWidth = 1.5
      const ex = e.x * CELL + CELL / 2
      const ey = e.y * CELL + CELL / 2
      ;[[-4, -3], [1, -3]].forEach(([ox]) => {
        const px = ex + ox
        const py = ey - 1
        ctx.beginPath(); ctx.moveTo(px - 1.5, py - 1.5); ctx.lineTo(px + 1.5, py + 1.5); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(px + 1.5, py - 1.5); ctx.lineTo(px - 1.5, py + 1.5); ctx.stroke()
      })
    })

    // Particles
    particlesRef.current = particlesRef.current.filter(p => p.life > 0)
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life
      ctx.fillStyle = t.particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2)
      ctx.fill()
      p.x += p.vx; p.y += p.vy; p.life -= 0.06
    })
    ctx.globalAlpha = 1
  }, [])

  const gameOver = useCallback(() => {
    const s = stateRef.current
    clearInterval(s.loop)
    s.running = false
    cancelAnimationFrame(rafRef.current)
    draw()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const t = c()
    ctx.fillStyle = t.overlayBg
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = t.overlayText
    ctx.font = '600 24px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Game Over', W / 2, H / 2 - 18)
    ctx.font = '400 15px system-ui, sans-serif'
    ctx.fillStyle = t.overlayMuted
    ctx.fillText(`${s.score} puntos · Nivel ${s.level}`, W / 2, H / 2 + 12)
    ctx.font = '400 13px system-ui, sans-serif'
    ctx.fillText('Pulsa Inicio o toca para repetir', W / 2, H / 2 + 36)
    onGameOver({ score: s.score, level: s.level })
  }, [draw, onGameOver])

  const step = useCallback(() => {
    const s = stateRef.current
    tickRef.current++

    s.dir = { ...s.nextDir }
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y }

    if (
      head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
      s.snake.some(seg => seg.x === head.x && seg.y === head.y) ||
      s.enemies.some(e => e.x === head.x && e.y === head.y)
    ) {
      gameOver()
      return
    }

    s.snake.unshift(head)
    const ateFood = head.x === s.food.x && head.y === s.food.y
    if (ateFood) {
      s.score++
      s.level = Math.floor(s.score / 5) + 1
      spawnParticles(head.x, head.y)
      s.food = placeFood(s.snake, s.enemies)

      const targetEnemies = Math.min(MAX_ENEMIES, Math.floor(s.score / 3))
      while (s.enemies.length < targetEnemies) {
        s.enemies.push(spawnEnemy(s.snake, s.enemies))
      }

      clearInterval(s.loop)
      s.loop = setInterval(step, Math.max(80, 220 - s.level * 18))
    } else {
      s.snake.pop()
    }

    if (tickRef.current % 3 === 0) {
      s.enemies = s.enemies.map(e => moveEnemy(e, s.snake, s.enemies))
      // check if an enemy walked into snake head after moving
      if (s.enemies.some(e => e.x === s.snake[0].x && e.y === s.snake[0].y)) {
        gameOver()
        return
      }
    }
  }, [draw, gameOver])

  const renderLoop = useCallback(() => {
    draw()
    rafRef.current = requestAnimationFrame(renderLoop)
  }, [draw])

  const start = useCallback(() => {
    const s = stateRef.current
    clearInterval(s.loop)
    cancelAnimationFrame(rafRef.current)
    tickRef.current = 0
    particlesRef.current = []
    Object.assign(s, {
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
      enemies: [], score: 0, level: 1, running: true, paused: false,
    })
    s.food = placeFood(s.snake, [])
    rafRef.current = requestAnimationFrame(renderLoop)
    s.loop = setInterval(step, 220)
  }, [renderLoop, step])

  const togglePause = useCallback(() => {
    const s = stateRef.current
    if (!s.running) return
    s.paused = !s.paused
    if (s.paused) {
      clearInterval(s.loop)
      cancelAnimationFrame(rafRef.current)
    } else {
      rafRef.current = requestAnimationFrame(renderLoop)
      s.loop = setInterval(step, Math.max(80, 220 - s.level * 18))
    }
  }, [renderLoop, step])

  useEffect(() => {
    stateRef.current = {
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
      food: { x: 15, y: 10 }, enemies: [],
      score: 0, level: 1, running: false, paused: false, loop: null,
    }
    draw()

    const DIRS = {
      ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1},
      ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0},
    }
    const onKey = (e) => {
      const s = stateRef.current
      if (e.code === 'Space') {
        e.preventDefault()
        if (!s.running) start(); else togglePause()
        return
      }
      const d = DIRS[e.key]
      if (d && !(d.x === -s.dir.x && d.y === -s.dir.y)) {
        s.nextDir = d
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)

    const canvas = canvasRef.current
    const onTouchStart = (e) => {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd = (e) => {
      if (!touchRef.current) return
      const dx = e.changedTouches[0].clientX - touchRef.current.x
      const dy = e.changedTouches[0].clientY - touchRef.current.y
      const s = stateRef.current

      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        if (!s.running) start(); else togglePause()
        return
      }

      let d
      if (Math.abs(dx) > Math.abs(dy)) d = dx > 0 ? {x:1,y:0} : {x:-1,y:0}
      else d = dy > 0 ? {x:0,y:1} : {x:0,y:-1}

      if (!(d.x === -s.dir.x && d.y === -s.dir.y)) s.nextDir = d
    }
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
      clearInterval(stateRef.current?.loop)
      cancelAnimationFrame(rafRef.current)
    }
  }, [draw, start, togglePause])

  const setDir = (key) => {
    const DIRS = { UP:{x:0,y:-1}, DOWN:{x:0,y:1}, LEFT:{x:-1,y:0}, RIGHT:{x:1,y:0} }
    const s = stateRef.current
    const d = DIRS[key]
    if (d && !(d.x === -s.dir.x && d.y === -s.dir.y)) s.nextDir = d
  }

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className={styles.canvas}
      />
      <div className={styles.controls}>
        <button onClick={start} className={styles.btn}>Inicio</button>
        <button onClick={togglePause} className={styles.btn}>Pausa</button>
      </div>
      <div className={styles.dpad}>
        <button className={styles.btn} onClick={() => setDir('UP')}>▲</button>
        <div className={styles.dpadRow}>
          <button className={styles.btn} onClick={() => setDir('LEFT')}>◀</button>
          <button className={styles.btn} onClick={() => setDir('DOWN')}>▼</button>
          <button className={styles.btn} onClick={() => setDir('RIGHT')}>▶</button>
        </div>
      </div>
    </div>
  )
}
