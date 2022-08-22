import { go } from '@blackglory/prelude'
import { take, toArray } from 'iterable-operator'
import { DynamicTypedArray } from '@blackglory/structures'
import {
  Primitive
, PrimitiveOfType
, PrimitiveOfTypeArray
, Type
, TypeArrayOfType
, InternalArrayOfType
} from './types'
import { create, get, set, push, pop } from './array-utils'

export type Structure = Record<string, Type>

export type StructurePrimitive<T extends Structure> = {
  [Key in keyof T]: PrimitiveOfType<T[Key]>
}

type StructureArrays<T extends Structure> = {
  [Key in keyof T]: TypeArrayOfType<T[Key]>
}

type StructureInternalArrays<T extends Structure> = {
  [Key in keyof T]: InternalArrayOfType<T[Key]>
}

export class StructureOfArrays<T extends Structure> {
  readonly arrays: StructureInternalArrays<T>

  private _length: number = 0
  private keys: string[]
  private keyToArray: StructureArrays<T>
  private usedIndexes = new Set<number>()
  private recycledIndexes = new Set<number>()

  get length(): number {
    return this._length
  }

  get size(): number {
    return this.usedIndexes.size
  }

  constructor(structure: T) {
    const keys = Object.keys(structure)
    const deleteableKeys: string[] = []
    const keyToArray: Record<string, unknown> = {}

    for (const key of keys) {
      const constructor = structure[key]
      const array = create(constructor)
      if (array instanceof Array) {
        deleteableKeys.push(key)
      }
      keyToArray[key] = array
    }

    this.keys = keys
    this.keyToArray = keyToArray as StructureArrays<T>
    this.arrays = go(() => {
      // 通过原型在V8优化defineProperty
      // https://stackoverflow.com/questions/36338289/object-descriptor-getter-setter-performance-in-recent-chrome-v8-versions
      const internalArrays = {}

      keys.forEach(key => {
        const array = this.keyToArray[key]
        Object.defineProperty(internalArrays, key, {
          get: array instanceof DynamicTypedArray
             ? () => (
                 this.keyToArray[key] as DynamicTypedArray<any>
               ).internalTypedArray as InternalArrayOfType<T[keyof T]>
             : () => array as string[] | boolean[] as InternalArrayOfType<T[keyof T]>
        })
      })

      return Object.create(internalArrays) as StructureInternalArrays<T>
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
      const array = this.keyToArray[key]
      const value = get(array, index)
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
   * Insert or update an item based on index.
   */
  upsert(index: number, structure: StructurePrimitive<T>): void {
    if (index >= this.length) {
      this._length = index + 1
    }

    for (const [key, value] of Object.entries(structure)) {
      const array = this.keyToArray[key]
      set(array, index, value)
    }

    this.usedIndexes.add(index)
    this.recycledIndexes.delete(index)
  }

  /**
   * Insert items that reuse deleted indexes, return indexes.
   */
  add(...structures: Array<StructurePrimitive<T>>): number[] {
    const recycledIndexes = this.findRecycledIndexes(structures.length)
    for (let i = 0; i < recycledIndexes.length; i++) {
      const index = recycledIndexes[i]

      for (const [key, value] of Object.entries(structures[i])) {
        const array = this.keyToArray[key]
        set(array, index, value)
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
  push(...structures: Array<StructurePrimitive<T>>): number[] {
    // 为了防止TypedArray多次resize, 将值汇聚在一起后一起push.
    const keyToValues: Record<string, Primitive[]> = Object.fromEntries(
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
        this.keyToArray[key]
      , ...(
          keyToValues[key] as Array<
            PrimitiveOfTypeArray<typeof this.keyToArray[typeof key]>
          >
        )
      )
    })

    return pushedIndexes
  }

  /**
   * @throws {RangeError}
   */
  update<U extends keyof T>(
    index: number
  , key: U
  , value: PrimitiveOfTypeArray<StructureArrays<T>[U]>
  ): void {
    if (this.usedIndexes.has(index)) {
      const array = this.keyToArray[key]
      set(array, index, value)
    } else {
      throw new RangeError('index is not used')
    }
  }

  tryUpdate<U extends keyof T>(
    index: number
  , key: U
  , value: PrimitiveOfTypeArray<StructureArrays<T>[U]>
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

  pop(): void {
    if (this.length > 0) {
      this.usedIndexes.delete(this.length - 1)
      for (const key of this.keys) {
        pop(this.keyToArray[key])
      }
      this._length--

      while (this.recycledIndexes.has(this.length - 1)) {
        this.recycledIndexes.delete(this.length - 1)
        for (const key of this.keys) {
          pop(this.keyToArray[key])
        }
        this._length--
      }
    }
  }

  private findRecycledIndexes(count: number): number[] {
    return toArray(take(this.recycledIndexes, count))
  }
}
