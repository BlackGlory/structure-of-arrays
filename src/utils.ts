import {
  Structure
, PrimitiveOfType
, MapTypesOfStructureToPrimitives
, Type
, int8
, uint8
, int16
, uint16
, int32
, uint32
, float32
, float64
, boolean
, string
} from './types.js'

export function createDefaultValueOfStructure<T extends Structure>(
  keys: string[]
, structure: T
): MapTypesOfStructureToPrimitives<T> {
  const result: Record<string, unknown> = {}

  for (const key of keys) {
    const type = structure[key]
    result[key] = createDefaultValueOfType(type)
  }

  return result as MapTypesOfStructureToPrimitives<T>
}

function createDefaultValueOfType<T extends Type>(type: T): PrimitiveOfType<T> {
  switch (type) {
    case int8:
    case uint8:
    case int16:
    case uint16:
    case int32:
    case uint32:
    case float32:
    case float64:
      return 0 as PrimitiveOfType<T>
    case boolean:
      return false as PrimitiveOfType<T>
    case string:
      return '' as PrimitiveOfType<T>
    default:
      throw new Error('Invalid type')
  }
}
