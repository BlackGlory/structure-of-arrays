import { DynamicTypedArray } from '@blackglory/structures'

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

export type Primitive =
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

export type TypeArray =
| DynamicTypedArray<typeof int8>
| DynamicTypedArray<typeof uint8>
| DynamicTypedArray<typeof int16>
| DynamicTypedArray<typeof uint16>
| DynamicTypedArray<typeof int32>
| DynamicTypedArray<typeof uint32>
| DynamicTypedArray<typeof float>
| DynamicTypedArray<typeof double>
| boolean[]
| string[]

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

export type PrimitiveOfTypeArray<T extends TypeArray> =
  T extends DynamicTypedArray<any> ? number
: T extends boolean[] ? boolean
: T extends string[] ? string
: never

export type TypeArrayOfType<T extends Type> =
  T extends typeof int8 ? DynamicTypedArray<typeof int8>
: T extends typeof uint8 ? DynamicTypedArray<typeof uint8>
: T extends typeof int16 ? DynamicTypedArray<typeof int16>
: T extends typeof uint16 ? DynamicTypedArray<typeof uint16>
: T extends typeof int32 ? DynamicTypedArray<typeof int32>
: T extends typeof uint32 ? DynamicTypedArray<typeof uint32>
: T extends typeof float ? DynamicTypedArray<typeof float>
: T extends typeof double ? DynamicTypedArray<typeof double>
: T extends typeof boolean ? boolean[]
: T extends typeof string ? string[]
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
