import { TypedArrayConstructor, TypedArrayOfConstructor } from 'justypes'

export type Structure = Record<string, TypedArrayConstructor>

export type TypedArraysOfStructure<T extends Structure> = {
  [Name in keyof T]: TypedArrayOfConstructor<T[Name]>
}
