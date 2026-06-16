import { useEffect, useRef } from 'react'
import { drawSprite } from '../game/sprites'

export default function PixelIcon({ name, size = 28, className }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const loop = () => {
      ctx.clearRect(0, 0, size, size)
      drawSprite(ctx, name, size / 2, size / 2, size, Date.now())
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [name, size])

  return <canvas ref={canvasRef} width={size} height={size} className={className} />
}
