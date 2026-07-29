import { describe, expect, it } from 'vitest'
import { encodeShareCode, decodeShareCode } from './shareCode'

describe('shareCode', () => {
  it('round-trips a payload through encode/decode', () => {
    const payload = {
      exportedAt: '2026-07-29T00:00:00.000Z',
      itemStatuses: [{ item_unique_name: '/Lotus/Test', owned: 1 }],
      missionStatuses: [{ node_unique_name: 'SolNode1', completed: 1 }]
    }

    const code = encodeShareCode(payload)
    const decoded = decodeShareCode(code)

    expect(decoded).toEqual(payload)
  })

  it('rejects garbage input', () => {
    expect(() => decodeShareCode('not-a-valid-code')).toThrow()
  })

  it('rejects a truncated/corrupted code', () => {
    const code = encodeShareCode({ exportedAt: 'x', itemStatuses: [], missionStatuses: [] })
    expect(() => decodeShareCode(code.slice(0, -5))).toThrow()
  })
})
