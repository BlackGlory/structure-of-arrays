import { go, assert, isntEmptyArray } from '@blackglory/prelude'
import { take, toArray } from 'iterable-operator'
import { TypedSparseMap, SparseMap } from '@blackglory/structures'
import {
  PrimitiveOfType
, InternalArrayOfType
, Structure
, MapStructureToInternalArrays
, MapStructureToPrimitive
} from '@src/types'
import { ValueOfContainer, StructureContainers } from './types'
import { create, get, set } from './utils'

export class StructureOfSparseMaps<T extends Structure> {
  readonly arrays: MapStructureToInternalArrays<T>

  private _length: number = 0
  private keys: string[]
  private keyToContainer: StructureContainers<T>
  private usedIndexes = new Set<number>()
  private recycledIndexes = new Set<number>()

  /**
   * 数组中的项目数量 = 数组非空元素的数量
   */
  get size(): number {
    return this.usedIndexes.size
  }

  constructor(structure: T) {
    const keys = Object.keys(structure)
    assert(isntEmptyArray(keys), 'structure should have at least one property')

    const keyToContainer: Record<string, unknown> = {}

    for (const key of keys) {
      const constructor = structure[key]
      const container = create(constructor)
      keyToContainer[key] = container
    }

    this.keys = keys
    this.keyToContainer = keyToContainer as StructureContainers<T>
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

      return Object.create(internalArrays) as MapStructureToInternalArrays<T>
    })
  }

  indexes(): Iterable<number> {
    return this.usedIndexes.keys()
  }

  has(index: number): boolean {
    return this.usedIndexes.has(index)
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
      throw new RangeError('index is not used')
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

  /**
   * Insert items that reuse deleted indexes, return indexes.
   */
  add(...structures: Array<MapStructureToPrimitive<T>>): number[] {
    const recycledIndexes = this.findRecycledIndexes(structures.length)
    for (let i = 0; i < recycledIndexes.length; i++) {
      const index = recycledIndexes[i]

      for (const [key, value] of Object.entries(structures[i])) {
        const container = this.keyToContainer[key]
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

        for (const [key, value] of Object.entries(structure)) {
          const container = this.keyToContainer[key]
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
  upsert(index: number, structure: MapStructureToPrimitive<T>): void {
    for (const [key, value] of Object.entries(structure)) {
      const container = this.keyToContainer[key]
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
      throw new RangeError('index is not used')
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
