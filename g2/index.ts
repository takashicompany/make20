import { createMake20Actions } from './main'
import type { AppModule } from '../_shared/app-types'

export const app: AppModule = {
  id: 'make20',
  name: 'Make20',
  pageTitle: 'Make20',
  initialStatus: 'Make20 ready',
  createActions: createMake20Actions,
}

export default app
