import type { AppModule } from '../_shared/app-types'

function updateStatus(text: string) {
  console.log(`[ui] ${text}`)
  const el = document.getElementById('status')
  if (el) el.textContent = text
}

async function boot() {
  const module = await import('../g2/index')
  const app: AppModule = module.app ?? module.default

  document.title = `${app.name} – Even G2`
  updateStatus(app.initialStatus ?? `${app.name} app ready`)

  const actions = await app.createActions(updateStatus)
  await actions.connect()

  // Reset button: re-send current screen to glasses
  const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement | null
  resetBtn?.addEventListener('click', async () => {
    const { resetApp } = await import('../g2/app')
    await resetApp()
    updateStatus('2048: reset sent to glasses')
  })
}

void boot().catch((error) => {
  console.error('[app-loader] boot failed', error)
  updateStatus('App boot failed')
})
