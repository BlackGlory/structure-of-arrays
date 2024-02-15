import { DynamicTypedArray } from '@blackglory/structures'
import {
  Structure
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
} from '@src/types.js'
import { TypedArrayConstructor } from 'justypes'

export type Container =
| DynamicTypedArray<typeof int8>
| DynamicTypedArray<typeof uint8>
| DynamicTypedArray<typeof int16>
| DynamicTypedArray<typeof uint16>
| DynamicTypedArray<typeof int32>
| DynamicTypedArray<typeof uint32>
| DynamicTypedArray<typeof float32>
| DynamicTypedArray<typeof float64>
| boolean[]
| string[]

export type ContainerOfType<T extends Type> =
  T extends typeof int8 ? DynamicTypedArray<typeof int8>
: T extends typeof uint8 ? DynamicTypedArray<typeof uint8>
: T extends typeof int16 ? DynamicTypedArray<typeof int16>
: T extends typeof uint16 ? DynamicTypedArray<typeof uint16>
: T extends typeof int32 ? DynamicTypedArray<typeof int32>
: T extends typeof uint32 ? DynamicTypedArray<typeof uint32>
: T extends typeof float32 ? DynamicTypedArray<typeof float32>
: T extends typeof float64 ? DynamicTypedArray<typeof float64>
: T extends typeof boolean ? boolean[]
: T extends typeof string ? string[]
: never


export type ValueOfContainer<T extends Container> =
  T extends DynamicTypedArray<TypedArrayConstructor> ? number
: T extends boolean[] ? boolean
: T extends string[] ? string
: never

export type StructureContainers<T extends Structure> = {
  [Key in keyof T]: ContainerOfType<T[Key]>
}
