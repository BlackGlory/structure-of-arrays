import { TypedSparseMap, SparseMap, DynamicTypedArray } from '@blackglory/structures'
import {
  Type
, boolean
, string
} from '@src/types.js'
import { ValueOfContainer, ContainerOfType, Container } from './types.js'
import { TypedArrayConstructor } from 'justypes'

export function create<T extends Type>(
  constructor: T
): ContainerOfType<T> {
  switch (constructor) {
    case string:
    case boolean:
      return new SparseMap() as ContainerOfType<T>
    default:
      return new TypedSparseMap(
        new DynamicTypedArray(constructor as TypedArrayConstructor)
      ) as ContainerOfType<T>
  }
}

export function get<T extends Container>(
  container: T
, index: number
): ValueOfContainer<T> | undefined {
  return container.get(index) as ValueOfContainer<T> | undefined
}

export function set<T extends Container>(
  container: T
, index: number
, value: ValueOfContainer<T>
): void {
  if (container instanceof SparseMap) {
    (container as SparseMap<any>).set(index, value)
  } else {
    container.set(index, value as number)
  }
}

export function remove<T extends Container>(container: T, index: number): void {
  container.delete(index)
}
