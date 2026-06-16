import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './Game.module.css'
import ScoreBoard from './ScoreBoard'
import PerkModal from './PerkModal'
import VirtualJoystick, { clampToRadius, getDirectionFromDelta } from './VirtualJoystick'
import { getStage, getStageIndex, DIMENSION_THEME } from '../game/stages'
import { ENEMY_TYPES, spawnEnemyOfType } from '../game/enemies'
import { POWERUP_TYPES, pickRandomPowerupType, stepToward, GEM_BONUS_SCORE, PORTAL } from '../game/powerups'
import { pickRandomPerks } from '../game/perks'
import { drawSprite, ENEMY_SPRITES, POWERUP_SPRITES } from '../game/sprites'
import { buildTilePattern } from '../game/pixel'

const CELL = 18, COLS = 20, ROWS = 20
const W = COLS * CELL, H = ROWS * CELL
const MAX_ENEMIES_CAP = 12
const PICKUP_LIFETIME = 8000
const BEST_KEY = 'snake_best'

const DECOR_BY_STAGE = [
  { shape: 'leaf', count: 14, vy: [0.3, 0.8], vx: [-0.3, 0.3] },
  { shape: 'dust', count: 16, vy: [-0.05, 0.05], vx: [0.4, 0.9] },
  { shape: 'snow', count: 18, vy: [0.25, 0.6], vx: [-0.15, 0.15] },
  { shape: 'ember', count: 14, vy: [-0.6, -0.25], vx: [-0.15, 0.15] },
  { shape: 'star', count: 16, vy: [0, 0], vx: [0, 0] },
  { shape: 'confetti', count: 16, vy: [0.3, 0.7], vx: [-0.25, 0.25] },
]

function rand(n) { return Math.floor(Math.random() * n) }
function randRange([min, max]) { return min + Math.random() * (max - min) }

function spawnDecorParticle(stageIdx) {
  const def = DECOR_BY_STAGE[stageIdx % DECOR_BY_STAGE.length]
  return {
    shape: def.shape,
    x: Math.random() * W,
    y: Math.random() * H,
    vx: randRange(def.vx),
    vy: randRange(def.vy),
    size: 2 + Math.random() * 3,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.06,
    twinklePhase: Math.random() * Math.PI * 2,
  }
}

function paintGroundTile(ctx, size, bg, type, variant) {
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)
  const speck = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h) }
  switch (type) {
    case 'grass':
      speck(4, 6, 3, 3, variant === 0 ? '#173d27' : '#1a4a2e')
      speck(20, 14, 3, 3, variant === 0 ? '#1a4a2e' : '#173d27')
      speck(12, 24, 3, 3, variant === 0 ? '#173d27' : '#1a4a2e')
      speck(28, 28, 3, 3, '#163a24')
      break
    case 'sand':
      speck(6, 8, 4, 2, variant === 0 ? '#f0d090' : '#e0c080')
      speck(22, 20, 4, 2, variant === 0 ? '#e0c080' : '#f0d090')
      speck(14, 28, 3, 2, '#d8b878')
      break
    case 'ice':
      speck(8, 10, 2, 2, variant === 0 ? '#fff' : 'rgba(255,255,255,0.4)')
      speck(24, 22, 2, 2, variant === 1 ? '#fff' : 'rgba(255,255,255,0.4)')
      speck(16, 6, 6, 1, 'rgba(255,255,255,0.25)')
      break
    case 'rock':
      speck(10, 10, 3, 3, variant === 0 ? '#ff7a3a' : '#b8431a')
      speck(26, 24, 3, 3, variant === 1 ? '#ff7a3a' : '#b8431a')
      break
    case 'space':
      speck(6, 8, 2, 2, variant === 0 ? '#fff' : 'rgba(255,255,255,0.3)')
      speck(26, 6, 2, 2, variant === 1 ? '#fff' : 'rgba(255,255,255,0.3)')
      speck(16, 26, 2, 2, variant === 0 ? '#c79bff' : 'rgba(199,155,255,0.3)')
      break
    case 'confetti':
      speck(6, 6, 3, 3, variant === 0 ? '#ff5da0' : '#ffd23a')
      speck(24, 12, 3, 3, variant === 0 ? '#5dffb0' : '#8fe4ff')
      speck(12, 26, 3, 3, variant === 0 ? '#8fe4ff' : '#ff5da0')
      break
    default:
      break
  }
}

function drawDecor(ctx, particles, theme, now) {
  ctx.save()
  particles.forEach(p => {
    if (p.shape !== 'star') {
      p.x += p.vx
      p.y += p.vy
      p.angle += p.spin
      if (p.x < -5) p.x = W + 5
      if (p.x > W + 5) p.x = -5
      if (p.y < -5) p.y = H + 5
      if (p.y > H + 5) p.y = -5
    }

    if (p.shape === 'star') {
      const tw = 0.4 + Math.sin(now / 500 + p.twinklePhase) * 0.35
      ctx.globalAlpha = Math.max(0.1, tw)
      ctx.fillStyle = theme.particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2)
      ctx.fill()
    } else if (p.shape === 'leaf') {
      ctx.globalAlpha = 0.4
      ctx.fillStyle = theme.particle
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    } else if (p.shape === 'dust') {
      ctx.globalAlpha = 0.25
      ctx.fillStyle = theme.particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
    } else if (p.shape === 'snow') {
      ctx.globalAlpha = 0.5
      ctx.fillStyle = theme.particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
    } else if (p.shape === 'ember') {
      ctx.globalAlpha = 0.55
      ctx.fillStyle = theme.particle
      ctx.shadowColor = theme.particle
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    } else if (p.shape === 'confetti') {
      ctx.globalAlpha = 0.45
      ctx.fillStyle = theme.particle
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillRect(-p.size * 0.5, -p.size * 0.3, p.size, p.size * 0.6)
      ctx.restore()
    }
  })
  ctx.restore()
}

function spawnScenery(stageData) {
  const items = []
  stageData.scenery.forEach(({ icon, count }) => {
    for (let i = 0; i < count; i++) {
      let x, y, tries = 0
      do { x = rand(COLS); y = rand(ROWS); tries++ }
      while (tries < 20 && Math.abs(x - 10) < 3 && Math.abs(y - 10) < 3)
      items.push({ icon, x, y, scale: 1.4 + Math.random() * 0.6, phase: Math.random() * 4000 })
    }
  })
  return items
}

function drawScenery(ctx, items, now) {
  ctx.globalAlpha = 0.8
  items.forEach(it => {
    drawSprite(ctx, it.icon, it.x * CELL + CELL / 2, it.y * CELL + CELL / 2, CELL * it.scale, now + it.phase)
  })
  ctx.globalAlpha = 1
}

function getActiveTheme(s) {
  if (s.portalExpiresAt && s.portalExpiresAt > Date.now()) return DIMENSION_THEME
  return getStage(s.score).theme
}

function randomFreeCell(blocked) {
  let pos
  do { pos = { x: rand(COLS), y: rand(ROWS) } }
  while (blocked.some(p => p.x === pos.x && p.y === pos.y))
  return pos
}

function placeFood(snake, enemies, pickup, portal) {
  const blocked = [...snake, ...enemies]
  if (pickup) blocked.push(pickup)
  if (portal) blocked.push(portal)
  return randomFreeCell(blocked)
}

function spawnPickup(snake, enemies, food, portal) {
  const blocked = portal ? [...snake, ...enemies, food, portal] : [...snake, ...enemies, food]
  const pos = randomFreeCell(blocked)
  return { ...pos, type: pickRandomPowerupType(), expiresAt: Date.now() + PICKUP_LIFETIME }
}

function spawnPortal(snake, enemies, food, pickup) {
  const blocked = pickup ? [...snake, ...enemies, food, pickup] : [...snake, ...enemies, food]
  const pos = randomFreeCell(blocked)
  return { ...pos, expiresAt: Date.now() + PORTAL.lifetime }
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

function addEffectUntil(s, typeKey, expiresAt) {
  const def = POWERUP_TYPES[typeKey]
  const existing = s.activeEffects.find(e => e.type === typeKey)
  if (existing) existing.expiresAt = expiresAt
  else s.activeEffects.push({ id: `${typeKey}-${Date.now()}`, type: typeKey, icon: def.icon, label: def.label, color: def.color, duration: PORTAL.duration, expiresAt })
}

function computeStepDuration(s) {
  const stage = getStage(s.score)
  let dur = stage.speedMs + (s.run.speedModMs || 0)
  if (s.activeEffects.some(e => e.type === 'speed')) dur *= 0.6
  return Math.max(60, Math.round(dur))
}

function buildHud(s) {
  const stage = getStage(s.score)
  const inDimension = s.portalExpiresAt && s.portalExpiresAt > Date.now()
  const theme = inDimension ? DIMENSION_THEME : stage.theme
  return {
    score: s.score,
    best: s.best,
    stage: {
      name: inDimension ? DIMENSION_THEME.name : stage.name,
      icon: inDimension ? DIMENSION_THEME.icon : stage.icon,
      accent: theme.accent,
      index: stage.index,
    },
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
  const decorRef = useRef([])
  const decorStageRef = useRef(-1)
  const sceneryRef = useRef([])
  const sceneryStageRef = useRef(-1)
  const groundPatternsRef = useRef(null)
  const groundStageRef = useRef(-1)
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
    const inDimension = s.portalExpiresAt && s.portalExpiresAt > Date.now()
    const t = getActiveTheme(s)
    const now = Date.now()

    ctx.clearRect(0, 0, W, H)
    const stageIdx = getStageIndex(s.score)
    if (!inDimension) {
      const stageData = getStage(s.score)
      if (groundStageRef.current !== stageIdx || !groundPatternsRef.current) {
        groundStageRef.current = stageIdx
        const tileSize = CELL * 2
        groundPatternsRef.current = {
          a: buildTilePattern(ctx, tctx => paintGroundTile(tctx, tileSize, t.bg, stageData.groundTile, 0), tileSize),
          b: buildTilePattern(ctx, tctx => paintGroundTile(tctx, tileSize, t.bg, stageData.groundTile, 1), tileSize),
        }
      }
      const variant = Math.floor(now / 300) % 2
      ctx.fillStyle = variant === 0 ? groundPatternsRef.current.a : groundPatternsRef.current.b
    } else {
      ctx.fillStyle = t.bg
    }
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = t.grid
    ctx.lineWidth = 0.5
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke()
    }
    for (let j = 0; j <= ROWS; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(W, j * CELL); ctx.stroke()
    }

    if (!inDimension) {
      if (sceneryStageRef.current !== stageIdx) {
        sceneryStageRef.current = stageIdx
        sceneryRef.current = spawnScenery(getStage(s.score))
      }
      drawScenery(ctx, sceneryRef.current, now)

      if (decorStageRef.current !== stageIdx) {
        decorStageRef.current = stageIdx
        const def = DECOR_BY_STAGE[stageIdx % DECOR_BY_STAGE.length]
        decorRef.current = Array.from({ length: def.count }, () => spawnDecorParticle(stageIdx))
      }
      drawDecor(ctx, decorRef.current, t, now)
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
      const bx = px * CELL, by = py * CELL
      ctx.globalAlpha = Math.max(0.4, 1 - ratio * 0.5)
      ctx.shadowColor = segColor
      ctx.shadowBlur = i === 0 ? 14 : 7
      ctx.fillStyle = '#1a1325'
      ctx.fillRect(bx, by, CELL, CELL)
      ctx.shadowBlur = 0
      ctx.fillStyle = segColor
      ctx.fillRect(bx + 2, by + 2, CELL - 4, CELL - 4)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.fillRect(bx + 2, by + 2, CELL - 4, 2)
      ctx.globalAlpha = 1

      if (i === 0) {
        if (s.shield) {
          ctx.strokeStyle = '#bdfbff'
          ctx.shadowColor = '#bdfbff'
          ctx.shadowBlur = 10
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(bx + CELL / 2, by + CELL / 2, CELL * 0.8, 0, Math.PI * 2)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
        const { dir } = s
        const eyeOff = dir.y === 0
          ? [{ dx: 4, dy: -4 }, { dx: 4, dy: 2 }]
          : [{ dx: -4, dy: 4 }, { dx: 2, dy: 4 }]
        ctx.fillStyle = '#1a1325'
        eyeOff.forEach(e => {
          ctx.fillRect(bx + CELL / 2 + dir.x * 2 + e.dx - 1, by + CELL / 2 + dir.y * 2 + e.dy - 1, 2, 2)
        })
      }
    })

    if (s.activeEffects.length) {
      const badgeEffect = s.activeEffects[0]
      const bob = Math.sin(now / 280) * 2
      const bx = interpHead.x * CELL + CELL / 2
      const by = interpHead.y * CELL - CELL * 0.55 + bob
      const br = CELL * 0.42
      ctx.fillStyle = badgeEffect.color
      ctx.shadowColor = badgeEffect.color
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(bx, by, br, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      drawSprite(ctx, POWERUP_SPRITES[badgeEffect.type], bx, by, br * 1.4, now)
    }

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
        const icx = s.pickup.x * CELL + CELL / 2
        const icy = s.pickup.y * CELL + CELL / 2
        drawSprite(ctx, POWERUP_SPRITES[s.pickup.type], icx, icy, CELL * 0.8, now)
      }
    }

    if (s.portal) {
      const timeLeft = s.portal.expiresAt - now
      const blink = timeLeft < 3000 ? (Math.sin(now / 90) > 0) : true
      if (blink) {
        const pcx = s.portal.x * CELL + CELL / 2
        const pcy = s.portal.y * CELL + CELL / 2
        ctx.shadowColor = '#c79bff'
        ctx.shadowBlur = 18
        ctx.fillStyle = 'rgba(199,155,255,0.35)'
        ctx.beginPath()
        ctx.arc(pcx, pcy, CELL * 0.55, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        drawSprite(ctx, 'portal', pcx, pcy, CELL * 0.85, now)
      }
    }

    const frozen = s.activeEffects.some(e => e.type === 'freeze')
    s.enemies.forEach(en => {
      const ep = 0.85 + Math.sin(now / 400 + en.x) * 0.12
      const er = (CELL / 2 - 1) * ep
      const enemyColor = frozen ? '#a0c4f0' : t.enemy
      const baseAlpha = en.intangible ? 0.35 : 1
      const ex = en.x * CELL + CELL / 2
      const ey = en.y * CELL + CELL / 2

      ctx.globalAlpha = baseAlpha * 0.5
      ctx.fillStyle = enemyColor
      ctx.shadowColor = enemyColor
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(ex, ey, er, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.globalAlpha = baseAlpha
      drawSprite(ctx, ENEMY_SPRITES[en.type], ex, ey, CELL * 0.95, now + en.x * 137)
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
    const t = getActiveTheme(s)
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
    if (s.portal && now > s.portal.expiresAt) s.portal = null

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
    const atePortal = !ateFood && s.portal && head.x === s.portal.x && head.y === s.portal.y

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

      s.food = placeFood(s.snake, s.enemies, s.pickup, s.portal)

      if (!s.pickup) {
        const chance = 0.35 + (s.run.pickupChanceBonus || 0)
        if (Math.random() < chance) s.pickup = spawnPickup(s.snake, s.enemies, s.food, s.portal)
      }

      if (!s.portal && !(s.portalExpiresAt > now) && Math.random() < PORTAL.spawnChance) {
        s.portal = spawnPortal(s.snake, s.enemies, s.food, s.pickup)
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
      else if (def.kind === 'purge') s.enemies = []
      else addOrRefreshEffect(s, s.pickup.type)
      s.pickup = null
      hudDirty = true
    }

    if (atePortal) {
      spawnParticles(s.portal.x, s.portal.y)
      s.portalExpiresAt = now + PORTAL.duration
      addEffectUntil(s, 'multiplier', s.portalExpiresAt)
      addEffectUntil(s, 'speed', s.portalExpiresAt)
      s.portal = null
      s.stepDuration = computeStepDuration(s)
      clearInterval(s.loop)
      s.loop = setInterval(step, s.stepDuration)
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
      activeEffects: [], pickup: null, portal: null, portalExpiresAt: 0, shield: false,
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
      food: { x: 15, y: 10 }, pickup: null, portal: null, portalExpiresAt: 0, enemies: [],
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
