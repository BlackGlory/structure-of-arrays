import { assert, isntEmptyArray } from '@blackglory/prelude'
import { ResizableTypedArray, ResizableTypedCleanSparseMapLite } from '@blackglory/structures'
import { UnsignedTypedArrayConstructor, TypedArrayConstructor, NonEmptyArray, TypedArray } from 'justypes'
import { TypedArraysOfStructure, Structure } from './types.js'
import { fromEntries } from 'extra-utils'

interface IStructureOfResizableSparseMapsOptions<T extends Structure> {
  structure: T
  keys: UnsignedTypedArrayConstructor
  maxCapacity: number

  initialCapacity?: number
  growthFactor?: number
}

export class StructureOfResizableSparseMaps<T extends Structure> {
  readonly arrays: TypedArraysOfStructure<T>
  readonly maxCapacity: number

  private containers: NonEmptyArray<
    ResizableTypedCleanSparseMapLite<
      UnsignedTypedArrayConstructor
    , TypedArrayConstructor
    >
  >
  private firstContainer: ResizableTypedCleanSparseMapLite<
    UnsignedTypedArrayConstructor
  , TypedArrayConstructor
  >

  get length(): number {
    return this.containers[0].size
  }

  constructor(options: IStructureOfResizableSparseMapsOptions<T>) {
    const structureEntries = Object.entries(options.structure)
    assert(
      isntEmptyArray(structureEntries)
    , 'The structure should have at least one property'
    )

    const maxCapacity = options.maxCapacity
    this.maxCapacity = maxCapacity

    const nameToSparseMap: Record<
      string
    , ResizableTypedCleanSparseMapLite<
        UnsignedTypedArrayConstructor
      , TypedArrayConstructor
      >
    > = fromEntries(
      structureEntries.map(([name, valuesConstructor]) => {
        const map = new ResizableTypedCleanSparseMapLite(
          new ResizableTypedArray(options.keys, {
            maxCapacity
          , initialCapacity: options.initialCapacity
          , growthFactor: options.growthFactor
          })
        , new ResizableTypedArray(valuesConstructor, {
            maxCapacity
          , initialCapacity: options.initialCapacity
          , growthFactor: options.growthFactor
          })
        )
        return [name, map]
      })
    )
    const containers = Object.values(nameToSparseMap)
    this.containers = containers as NonEmptyArray<
      ResizableTypedCleanSparseMapLite<
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
