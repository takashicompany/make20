import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import type { AppActions, SetStatus } from '../_shared/app-types'
import { appendEventLog } from '../_shared/log'
import { initApp } from './app'

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`Even bridge not detected within ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((value) => resolve(value))
      .catch((error) => reject(error))
      .finally(() => window.clearTimeout(timer))
  })
}

export function createMake20Actions(setStatus: SetStatus): AppActions {
  let connected = false

  return {
    async connect() {
      setStatus('Make20: connecting to Even bridge...')
      appendEventLog('Make20: connect requested')

      try {
        const bridge = await withTimeout(waitForEvenAppBridge(), 6000)
        await initApp(bridge)
        connected = true
        setStatus('Make20: connected')
        appendEventLog('Make20: connected to bridge')
      } catch (err) {
        console.error('[Make20] connect failed', err)
        setStatus('Make20: bridge not found.')
        appendEventLog('Make20: connection failed')
      }
    },

    async action() {
      if (!connected) {
        setStatus('Make20: not connected')
        return
      }
    },
  }
}
