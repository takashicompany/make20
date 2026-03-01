import { create2048Actions } from './main'
import type { AppModule } from '../_shared/app-types'

export const app: AppModule = {
  id: '2048',
  name: '2048',
  pageTitle: '2048',
  initialStatus: '2048 ready',
  createActions: create2048Actions,
}

export default app
