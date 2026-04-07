import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'

describe('GET /', () => {
  it('returns 200 with service identity', async () => {
    const response = await SELF.fetch('http://localhost/')
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ service: 'cf-worker', status: 'ok' })
  })
})
