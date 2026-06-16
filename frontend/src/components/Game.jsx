import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './Game.module.css'
import ScoreBoard from './ScoreBoard'
import PerkModal from './PerkModal'
import VirtualJoystick, { clampToRadius, getDirectionFromDelta } from './VirtualJoystick'
import { getStage, getStageIndex } from '../game/stages'
import { ENEMY_TYPES, spawnEnemyOfType } from '../game/enemies'
import { POWERUP_TYPES, pickRandomPowerupType, stepToward, GEM_BONUS_SCORE } from '../game/powerups'
import { pickRandomPerks } from '../game/perks'

const CELL = 18, COLS = 20, ROWS = 20
const W = COLS * CELL, H = ROWS * CELL
const MAX_ENEMIES_CAP = 12
const PICKUP_LIFETIME = 8000
const BEST_KEY = 'snake_best'

function rand(n) { return Math.floor(Math.random() * n) }

function randomFreeCell(blocked) {
  let pos
  do { pos = { x: rand(COLS), y: rand(ROWS) } }
  while (blocked.some(p => p.x === pos.x && p.y === pos.y))
  return pos
}

function placeFood(snake, enemies, pickup) {
  const blocked = pickup ? [...snake, ...enemies, pickup] : [...snake, ...enemies]
  return randomFreeCell(blocked)
}

function spawnPickup(snake, enemies, food) {
  const pos = randomFreeCell([...snake, ...enemies, food])
  return { ...pos, type: pickRandomPowerupType(), expiresAt: Date.now() + PICKUP_LIFETIME }
}

function queueDirection(s, d) {
  const last = s.queue.length ? s.queue[s.queue.length - 1] : s.dir
  if (d.x === last.x && d.y === last.y) return
  if (d.x === -last.x && d.y === -last.y) return
  const bufferSize = s.run.inputBufferSize || 1
  if (s.queue.length >= bufferSize) return
  s.queue.push(d)
}

function addOrRefreshEffect(s, typeKey) {
  const def = POWERUP_TYPES[typeKey]
  const now = Date.now()
  const existing = s.activeEffects.find(e => e.type === typeKey)
  if (existing) existing.expiresAt = now + def.duration
  else s.activeEffects.push({ id: `${typeKey}-${now}`, type: typeKey, icon: def.icon, label: def.label, color: def.color, duration: def.duration, expiresAt: now + def.duration })
}

function computeStepDuration(s) {
  const stage = getStage(s.score)
  let dur = stage.speedMs + (s.run.speedModMs || 0)
  if (s.activeEffects.some(e => e.type === 'speed')) dur *= 0.6
  return Math.max(60, Math.round(dur))
}

function buildHud(s) {
  const stage = getStage(s.score)
  return {
    score: s.score,
    best: s.best,
    stage: { name: stage.name, icon: stage.icon, accent: stage.theme.accent, index: stage.index },
    shield: s.shield,
    streak: s.run.streak || 0,
    activeEffects: s.activeEffects.map(e => ({ ...e })),
    stageFlashKey: s.stageFlashKey || 0,
  }
}

function freshRun() {
  return {
    inputBufferSize: 1, growthEvery: 1, growthCounter: 0,
    scoreMultiplier: 1, speedModMs: 0, enemySlowFactor: 1,
    pickupChanceBonus: 0, thickSkin: false, streak: 0,
  }
}

export default function Game({ onGameOver }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const touchRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const tickRef = useRef(0)

  const [hud, setHud] = useState(() => buildHud({ score: 0, best: 0, run: freshRun(), activeEffects: [], shield: false, stageFlashKey: 0 }))
  const [perkModalData, setPerkModalData] = useState(null)
  const [joystick, setJoystick] = useState(null)

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
    if (!s) return
    const t = getStage(s.score).theme
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

    const frac = s.paused || s.awaitingPerk ? 1 : Math.min(1, (now - s.lastStepTime) / s.stepDuration)
    const interpHead = {
      x: s.prevHead.x + (s.snake[0].x - s.prevHead.x) * frac,
      y: s.prevHead.y + (s.snake[0].y - s.prevHead.y) * frac,
    }

    s.snake.forEach((seg, i) => {
      const ratio = i / s.snake.length
      const px = i === 0 ? interpHead.x : seg.x
      const py = i === 0 ? interpHead.y : seg.y
      const segColor = i === 0 ? t.snakeHead : ratio < 0.5 ? t.snakeBodyA : t.snakeBodyB
      ctx.fillStyle = segColor
      ctx.globalAlpha = Math.max(0.3, 1 - ratio * 0.6)
      ctx.shadowColor = segColor
      ctx.shadowBlur = i === 0 ? 14 : 7
      ctx.beginPath()
      ctx.roundRect(px * CELL + 1, py * CELL + 1, CELL - 2, CELL - 2, i === 0 ? 6 : 3)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1

      if (i === 0) {
        if (s.shield) {
          ctx.strokeStyle = '#bdfbff'
          ctx.shadowColor = '#bdfbff'
          ctx.shadowBlur = 10
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(px * CELL + CELL / 2, py * CELL + CELL / 2, CELL * 0.8, 0, Math.PI * 2)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
        const { dir } = s
        const hx = px * CELL + CELL / 2
        const hy = py * CELL + CELL / 2
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

    const pulse = 0.8 + Math.sin(now / 300) * 0.15
    const fr = (CELL / 2 - 2) * pulse
    ctx.fillStyle = t.food
    ctx.shadowColor = t.food
    ctx.shadowBlur = 16
    ctx.beginPath()
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, fr, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = t.foodStem
    ctx.fillRect(s.food.x * CELL + CELL / 2 - 1, s.food.y * CELL + 2, 2, 5)

    if (s.pickup) {
      const def = POWERUP_TYPES[s.pickup.type]
      const timeLeft = s.pickup.expiresAt - now
      const blink = timeLeft < 2000 ? (Math.sin(now / 100) > 0) : true
      if (blink) {
        ctx.globalAlpha = 0.92
        ctx.fillStyle = def.color
        ctx.shadowColor = def.color
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.roundRect(s.pickup.x * CELL + 1, s.pickup.y * CELL + 1, CELL - 2, CELL - 2, 5)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
        ctx.font = `${CELL - 6}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(def.icon, s.pickup.x * CELL + CELL / 2, s.pickup.y * CELL + CELL / 2 + 1)
      }
    }

    const frozen = s.activeEffects.some(e => e.type === 'freeze')
    s.enemies.forEach(en => {
      const ep = 0.85 + Math.sin(now / 400 + en.x) * 0.12
      const er = (CELL / 2 - 1) * ep
      const enemyColor = frozen ? '#a0c4f0' : t.enemy
      ctx.globalAlpha = en.intangible ? 0.35 : 1
      ctx.fillStyle = enemyColor
      ctx.strokeStyle = t.enemyBorder
      ctx.lineWidth = 1.5
      ctx.shadowColor = enemyColor
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.roundRect(en.x * CELL + CELL / 2 - er, en.y * CELL + CELL / 2 - er, er * 2, er * 2, 4)
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.strokeStyle = t.enemyEye
      ctx.lineWidth = 1.5
      const ex = en.x * CELL + CELL / 2
      const ey = en.y * CELL + CELL / 2
      ;[[-4, -3], [1, -3]].forEach(([ox]) => {
        const px2 = ex + ox
        const py2 = ey - 1
        ctx.beginPath(); ctx.moveTo(px2 - 1.5, py2 - 1.5); ctx.lineTo(px2 + 1.5, py2 + 1.5); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(px2 + 1.5, py2 - 1.5); ctx.lineTo(px2 - 1.5, py2 + 1.5); ctx.stroke()
      })
      ctx.globalAlpha = 1
    })

    particlesRef.current = particlesRef.current.filter(p => p.life > 0)
    ctx.shadowColor = t.particle
    ctx.shadowBlur = 8
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life
      ctx.fillStyle = t.particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2)
      ctx.fill()
      p.x += p.vx; p.y += p.vy; p.life -= 0.06
    })
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  }, [])

  const gameOver = useCallback(() => {
    const s = stateRef.current
    clearInterval(s.loop)
    s.running = false
    cancelAnimationFrame(rafRef.current)
    if (s.score > s.best) {
      s.best = s.score
      localStorage.setItem(BEST_KEY, String(s.best))
    }
    draw()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const t = getStage(s.score).theme
    ctx.fillStyle = t.overlayBg
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = t.overlayText
    ctx.font = '600 24px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Game Over', W / 2, H / 2 - 18)
    ctx.font = '400 15px system-ui, sans-serif'
    ctx.fillStyle = t.overlayMuted
    ctx.fillText(`${s.score} puntos · Etapa ${s.stageIdx + 1}`, W / 2, H / 2 + 12)
    ctx.font = '400 13px system-ui, sans-serif'
    ctx.fillText('Pulsa Inicio o toca para repetir', W / 2, H / 2 + 36)
    setHud(buildHud(s))
    onGameOver({ score: s.score, level: s.stageIdx + 1 })
  }, [draw, onGameOver])

  const tryShield = useCallback((s) => {
    if (!s.shield) return false
    s.shield = false
    s.run.streak = 0
    spawnParticles(s.snake[0].x, s.snake[0].y)
    return true
  }, [])

  const step = useCallback(() => {
    const s = stateRef.current
    tickRef.current++
    const now = Date.now()

    const beforeEffects = s.activeEffects.length
    s.activeEffects = s.activeEffects.filter(e => e.expiresAt > now)
    let hudDirty = s.activeEffects.length !== beforeEffects

    if (s.pickup && now > s.pickup.expiresAt) s.pickup = null

    if (s.queue.length) s.dir = s.queue.shift()
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y }

    const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS
    const hitSelf = s.snake.some(seg => seg.x === head.x && seg.y === head.y)
    const hitEnemy = s.enemies.some(e => !e.intangible && e.x === head.x && e.y === head.y)

    if (hitWall || hitSelf) { gameOver(); return }
    if (hitEnemy) {
      if (tryShield(s)) { setHud(buildHud(s)); return }
      gameOver(); return
    }

    s.prevHead = { ...s.snake[0] }
    s.lastStepTime = now
    s.snake.unshift(head)

    const ateFood = head.x === s.food.x && head.y === s.food.y
    const atePickup = !ateFood && s.pickup && head.x === s.pickup.x && head.y === s.pickup.y

    if (ateFood) {
      let gain = s.activeEffects.some(e => e.type === 'multiplier') ? 2 : 1
      gain = Math.round(gain * (s.run.scoreMultiplier || 1))
      s.score += gain
      s.run.streak = (s.run.streak || 0) + 1
      spawnParticles(head.x, head.y)

      s.run.growthCounter = (s.run.growthCounter || 0) + 1
      const every = s.run.growthEvery || 1
      const grow = s.run.growthCounter % every === 0
      if (!grow) s.snake.pop()

      s.food = placeFood(s.snake, s.enemies, s.pickup)

      if (!s.pickup) {
        const chance = 0.35 + (s.run.pickupChanceBonus || 0)
        if (Math.random() < chance) s.pickup = spawnPickup(s.snake, s.enemies, s.food)
      }

      hudDirty = true

      const newStageIdx = getStageIndex(s.score)
      if (newStageIdx !== s.stageIdx) {
        s.stageIdx = newStageIdx
        const stageData = getStage(s.score)
        if (!s.unlockedTypes.includes(stageData.enemyType)) s.unlockedTypes.push(stageData.enemyType)
        s.stageFlashKey = (s.stageFlashKey || 0) + 1
        if (s.run.thickSkin) s.shield = true
        const spawnCount = ENEMY_TYPES[stageData.enemyType].spawnCount || 1
        for (let i = 0; i < spawnCount; i++) {
          if (s.enemies.length < MAX_ENEMIES_CAP) s.enemies.push(spawnEnemyOfType(stageData.enemyType, s.snake, s.enemies, COLS, ROWS))
        }
        clearInterval(s.loop)
        s.awaitingPerk = true
        setPerkModalData({ stage: stageData, perks: pickRandomPerks(3) })
        setHud(buildHud(s))
        return
      }

      const targetEnemies = Math.min(MAX_ENEMIES_CAP, 2 + Math.floor(s.score / 4))
      while (s.enemies.length < targetEnemies) {
        const type = s.unlockedTypes[rand(s.unlockedTypes.length)]
        s.enemies.push(spawnEnemyOfType(type, s.snake, s.enemies, COLS, ROWS))
      }

      const dur = computeStepDuration(s)
      s.stepDuration = dur
      clearInterval(s.loop)
      s.loop = setInterval(step, dur)
    } else {
      s.snake.pop()
    }

    if (atePickup) {
      const def = POWERUP_TYPES[s.pickup.type]
      spawnParticles(s.pickup.x, s.pickup.y)
      if (def.kind === 'instant') s.score += GEM_BONUS_SCORE
      else if (def.kind === 'shield') s.shield = true
      else addOrRefreshEffect(s, s.pickup.type)
      s.pickup = null
      hudDirty = true
    }

    if (s.activeEffects.some(e => e.type === 'magnet')) {
      s.food = stepToward(s.food, s.snake[0])
      if (s.pickup) s.pickup = { ...s.pickup, ...stepToward(s.pickup, s.snake[0]) }
    }

    if (!s.activeEffects.some(e => e.type === 'freeze')) {
      const ctx = { snake: s.snake, enemies: s.enemies, cols: COLS, rows: ROWS, tick: tickRef.current }
      s.enemies = s.enemies.map(en => {
        const def = ENEMY_TYPES[en.type]
        const effInterval = Math.max(1, Math.round(def.moveInterval * (s.run.enemySlowFactor || 1)))
        if (tickRef.current % effInterval !== 0) return en
        return def.move(en, ctx)
      })
      if (s.enemies.some(e => !e.intangible && e.x === s.snake[0].x && e.y === s.snake[0].y)) {
        if (tryShield(s)) hudDirty = true
        else { gameOver(); return }
      }
    }

    if (hudDirty) setHud(buildHud(s))
  }, [gameOver, tryShield])

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
    const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
    Object.assign(s, {
      snake: initialSnake,
      prevHead: { ...initialSnake[0] },
      dir: { x: 1, y: 0 }, queue: [],
      enemies: [], score: 0, run: freshRun(),
      activeEffects: [], pickup: null, shield: false,
      stageIdx: 0, unlockedTypes: [getStage(0).enemyType],
      stageFlashKey: (s.stageFlashKey || 0) + 1,
      running: true, paused: false, awaitingPerk: false,
      lastStepTime: Date.now(), stepDuration: getStage(0).speedMs,
    })
    s.food = placeFood(s.snake, [], null)
    setPerkModalData(null)
    setJoystick(null)
    setHud(buildHud(s))
    rafRef.current = requestAnimationFrame(renderLoop)
    s.loop = setInterval(step, s.stepDuration)
  }, [renderLoop, step])

  const togglePause = useCallback(() => {
    const s = stateRef.current
    if (!s.running || s.awaitingPerk) return
    s.paused = !s.paused
    if (s.paused) {
      clearInterval(s.loop)
      cancelAnimationFrame(rafRef.current)
    } else {
      rafRef.current = requestAnimationFrame(renderLoop)
      s.loop = setInterval(step, s.stepDuration)
    }
  }, [renderLoop, step])

  const handlePerkPick = useCallback((perk) => {
    const s = stateRef.current
    perk.apply(s.run)
    setPerkModalData(null)
    s.awaitingPerk = false
    s.lastStepTime = Date.now()
    s.stepDuration = computeStepDuration(s)
    s.loop = setInterval(step, s.stepDuration)
    setHud(buildHud(s))
  }, [step])

  useEffect(() => {
    const best = Number(localStorage.getItem(BEST_KEY) || 0)
    const initialSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
    stateRef.current = {
      snake: initialSnake, prevHead: { ...initialSnake[0] },
      dir: { x: 1, y: 0 }, queue: [],
      food: { x: 15, y: 10 }, pickup: null, enemies: [],
      score: 0, best, run: freshRun(), activeEffects: [], shield: false,
      stageIdx: 0, unlockedTypes: [getStage(0).enemyType], stageFlashKey: 0,
      running: false, paused: false, awaitingPerk: false, loop: null,
      lastStepTime: Date.now(), stepDuration: getStage(0).speedMs,
    }
    setHud(buildHud(stateRef.current))
    draw()

    const DIRS = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
    }
    const onKey = (e) => {
      const s = stateRef.current
      if (e.code === 'Space') {
        e.preventDefault()
        if (s.awaitingPerk) return
        if (!s.running) start(); else togglePause()
        return
      }
      const d = DIRS[e.key]
      if (d) {
        queueDirection(s, d)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)

    const canvas = canvasRef.current
    const onTouchStart = (e) => {
      const rect = canvas.getBoundingClientRect()
      touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, moved: false }
      setJoystick({
        origin: { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top },
        knob: { dx: 0, dy: 0 },
      })
    }
    const onTouchMove = (e) => {
      if (!touchRef.current) return
      const dx = e.touches[0].clientX - touchRef.current.startX
      const dy = e.touches[0].clientY - touchRef.current.startY
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) touchRef.current.moved = true
      setJoystick(j => j ? { ...j, knob: clampToRadius(dx, dy) } : j)
      const d = getDirectionFromDelta(dx, dy)
      if (d) queueDirection(stateRef.current, d)
    }
    const onTouchEnd = () => {
      const wasMoved = touchRef.current?.moved
      setJoystick(null)
      touchRef.current = null
      if (!wasMoved) {
        const s = stateRef.current
        if (s.awaitingPerk) return
        if (!s.running) start(); else togglePause()
      }
    }
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      clearInterval(stateRef.current?.loop)
      cancelAnimationFrame(rafRef.current)
    }
  }, [draw, start, togglePause])

  const setDir = (key) => {
    const DIRS = { UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 }, LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 } }
    const d = DIRS[key]
    if (d) queueDirection(stateRef.current, d)
  }

  return (
    <div className={styles.wrap}>
      <ScoreBoard hud={hud} />
      <div className={styles.canvasBox}>
        <canvas ref={canvasRef} width={W} height={H} className={styles.canvas} />
        <VirtualJoystick origin={joystick?.origin} knob={joystick?.knob} />
        {perkModalData && <PerkModal {...perkModalData} onPick={handlePerkPick} />}
      </div>
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
