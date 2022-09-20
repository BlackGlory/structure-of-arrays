import { go, assert, isntEmptyArray } from '@blackglory/prelude'
import { take, toArray } from 'iterable-operator'
import { TypedSparseMap, SparseMap, BitSet } from '@blackglory/structures'
import {
  PrimitiveOfType
, InternalArrayOfType
, Structure
, MapTypesOfStructureToInternalArrays
, MapTypesOfStructureToPrimitives
} from '@src/types'
import { ValueOfContainer, StructureContainers, Container } from './types'
import { create, get, set } from './utils'
import { createDefaultValueOfStructure } from '@src/utils'

export class StructureOfSparseMaps<T extends Structure> {
  readonly arrays: MapTypesOfStructureToInternalArrays<T>
  readonly keys: string[]

  private _length: number = 0
  private keyToContainer: StructureContainers<T>
  private usedIndexes = new BitSet(256)
  private recycledIndexes = new BitSet(256)
  private firstContainer: Container
  private defaultValues: MapTypesOfStructureToPrimitives<T>

  /**
   * 数组中的项目数量 = 数组非空元素的数量
   */
  get size(): number {
    return this.usedIndexes.size
  }

  constructor(
    structure: T
  , defaultValuesOfStructure?: MapTypesOfStructureToPrimitives<T>
  ) {
    const keys = Object.keys(structure)
    assert(isntEmptyArray(keys), 'The structure should have at least one property')

    const keyToContainer: Record<string, Container> = {}

    for (const key of keys) {
      const constructor = structure[key]
      const container = create(constructor)
      keyToContainer[key] = container
    }

    this.keys = keys
    this.defaultValues = defaultValuesOfStructure
      ?? createDefaultValueOfStructure(keys, structure)
    this.keyToContainer = keyToContainer as StructureContainers<T>
    this.firstContainer = keyToContainer[keys[0]]
    this.arrays = go(() => {
      // 通过原型在V8优化defineProperty
      // https://stackoverflow.com/questions/36338289/object-descriptor-getter-setter-performance-in-recent-chrome-v8-versions
      const internalArrays = {}

      keys.forEach(key => {
        const container = this.keyToContainer[key]
        Object.defineProperty(internalArrays, key, {
          get: container instanceof SparseMap
             ? () => container.internalArray as InternalArrayOfType<T[keyof T]>
             : () => (
                 this.keyToContainer[key] as TypedSparseMap<any>
               ).internalTypedArray as InternalArrayOfType<T[keyof T]>
        })
      })

      return Object.create(internalArrays) as MapTypesOfStructureToInternalArrays<T>
    })
  }

  // 经过优化, 返回有利于遍历数组的key
  indexes(): Iterable<number> {
    return this.firstContainer.keys()
  }

  has(index: number): boolean {
    return this.usedIndexes.has(index)
  }

  getInternalIndex(externalIndex: number): number {
    if (this.usedIndexes.has(externalIndex)) {
      return this.firstContainer.getInternalIndexOfKey(externalIndex)!
    } else {
      throw new RangeError('The external index is not used')
    }
  }

  tryGetInternalIndex(externalIndex: number): number | undefined {
    try {
      return this.getInternalIndex(externalIndex)
    } catch (e) {
      if (e instanceof RangeError) return undefined
      throw e
    }
  }

  /**
   * @throws {RangeError}
   */
  get<U extends keyof T>(index: number, key: U): PrimitiveOfType<T[U]> {
    if (this.usedIndexes.has(index)) {
      const container = this.keyToContainer[key]
      const value = get(container, index)
      return value as unknown as PrimitiveOfType<T[U]>
    } else {
      throw new RangeError('The index is not used')
    }
  }

  tryGet<U extends keyof T>(index: number, key: U): PrimitiveOfType<T[U]> | undefined {
    try {
      return this.get(index, key)
    } catch (e) {
      if (e instanceof RangeError) return undefined
      throw e
    }
  }

  addWithDefaultValues(size: number): number[] {
    const structures = new Array<MapTypesOfStructureToPrimitives<T>>(size)
    structures.fill(this.defaultValues)
    return this.add(...structures)
  }

  /**
   * Insert items that reuse deleted indexes, return indexes.
   */
  add(...structures: Array<MapTypesOfStructureToPrimitives<T>>): number[] {
    const recycledIndexes = this.findRecycledIndexes(structures.length)
    for (let i = 0; i < recycledIndexes.length; i++) {
      const index = recycledIndexes[i]

      const structure = structures[i]
      for (const key of this.keys) {
        const value = structure[key]
        const container: Container = this.keyToContainer[key]
        set(container, index, value)
      }

      this.usedIndexes.add(index)
      this.recycledIndexes.delete(index)
    }

    const remainingStuctures = structures.slice(recycledIndexes.length)
    if (remainingStuctures.length === 0) {
      return recycledIndexes
    } else {
      const pushedIndexes: number[] = []
      for (const structure of remainingStuctures) {
        const index = this._length++

        for (const key of this.keys) {
          const value = structure[key]
          const container: Container = this.keyToContainer[key]
          set(container, index, value)
        }

        this.usedIndexes.add(index)
        pushedIndexes.push(index)
      }

      return [...recycledIndexes, ...pushedIndexes]
    }
  }

  /**
   * Insert or update an item based on index.
   */
  upsert(
    index: number
  , structure: MapTypesOfStructureToPrimitives<T> = this.defaultValues
  ): void {
    for (const key of this.keys) {
      const value = structure[key]
      const container: Container = this.keyToContainer[key]
      set(container, index, value)
    }

    this.usedIndexes.add(index)
    this.recycledIndexes.delete(index)
  }

  /**
   * @throws {RangeError}
   */
  update<U extends keyof T>(
    index: number
  , key: U
  , value: ValueOfContainer<StructureContainers<T>[U]>
  ): void {
    if (this.usedIndexes.has(index)) {
      const container = this.keyToContainer[key]
      set(container, index, value)
    } else {
      throw new RangeError('The index is not used')
    }
  }

  tryUpdate<U extends keyof T>(
    index: number
  , key: U
  , value: ValueOfContainer<StructureContainers<T>[U]>
  ): boolean {
    try {
      this.update(index, key, value)
      return true
    } catch (e) {
      if (e instanceof RangeError) return false
      throw e
    }
  }

  delete(index: number): void {
    if (this.usedIndexes.has(index)) {
      for (const key of this.keys) {
        this.keyToContainer[key].delete(index)
      }

      this.usedIndexes.delete(index)
      this.recycledIndexes.add(index)
    }
  }

  private findRecycledIndexes(count: number): number[] {
    return toArray(take(this.recycledIndexes, count))
  }
}
