import { Hono } from 'hono'
import type { Bindings, Variables } from '../lib/types'

const route = new Hono<{ Bindings: Bindings; Variables: Variables }>()

route.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default route
