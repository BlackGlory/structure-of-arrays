import { DynamicTypedArray, SparseMap, TypedSparseMap } from '@blackglory/structures'
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
} from '@src/types'

export type Container =
| TypedSparseMap<typeof int8>
| TypedSparseMap<typeof uint8>
| TypedSparseMap<typeof int16>
| TypedSparseMap<typeof uint16>
| TypedSparseMap<typeof int32>
| TypedSparseMap<typeof uint32>
| TypedSparseMap<typeof float32>
| TypedSparseMap<typeof float64>
| SparseMap<boolean>
| SparseMap<string>

export type ContainerOfType<T extends Type> =
  T extends typeof int8 ? TypedSparseMap<typeof int8>
: T extends typeof uint8 ? TypedSparseMap<typeof uint8>
: T extends typeof int16 ? TypedSparseMap<typeof int16>
: T extends typeof uint16 ? TypedSparseMap<typeof uint16>
: T extends typeof int32 ? TypedSparseMap<typeof int32>
: T extends typeof uint32 ? TypedSparseMap<typeof uint32>
: T extends typeof float32 ? TypedSparseMap<typeof float32>
: T extends typeof float64 ? TypedSparseMap<typeof float64>
: T extends typeof boolean ? SparseMap<boolean>
: T extends typeof string ? SparseMap<string>
: never


export type ValueOfContainer<T extends Container> =
  T extends TypedSparseMap<any> ? number
: T extends SparseMap<boolean> ? boolean
: T extends SparseMap<string> ? string
: never

export type StructureContainers<T extends Structure> = {
  [Key in keyof T]: ContainerOfType<T[Key]>
}
