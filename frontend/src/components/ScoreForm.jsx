import { useState } from 'react'
import { saveScore } from '../api/scores'
import styles from './ScoreForm.module.css'

export default function ScoreForm({ score, level, onSubmitted }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim().length < 2) return
    saveScore({ playerName: name.trim(), score, level })
    onSubmitted()
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.result}>
        Partida terminada — <strong>{score} puntos</strong> · Nivel {level}
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Tu nombre (2-20 caracteres)"
          value={name}
          onChange={e => setName(e.target.value)}
          minLength={2}
          maxLength={20}
          required
          autoFocus
          className={styles.input}
        />
        <button type="submit" className={styles.btn}>
          Guardar
        </button>
      </form>
    </div>
  )
}
