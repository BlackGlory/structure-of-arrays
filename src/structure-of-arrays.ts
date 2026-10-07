import { TypedArray } from 'justypes'
import { fromEntries, isntEmptyArray } from 'extra-utils'
import { TypedArraysOfStructure, Structure } from './types.js'
import { assert } from '@blackglory/prelude'

interface IStructureOfArraysOptions<T extends Structure> {
  structure: T
  length: number
}

export class StructureOfArrays<T extends Structure> {
  readonly arrays: TypedArraysOfStructure<T>
  readonly length: number

  constructor(options: IStructureOfArraysOptions<T>) {
    const structureEntries = Object.entries(options.structure)
    assert(
      isntEmptyArray(structureEntries)
    , 'The structure should have at least one property'
    )

    const length = options.length
    this.length = length

    const nameToTypedArray: Record<string, TypedArray> = fromEntries(
      structureEntries.map(([name, constructor]) => {
        const array = new constructor(length)
        return [name, array]
      })
    )
    this.arrays = nameToTypedArray as TypedArraysOfStructure<T>
  }
}
