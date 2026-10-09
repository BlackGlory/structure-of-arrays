import { ResizableTypedArray } from '@blackglory/structures'
import { fromEntries, isntEmptyArray } from 'extra-utils'
import { TypedArrayConstructor, TypedArray, NonEmptyArray } from 'justypes'
import { TypedArraysOfStructure, Structure } from './types.js'
import { assert } from '@blackglory/prelude'

interface IStructureOfResizableArraysOptions<T extends Structure> {
  structure: T
  maxCapacity: number

  initialCapacity?: number
  growthFactor?: number
}

export class StructureOfResizableArrays<T extends Structure> {
  readonly arrays: TypedArraysOfStructure<T>
  readonly maxCapacity: number

  private containers: NonEmptyArray<ResizableTypedArray<TypedArrayConstructor>>
  private firstContainer: ResizableTypedArray<TypedArrayConstructor>

  get length(): number {
    return this.firstContainer.length
  }

  constructor(options: IStructureOfResizableArraysOptions<T>) {
    const structureEntries = Object.entries(options.structure)
    assert(
      isntEmptyArray(structureEntries)
    , 'The structure should have at least one property'
    )

    const maxCapacity = options.maxCapacity
    this.maxCapacity = maxCapacity

    const nameToResizableTypedArray: Record<
      string
    , ResizableTypedArray<TypedArrayConstructor>
    > = fromEntries(
      structureEntries.map(([name, constructor]) => {
        const array = new ResizableTypedArray(constructor, {
          maxCapacity
        , initialCapacity: options.initialCapacity
        , growthFactor: options.growthFactor
        })
        return [name, array]
      })
    )

    const containers = Object.values(nameToResizableTypedArray)
    this.containers = containers as NonEmptyArray<
      ResizableTypedArray<TypedArrayConstructor>
    >
    this.firstContainer = containers[0]

    const nameToTypedArray: Record<string, TypedArray> = fromEntries(
      Object.entries(nameToResizableTypedArray)
        .map(([name, array]) => [name, array.internalTypedArray])
    )
    this.arrays = nameToTypedArray as TypedArraysOfStructure<T>
  }

  ensure(index: number): void {
    if (index >= this.firstContainer.capacity) {
      this.containers.forEach(container => container.set(index, 0))
    }
  }
}
