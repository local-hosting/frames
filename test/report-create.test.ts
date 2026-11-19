import { describe, expect, it } from 'vitest'
import {
  bytesToHex,
  decodeReportCreate,
  encodeReportCreate,
  reportCreateHeader,
  reportHeaderType,
} from '../src/index.js'

describe('report-create pack', () => {
  it('roundtrips fixed 13-byte layout', () => {
    const encoded = encodeReportCreate({
      header: reportCreateHeader(0),
      length: 10,
      location: 0x140296,
      timestamp: 0x60c14763,
      random: 0x2d,
      offer: 0,
      subject: 0xd,
    })
    expect(bytesToHex(encoded).toUpperCase()).toBe(
      'B00A9602146347C1602D000D00',
    )
    expect(encoded.length).toBe(13)

    const decoded = decodeReportCreate(encoded)!
    expect(reportHeaderType(decoded.header)).toBe(3)
    expect(decoded.header.isReport).toBe(true)
    expect(decoded.location).toBe(0x140296)
    expect(decoded.subject).toBe(0xd)
  })
})
