import { readU32LE, writeU32LE } from '../bits.js'

/**
 * Packed need/offer report (13 bytes, little-endian).
 *
 * Header: bit0–3 agreeValue, bit4 type0, bit5 type1, bit6 isAgree, bit7 isReport.
 * Then length:8 | location:24 in one u32, timestamp u32, random u8,
 * offer byte (`0` = demand/need, `1` = offer), subject u16 (e.g. resource code).
 *
 * Illocution is report (`SYMBOL_REPORT`), not query (query = information only).
 */

export const REPORT_CREATE_SIZE = 13

export type ReportHeader = {
  agreeValue: number
  type0: number
  type1: number
  isAgree: boolean
  isReport: boolean
}

export type ReportCreate = {
  header: ReportHeader
  length: number
  /** Compact H3 residual (24-bit). */
  location: number
  timestamp: number
  random: number
  /** `0` = demand/need, `1` = offer (see REPORT_DEMAND / REPORT_OFFER). */
  offer: 0 | 1
  /** Subject code (typically a resource / place vocab code). */
  subject: number
}

export function encodeReportHeader(h: ReportHeader): number {
  return (
    (h.agreeValue & 0xf) |
    ((h.type0 & 1) << 4) |
    ((h.type1 & 1) << 5) |
    ((h.isAgree ? 1 : 0) << 6) |
    ((h.isReport ? 1 : 0) << 7)
  )
}

export function decodeReportHeader(asbyte: number): ReportHeader {
  return {
    agreeValue: asbyte & 0xf,
    type0: (asbyte >>> 4) & 1,
    type1: (asbyte >>> 5) & 1,
    isAgree: ((asbyte >>> 6) & 1) === 1,
    isReport: ((asbyte >>> 7) & 1) === 1,
  }
}

/** Header type: (type1<<1)|type0 — create=3, update=2, remove=0. */
export function reportHeaderType(h: ReportHeader): number {
  return ((h.type1 & 1) << 1) | (h.type0 & 1)
}

export function encodeReportCreate(report: ReportCreate): Uint8Array {
  const buf = new Uint8Array(REPORT_CREATE_SIZE)
  buf[0] = encodeReportHeader(report.header)
  const lengthLocation =
    (report.length & 0xff) | ((report.location & 0xffffff) << 8)
  writeU32LE(buf, 1, lengthLocation)
  writeU32LE(buf, 5, report.timestamp >>> 0)
  buf[9] = report.random & 0xff
  buf[10] = report.offer & 1
  buf[11] = report.subject & 0xff
  buf[12] = (report.subject >>> 8) & 0xff
  return buf
}

export function decodeReportCreate(data: Uint8Array): ReportCreate | null {
  if (data.length < REPORT_CREATE_SIZE) return null
  const header = decodeReportHeader(data[0]!)
  const lengthLocation = readU32LE(data, 1)
  return {
    header,
    length: lengthLocation & 0xff,
    location: (lengthLocation >>> 8) & 0xffffff,
    timestamp: readU32LE(data, 5),
    random: data[9]!,
    offer: (data[10]! & 1) as 0 | 1,
    subject: data[11]! | (data[12]! << 8),
  }
}

/** Create-report header: isReport + type=3. */
export function reportCreateHeader(agreeValue = 0): ReportHeader {
  return {
    agreeValue: agreeValue & 0xf,
    type0: 1,
    type1: 1,
    isAgree: false,
    isReport: true,
  }
}
