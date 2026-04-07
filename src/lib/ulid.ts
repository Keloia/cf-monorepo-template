/**
 * ULID (Universally Unique Lexicographically Sortable Identifier) generator.
 * Uses crypto.getRandomValues() — available in Cloudflare Workers runtime.
 *
 * Format: TTTTTTTTTTRRRRRRRRRRRRRRRRR (26 chars)
 *   T = timestamp (10 chars, 48-bit, Crockford Base32)
 *   R = random    (16 chars, 80-bit, Crockford Base32)
 *
 * Monotonic: within the same millisecond, random part is incremented
 * to guarantee strict lexicographic ordering.
 */

/** Crockford's Base32 alphabet (no I, L, O, U to avoid ambiguity) */
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

// Module-level state for monotonic generation
let _lastMs = 0
const _lastRandom = new Uint8Array(10)

/**
 * Encode a 48-bit timestamp into 10 Crockford Base32 characters.
 */
function encodeTime(ms: number): string {
  const chars = new Array<string>(10)
  let t = ms
  for (let i = 9; i >= 0; i--) {
    chars[i] = ENCODING[t % 32]
    t = Math.floor(t / 32)
  }
  return chars.join('')
}

/**
 * Encode 10 random bytes (80 bits) into 16 Crockford Base32 characters.
 * Uses BigInt for clean 5-bit extraction without bit-twiddling errors.
 */
function encodeRandom(bytes: Uint8Array): string {
  let n = 0n
  for (const b of bytes) {
    n = (n << 8n) | BigInt(b)
  }
  const chars = new Array<string>(16)
  for (let i = 15; i >= 0; i--) {
    chars[i] = ENCODING[Number(n & 0x1fn)]
    n >>= 5n
  }
  return chars.join('')
}

/**
 * Increment a 10-byte big-endian counter (for monotonic generation).
 * Modifies the array in-place.
 */
function incrementBytes(bytes: Uint8Array): void {
  for (let i = bytes.length - 1; i >= 0; i--) {
    if (bytes[i] < 255) {
      bytes[i]++
      return
    }
    bytes[i] = 0
  }
  // All bytes were 255 (overflow) — crypto refresh prevents collision
  crypto.getRandomValues(bytes)
}

/**
 * Generate a monotonically increasing ULID string.
 * Safe for sequential calls within the same millisecond.
 *
 * When the system clock regresses (now < _lastMs), the encoded timestamp is
 * clamped to _lastMs so that lexicographic ordering is always preserved.
 */
export function ulid(): string {
  const now = Date.now()

  if (now > _lastMs) {
    _lastMs = now
    crypto.getRandomValues(_lastRandom)
  } else {
    // Same millisecond or clock regression — increment random part.
    // Always encode _lastMs (not the potentially regressed `now`) to
    // guarantee strict lexicographic monotonicity.
    incrementBytes(_lastRandom)
  }

  return encodeTime(_lastMs) + encodeRandom(_lastRandom)
}

/** Valid ULID characters regex for validation */
export const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/
