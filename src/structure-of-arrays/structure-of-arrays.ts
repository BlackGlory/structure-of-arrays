import { go, assert, isntEmptyArray, isArray } from '@blackglory/prelude'
import { take, toArray } from 'iterable-operator'
import { DynamicTypedArray } from '@blackglory/structures'
import {
  Value
, PrimitiveOfType
, InternalArrayOfType
, Structure
, MapStructureToInternalArrays
, MapStructureToPrimitive
} from '@src/types'
import { ValueOfContainer, StructureContainers } from './types'
import { create, get, pop, push, set } from './utils'

export class StructureOfArrays<T extends Structure> {
  readonly arrays: MapStructureToInternalArrays<T>

  private _length: number = 0
  private keys: string[]
  private keyToContainer: StructureContainers<T>
  private usedIndexes = new Set<number>()
  private recycledIndexes = new Set<number>()

  /**
   * 数组的长度 = 数组最后一个非空元素的索引值 + 1
   */
  get length(): number {
    return this._length
  }

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
          get: isArray(container)
               ? () => (
                   container as string[] | boolean[] as InternalArrayOfType<T[keyof T]>
                 )
               : () => (
                   this.keyToContainer[key] as DynamicTypedArray<any>
                 ).internalTypedArray as InternalArrayOfType<T[keyof T]>
        })
      })

      return Object.create(internalArrays) as MapStructureToInternalArrays<T>
    })
  }

  indexes(): Iterable<number> {
    return this.usedIndexes.values()
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
      const pushedIndexes = this.push(...remainingStuctures)
      return [...recycledIndexes, ...pushedIndexes]
    }
  }

  /**
   * Insert items at the end of the array, return indexes.
   */
  push(...structures: Array<MapStructureToPrimitive<T>>): number[] {
    // 为了防止TypedArray多次resize, 将值汇聚在一起后一起push.
    const keyToValues: Record<string, Value[]> = Object.fromEntries(
      this.keys.map(key => [key, []])
    )
    const pushedIndexes: number[] = []
    for (let i = 0; i < structures.length; i++) {
      for (const key of this.keys) {
        const value = structures[i][key]
        keyToValues[key].push(value)
      }

      const index = this._length++
      this.usedIndexes.add(index)
      pushedIndexes.push(index)
    }

    this.keys.forEach(key => {
      push(
        this.keyToContainer[key]
      , ...(
          keyToValues[key] as Array<
            ValueOfContainer<typeof this.keyToContainer[typeof key]>
          >
        )
      )
    })

    return pushedIndexes
  }

  pop(): void {
    if (this.length > 0) {
      this.usedIndexes.delete(this.length - 1)
      for (const key of this.keys) {
        pop(this.keyToContainer[key])
      }
      this._length--

      while (this.recycledIndexes.has(this.length - 1)) {
        this.recycledIndexes.delete(this.length - 1)
        for (const key of this.keys) {
          pop(this.keyToContainer[key])
        }
        this._length--
      }
    }
  }

  /**
   * Insert or update an item based on index.
   */
  upsert(index: number, structure: MapStructureToPrimitive<T>): void {
    if (index >= this.length) {
      this._length = index + 1
    }

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
    if (index === this.length - 1) {
      this.pop()
    } else {
      const deleted = this.usedIndexes.delete(index)
      if (deleted) {
        this.recycledIndexes.add(index)
      }
    }
  }

  private findRecycledIndexes(count: number): number[] {
    return toArray(take(this.recycledIndexes, count))
  }
}
