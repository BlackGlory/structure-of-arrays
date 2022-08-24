export type Structure = Record<string, Type>

export type MapTypesOfStructureToPrimitives<T extends Structure> = {
  [Key in keyof T]: PrimitiveOfType<T[Key]>
}

export type MapTypesOfStructureToInternalArrays<T extends Structure> = {
  [Key in keyof T]: InternalArrayOfType<T[Key]>
}

export const int8 = Int8Array
export const uint8 = Uint8Array
export const int16 = Int16Array
export const uint16 = Uint16Array
export const int32 = Int32Array
export const uint32 = Uint32Array
export const float = Float32Array
export const double = Float64Array
export const string = String
export const boolean = Boolean

export type Value =
| number
| boolean
| string

export type Type =
| typeof int8
| typeof uint8
| typeof int16
| typeof uint16
| typeof int32
| typeof uint32
| typeof float
| typeof double
| typeof boolean
| typeof string

export type InternalArray =
| Int8Array
| Uint8Array
| Int16Array
| Uint16Array
| Int32Array
| Uint32Array
| Float32Array
| Float64Array
| boolean[]
| string[]

export type PrimitiveOfType<T extends Type> =
  T extends typeof int8 ? number
: T extends typeof uint8 ? number
: T extends typeof int16 ? number
: T extends typeof uint16 ? number
: T extends typeof int32 ? number
: T extends typeof uint32 ? number
: T extends typeof double ? number
: T extends typeof boolean ? boolean
: T extends typeof string ? string
: never

export type InternalArrayOfType<T extends Type> =
  T extends typeof int8 ? Int8Array
: T extends typeof uint8 ? Uint8Array
: T extends typeof int16 ? Int16Array
: T extends typeof uint16 ? Uint16Array
: T extends typeof int32 ? Int32Array
: T extends typeof uint32 ? Uint32Array
: T extends typeof float ? Float32Array
: T extends typeof double ? Float64Array
: T extends typeof boolean ? boolean[]
: T extends typeof string ? string[]
: never
