import { useState, useEffect } from 'react'
import { Route } from 'lucide-react'
import Game from './components/Game'
import Leaderboard from './components/Leaderboard'
import ScoreForm from './components/ScoreForm'
import styles from './App.module.css'

export default function App() {
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [lastGame, setLastGame] = useState(null)
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const handleScoreSubmitted = () => {
    setLastGame(null)
    setLeaderboardKey(k => k + 1)
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.logoIcon}><Route size={24} strokeWidth={2.4} /></span>
          <span className={styles.logoText}>
            <span className={styles.logoStrong}>Snake</span>
            <span className={styles.logoLight}>Process</span>
          </span>
        </h1>
        <button
          className={styles.themeBtn}
          onClick={() => setDarkMode(d => !d)}
          aria-label="Cambiar tema"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <div className={styles.layout}>
        <section className={styles.gameSection}>
          <p className={styles.hint}>
            Flechas/WASD · <kbd>Space</kbd> para iniciar/pausar · joystick táctil en móvil
          </p>
          <Game onGameOver={setLastGame} />
          {lastGame && (
            <ScoreForm
              score={lastGame.score}
              level={lastGame.level}
              onSubmitted={handleScoreSubmitted}
            />
          )}
        </section>
        <aside className={styles.sidebar}>
          <Leaderboard refresh={leaderboardKey} />
        </aside>
      </div>
    </main>
  )
}
