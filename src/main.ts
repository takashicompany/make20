import type { AppModule } from '../_shared/app-types'

async function updateScoreDisplay() {
  const { state } = await import('../g2/state')
  const scoreEl = document.getElementById('score')
  const highEl = document.getElementById('high-score')
  const maxEl = document.getElementById('max-tile')
  if (scoreEl) scoreEl.textContent = String(state.score)
  if (highEl) highEl.textContent = String(state.highScore)
  if (maxEl) maxEl.textContent = state.maxTile > 0 ? String(state.maxTile) : '-'
}

async function boot() {
  const module = await import('../g2/index')
  const app: AppModule = module.app ?? module.default

  document.title = `${app.name} – Even G2`

  const actions = await app.createActions(() => {})
  await actions.connect()

  // Update score display periodically
  await updateScoreDisplay()
  setInterval(() => void updateScoreDisplay(), 500)

  // New Game button
  const newGameBtn = document.getElementById('newGameBtn') as HTMLButtonElement | null
  newGameBtn?.addEventListener('click', async () => {
    const { resetApp } = await import('../g2/app')
    await resetApp()
    await updateScoreDisplay()
  })

  // Resend to glasses button
  const resendBtn = document.getElementById('resendBtn') as HTMLButtonElement | null
  resendBtn?.addEventListener('click', async () => {
    const { resendApp } = await import('../g2/app')
    await resendApp()
  })

  // Force Game Over button (development only)
  const forceGameOverBtn = document.getElementById('forceGameOverBtn') as HTMLButtonElement | null
  forceGameOverBtn?.addEventListener('click', async () => {
    const { forceGameOverApp } = await import('../g2/app')
    await forceGameOverApp()
  })

  // Reset Data button (development only)
  const resetDataBtn = document.getElementById('resetDataBtn') as HTMLButtonElement | null
  resetDataBtn?.addEventListener('click', async () => {
    const { resetDataApp } = await import('../g2/app')
    await resetDataApp()
    await updateScoreDisplay()
  })
}

void boot().catch((error) => {
  console.error('[app-loader] boot failed', error)
})
