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
, float
, double
, boolean
, string
} from './types'

export function createDefaultValueOfStructure<T extends Structure>(
  structure: T
): MapTypesOfStructureToPrimitives<T> {
  const result: Record<string, unknown> = {}

  for (const [name, type] of Object.entries(structure)) {
    result[name] = createDefaultValueOfType(type)
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
    case float:
    case double:
      return 0 as PrimitiveOfType<T>
    case boolean:
      return false as PrimitiveOfType<T>
    case string:
      return '' as PrimitiveOfType<T>
    default:
      throw new Error('Invalid type')
  }
}
