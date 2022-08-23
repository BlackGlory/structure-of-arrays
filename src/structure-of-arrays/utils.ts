import { isArray } from '@blackglory/prelude'
import { DynamicTypedArray } from '@blackglory/structures'
import {
  Type
, boolean
, string
} from '@src/types'
import { ValueOfContainer, ContainerOfType, Container } from './types'
import { TypedArrayConstructor } from 'justypes'

export function create<T extends Type>(
  constructor: T
): ContainerOfType<T> {
  switch (constructor) {
    case string:
    case boolean:
      return [] as unknown as ContainerOfType<T>
    default:
      return new DynamicTypedArray(
        constructor as TypedArrayConstructor
      ) as ContainerOfType<T>
  }
}

export function get<T extends Container>(
  container: T
, index: number
): ValueOfContainer<T> | undefined {
  if (isArray(container)) {
    return container[index] as ValueOfContainer<T> | undefined
  } else {
    return container.get(index) as ValueOfContainer<T> | undefined
  }
}

export function set<T extends Container>(
  container: T
, index: number
, value: ValueOfContainer<T>
): void {
  if (isArray(container)) {
    container[index] = value as string | boolean
  } else {
    container.set(index, value as number)
  }
}

export function push<T extends Container>(
  container: T
, ...values: Array<ValueOfContainer<T>>
): void {
  (container.push as (...values: Array<ValueOfContainer<T>>) => unknown)(...values)
}

export function pop<T extends Container>(container: T): void {
  container.pop()
}
