import { assert, isntEmptyArray } from '@blackglory/prelude'
import { TypedCleanSparseMap } from '@blackglory/structures'
import { UnsignedTypedArrayConstructor, TypedArrayConstructor, NonEmptyArray, TypedArray } from 'justypes'
import { TypedArraysOfStructure, Structure } from './types.js'
import { fromEntries } from 'extra-utils'

interface IStructureOfSparseMapsOptions<T extends Structure> {
  structure: T
  keys: UnsignedTypedArrayConstructor
  capacity: number
}

export class StructureOfSparseMaps<T extends Structure> {
  readonly arrays: TypedArraysOfStructure<T>
  readonly capacity: number

  private containers: NonEmptyArray<
    TypedCleanSparseMap<
      UnsignedTypedArrayConstructor
    , TypedArrayConstructor
    >
  >

  private firstContainer: TypedCleanSparseMap<
    UnsignedTypedArrayConstructor
  , TypedArrayConstructor
  >

  get length(): number {
    return this.containers[0].size
  }

  constructor(options: IStructureOfSparseMapsOptions<T>) {
    const structureEntries = Object.entries(options.structure)
    assert(
      isntEmptyArray(structureEntries)
    , 'The structure should have at least one property'
    )

    const capacity = options.capacity
    this.capacity = capacity

    const nameToSparseMap: Record<
      string
    , TypedCleanSparseMap<
        UnsignedTypedArrayConstructor
      , TypedArrayConstructor
      >
    > = fromEntries(
      structureEntries.map(([name, valuesConstructor]) => {
        const map = new TypedCleanSparseMap(
          new options.keys(capacity)
        , new valuesConstructor(capacity)
        )
        return [name, map]
      })
    )
    const containers = Object.values(nameToSparseMap)
    this.containers = containers as NonEmptyArray<
      TypedCleanSparseMap<
        UnsignedTypedArrayConstructor
      , TypedArrayConstructor
      >
    >
    this.firstContainer = containers[0]

    const nameToTypedArray: Record<string, TypedArray> = fromEntries(
      Object.entries(nameToSparseMap)
        .map(([name, map]) => [name, map.internalValueArray])
    )
    this.arrays = nameToTypedArray as TypedArraysOfStructure<T>
  }

  keys(): IterableIterator<number> {
    return this.firstContainer.keys()
  }

  getIndexByKey(key: number): number | undefined {
    return this.firstContainer.getInternalIndexOfKey(key)
  }

  register(key: number): void {
    if (!this.firstContainer.has(key)) {
      // 潜在优化: 如果SparseMap使用相同的denseKeys和sparse数组, 则可以将内部操作次数降至1次.
      this.containers.forEach(container => container.set(key, 0))
    }
  }

  unregister(key: number): void {
    if (this.firstContainer.has(key)) {
      // 潜在优化: 如果SparseMap使用相同的denseKeys和sparse数组, 则可以将内部操作次数降至1次.
      this.containers.forEach(container => container.delete(key))
    }
  }
}
