/**
 * KV-backed feature flag system for keloya-auth.
 *
 * Flags are stored in Cloudflare KV under the prefix `flag:`.
 * Each flag value is a JSON object: { enabled: boolean, description?: string }
 *
 * This enables agents to ship changes behind toggles, reducing the
 * risk of agent-authored code affecting all users immediately.
 *
 * Management: flags are set/deleted via the admin API or wrangler CLI:
 *   wrangler kv key put --binding KV "flag:my-feature" '{"enabled":true}'
 */

const FLAG_PREFIX = 'flag:'

type FlagValue = {
  enabled: boolean
  description?: string
  /** Percentage of users who see this feature (0-100). Only applies when enabled=true. */
  rolloutPercentage?: number
  /** ISO timestamp when the flag was created or last updated. */
  updatedAt?: string
}

/**
 * Check if a feature flag is enabled for a given user.
 *
 * When rolloutPercentage is set (0-100), the flag is enabled only for
 * a deterministic subset of users based on a hash of the userId.
 * This allows progressive rollout: start at 10%, increase to 50%, then 100%.
 *
 * Returns false for missing or malformed flags (fail-closed).
 */
export async function isFeatureEnabled(
  kv: KVNamespace,
  flagName: string,
  userId?: string,
): Promise<boolean> {
  const raw = await kv.get(`${FLAG_PREFIX}${flagName}`)
  if (!raw) return false

  try {
    const flag = JSON.parse(raw) as FlagValue
    if (flag.enabled !== true) return false

    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100 && userId) {
      const bucket = hashToPercentage(userId, flagName)
      return bucket < flag.rolloutPercentage
    }

    return true
  } catch {
    return false
  }
}

/**
 * Deterministic hash of userId+flagName to a 0-99 bucket.
 * Uses DJB2 hash for simplicity and consistency across requests.
 */
function hashToPercentage(userId: string, flagName: string): number {
  const input = `${userId}:${flagName}`
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return Math.abs(hash) % 100
}

/**
 * Get all feature flags with their current state.
 * Lists all KV keys with the flag: prefix.
 */
export async function listFeatureFlags(kv: KVNamespace): Promise<
  Array<{
    name: string
    enabled: boolean
    description?: string
    rolloutPercentage?: number
    updatedAt?: string
  }>
> {
  const list = await kv.list({ prefix: FLAG_PREFIX })
  const flags: Array<{
    name: string
    enabled: boolean
    description?: string
    rolloutPercentage?: number
    updatedAt?: string
  }> = []

  for (const key of list.keys) {
    const raw = await kv.get(key.name)
    if (!raw) continue

    try {
      const flag = JSON.parse(raw) as FlagValue
      flags.push({
        name: key.name.slice(FLAG_PREFIX.length),
        enabled: flag.enabled === true,
        description: flag.description,
        rolloutPercentage: flag.rolloutPercentage,
        updatedAt: flag.updatedAt,
      })
    } catch {
      // skip malformed entries
    }
  }

  return flags
}

/**
 * Set a feature flag value. Supports progressive rollout via rolloutPercentage.
 *
 * Example: setFeatureFlag(kv, 'new-ui', true, { description: 'New UI', rolloutPercentage: 10 })
 * This enables the flag for ~10% of users (deterministic per userId).
 */
export async function setFeatureFlag(
  kv: KVNamespace,
  flagName: string,
  enabled: boolean,
  options?: string | { description?: string; rolloutPercentage?: number },
): Promise<void> {
  const opts = typeof options === 'string' ? { description: options } : options
  const value: FlagValue = {
    enabled,
    updatedAt: new Date().toISOString(),
  }
  if (opts?.description) value.description = opts.description
  if (opts?.rolloutPercentage !== undefined) value.rolloutPercentage = opts.rolloutPercentage
  await kv.put(`${FLAG_PREFIX}${flagName}`, JSON.stringify(value))
}

/**
 * Delete a feature flag.
 */
export async function deleteFeatureFlag(kv: KVNamespace, flagName: string): Promise<void> {
  await kv.delete(`${FLAG_PREFIX}${flagName}`)
}
