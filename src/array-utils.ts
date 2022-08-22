import { isArray } from '@blackglory/prelude'
import { DynamicTypedArray } from '@blackglory/structures'
import { TypedArrayConstructor } from 'justypes'
import {
  TypeArray
, Type
, TypeArrayOfType
, PrimitiveOfTypeArray
, string
, boolean
} from './types'

export function create<T extends Type>(
  constructor: T
): TypeArrayOfType<T> {
  switch (constructor) {
    case string:
    case boolean:
      return [] as unknown as TypeArrayOfType<T>
    default:
      return new DynamicTypedArray(
        constructor as TypedArrayConstructor
      ) as TypeArrayOfType<T>
  }
}

export function get<T extends TypeArray>(
  array: T
, index: number
): PrimitiveOfTypeArray<T> | undefined {
  if (isArray(array)) {
    return array[index] as PrimitiveOfTypeArray<T> | undefined
  } else {
    return array.get(index) as PrimitiveOfTypeArray<T> | undefined
  }
}

export function set<T extends TypeArray>(
  array: T
, index: number
, value: PrimitiveOfTypeArray<T>
): void {
  if (isArray(array)) {
    array[index] = value as string | boolean
  } else {
    array.set(index, value as number)
  }
}

export function push<T extends TypeArray>(
  array: T
, ...values: Array<PrimitiveOfTypeArray<T>>
): void {
  (array.push as (...values: Array<PrimitiveOfTypeArray<T>>) => unknown)(...values)
}

export function pop<T extends TypeArray>(array: T): void {
  array.pop()
}
