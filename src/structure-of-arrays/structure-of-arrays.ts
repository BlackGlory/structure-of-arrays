import { go, assert, isntEmptyArray, isArray } from '@blackglory/prelude'
import { take, toArray } from 'iterable-operator'
import { DynamicTypedArray, BitSet } from '@blackglory/structures'
import {
  Value
, PrimitiveOfType
, InternalArrayOfType
, Structure
, MapTypesOfStructureToInternalArrays
, MapTypesOfStructureToPrimitives
} from '@src/types.js'
import { ValueOfContainer, StructureContainers, Container } from './types.js'
import { create, get, pop, push, set } from './utils.js'
import { createDefaultValueOfStructure } from '@src/utils.js'

export class StructureOfArrays<T extends Structure> {
  readonly arrays: MapTypesOfStructureToInternalArrays<T>
  readonly keys: string[]

  private _length: number = 0
  private keyToContainer: StructureContainers<T>
  private usedIndexes = new BitSet()
  private recycledIndexes = new Set<number>()
  private defaultValues: MapTypesOfStructureToPrimitives<T>

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

  constructor(
    structure: T
  , defaultValuesOfStructure?: MapTypesOfStructureToPrimitives<T>
  ) {
    const keys = Object.keys(structure)
    assert(isntEmptyArray(keys), 'The structure should have at least one property')
    
    this.defaultValues = defaultValuesOfStructure
      ?? createDefaultValueOfStructure(keys, structure)

    const keyToContainer: Record<string, Container> = {}

    for (const key of keys) {
      const constructor = structure[key]
      const container = create(constructor)
      keyToContainer[key] = container
    }

    this.keys = keys
    this.keyToContainer = keyToContainer as StructureContainers<T>
    this.arrays = go(() => {
      const internalArrays: Record<string, unknown> = {}

      keys.forEach(key => {
        const container = this.keyToContainer[key]
        if (isArray(container)) {
          internalArrays[key] = container as string[] | boolean[] as InternalArrayOfType<T[keyof T]>
        } else {
          Object.defineProperty(internalArrays, key, {
            get: () => (container as DynamicTypedArray<any>).internalTypedArray as InternalArrayOfType<T[keyof T]>
          })
        }
      })

      // 通过原型在V8优化defineProperty
      // https://stackoverflow.com/questions/36338289/object-descriptor-getter-setter-performance-in-recent-chrome-v8-versions
      return Object.create(internalArrays) as MapTypesOfStructureToInternalArrays<T>
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

  addWithDefaultValues(size: number): number[] {
    const structures = new Array<MapTypesOfStructureToPrimitives<T>>(size)
    structures.fill(this.defaultValues)
    return this.add(...structures)
  }

  /**
   * Insert items that reuse deleted indexes, return indexes.
   */
  add(...structures: Array<MapTypesOfStructureToPrimitives<T>>): number[] {
    const reusableIndexes = this.findRecycledIndexes(structures.length)
    for (let i = 0; i < reusableIndexes.length; i++) {
      const index = reusableIndexes[i]

      const structure = structures[i]
      for (const key of this.keys) {
        const value = structure[key]
        const container: Container = this.keyToContainer[key]
        set(container, index, value)
      }

      this.usedIndexes.add(index)
      this.recycledIndexes.delete(index)
    }

    const remainingStuctures = structures.slice(reusableIndexes.length)
    if (remainingStuctures.length === 0) {
      return reusableIndexes
    } else {
      const pushedIndexes = this.push(...remainingStuctures)
      return [...reusableIndexes, ...pushedIndexes]
    }
  }

  pushWithDefaultValues(size: number): number[] {
    const structures = new Array<MapTypesOfStructureToPrimitives<T>>(size)
    structures.fill(this.defaultValues)
    return this.push(...structures)
  }

  /**
   * Insert items at the end of the array, return indexes.
   */
  push(...structures: Array<MapTypesOfStructureToPrimitives<T>>): number[] {
    // 为了防止TypedArray多次resize, 将值汇聚起来一起push.
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
  upsert(
    index: number
  , structure: MapTypesOfStructureToPrimitives<T> = this.defaultValues
  ): void {
    if (index >= this.length) {
      this._length = index + 1
    }

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

  clear(): void {
    this._length = 0
    this.usedIndexes.clear()
    this.recycledIndexes.clear()
    for (const key of this.keys) {
      const container = this.keyToContainer[key]
      if (isArray(container)) {
        container.length === 0
      } else {
        container.clear()
      }
    }
  }

  // 注意, 此方法是部分方法的性能瓶颈, 需要特别关注它的性能表现.
  private findRecycledIndexes(count: number): number[] {
    // 通过尽早处理一些情况来避免使用迭代器, 该分支语句同时有利于分支预测.
    if (count && this.recycledIndexes.size) {
      return toArray(take(this.recycledIndexes, count))
    } else {
      return []
    }
  }
}
