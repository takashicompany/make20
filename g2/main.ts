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

export function create2048Actions(setStatus: SetStatus): AppActions {
  let connected = false

  return {
    async connect() {
      setStatus('2048: connecting to Even bridge...')
      appendEventLog('2048: connect requested')

      try {
        const bridge = await withTimeout(waitForEvenAppBridge(), 6000)
        await initApp(bridge)
        connected = true
        setStatus('2048: connected')
        appendEventLog('2048: connected to bridge')
      } catch (err) {
        console.error('[2048] connect failed', err)
        setStatus('2048: bridge not found.')
        appendEventLog('2048: connection failed')
      }
    },

    async action() {
      if (!connected) {
        setStatus('2048: not connected')
        return
      }
    },
  }
}
