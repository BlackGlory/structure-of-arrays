import { go } from '@blackglory/prelude'
import { take, toArray } from 'iterable-operator'
import { SparseSet, DynamicTypedArray } from '@blackglory/structures'
import {
  Primitive
, PrimitiveOfType
, PrimitiveOfTypeArray
, Type
, TypeArrayOfType
, InternalArrayOfType
} from './types'
import { create, get, set, push } from './type-array-utils'

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

  private keyToArray: StructureArrays<T>
  private recycledIndexes = new SparseSet()
  private keys: string[]
  private deletableKeys: string[]
  private length: number = 0

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
    this.deletableKeys = deleteableKeys
    this.keyToArray = keyToArray as StructureArrays<T>
    this.arrays = go(() => {
      const result: Record<string, InternalArrayOfType<T[keyof T]>> = {}

      keys.forEach(key => {
        Object.defineProperty(result, key, {
          get: () => this.getInternalArray(key)
        })
      })

      return result as StructureInternalArrays<T>
    })
  }

  * indexes(): Iterable<number> {
    for (let index = 0, length = this.length; index < length; index++) {
      if (!this.recycledIndexes.has(index)) {
        yield index
      }
    }
  }

  has(index: number): boolean {
    if (this.recycledIndexes.has(index)) {
      return false
    } else {
      return index < this.length
    }
  }

  /**
   * @throws {RangeError}
   */
  get<U extends keyof T>(index: number, key: U): PrimitiveOfType<T[U]> {
    const array = this.keyToArray[key]
    const value = get(array, index)
    if (index < array.length) {
      if (this.recycledIndexes.has(index)) {
        throw new RangeError('index has been deleted')
      } else {
        return value as unknown as PrimitiveOfType<T[U]>
      }
    } else {
      throw new RangeError('index is out of bounds')
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

  // 此处代码经过优化, 尽可能避免修改它.
  add(...structures: Array<StructurePrimitive<T>>): number[] {
    const collectedIndexes = this.findCollectedIndexes(structures.length)
    for (let i = 0; i < collectedIndexes.length; i++) {
      for (const [key, value] of Object.entries(structures[i])) {
        const collectedIndex = collectedIndexes[i]
        const array = this.keyToArray[key]
        set(array, collectedIndex, value)
      }
      this.recycledIndexes.remove(collectedIndexes[i])
    }

    const remaining = structures.length - collectedIndexes.length
    if (remaining === 0) return collectedIndexes

    // 为了防止TypedArray多次resize, 将值汇聚在一起后一起push.
    const keyToValues: Record<string, Primitive[]> = Object.fromEntries(
      this.keys.map(key => [key, []])
    )
    for (let i = collectedIndexes.length; i < structures.length; i++) {
      for (const key of this.keys) {
        const value = structures[i][key]
        keyToValues[key].push(value)
      }
      this.length++
    }
    this.keys.forEach(key => {
      push(
        this.keyToArray[key]
      , ...(
          keyToValues[key] as Array<
            PrimitiveOfTypeArray<
              typeof this.keyToArray[typeof key]
            >
          >
        )
      )
    })

    const length = this.length
    return [
      ...collectedIndexes
    , ...go(function* (): Iterable<number> {
        for (let i = Math.max(length - remaining, 0); i < length; i++) {
          yield i
        }
      })
    ]
  }

  /**
   * @throws {RangeError}
   */
  set<U extends keyof T>(
    index: number
  , key: U
  , value: PrimitiveOfTypeArray<StructureArrays<T>[U]>
  ): void {
    const array = this.keyToArray[key]
    if (index < array.length) {
      if (this.recycledIndexes.has(index)) {
        throw new RangeError('index has been deleted')
      } else {
        set(array, index, value)
      }
    } else {
      throw new RangeError('index is out of bounds')
    }
  }

  trySet<U extends keyof T>(
    index: number
  , key: U
  , value: PrimitiveOfTypeArray<StructureArrays<T>[U]>
  ): boolean {
    try {
      this.set(index, key, value)
      return true
    } catch (e) {
      if (e instanceof RangeError) return false
      throw e
    }
  }

  // 此方法只实现了软删除, 将string[]和boolean[]类型的对应位置删除.
  // 硬删除最多只能回收位于数组末尾的连续项目, 且数组resize可能反而带来性能损失, 因此不实现硬删除.
  delete(index: number): void {
    this.recycledIndexes.add(index)
    this.deletableKeys.forEach(key => {
      // delete数组最后一个项目不会使数组length缩短
      delete (this.keyToArray[key] as unknown[])[index]
    })
  }

  private findCollectedIndexes(count: number): number[] {
    return toArray(take(this.recycledIndexes, count))
  }

  private getInternalArray<U extends keyof T>(key: U): InternalArrayOfType<T[U]> {
    const array = this.keyToArray[key]
    if (array instanceof DynamicTypedArray) {
      return array.internalTypedArray as InternalArrayOfType<T[U]>
    } else {
      return array as string[] | boolean[] as InternalArrayOfType<T[U]>
    }
  }
}
