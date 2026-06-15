const KEY = 'snake_leaderboard'
const MAX = 10

export function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveScore({ playerName, score, level }) {
  const entries = getLeaderboard()
  const newEntry = {
    id: Date.now(),
    playerName: playerName.trim(),
    score,
    level,
    createdAt: new Date().toISOString(),
  }
  const updated = [...entries, newEntry]
    .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt))
    .slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(updated))
  return newEntry
}
