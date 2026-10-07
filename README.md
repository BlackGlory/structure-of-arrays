# structure-of-arrays
## Install
```sh
npm install --save structure-of-arrays
# or
yarn add structure-of-arrays
```

## Usage
```ts
import { StructureOfArrays } from 'structure-of-arrays'

const MovableSoA = new StructureOfArrays({
  structure: {
    x: Float64Array
  , y: Float64Array
  , vx: Float64Array
  , vy: Float64Array
  }
, length: 1000
})

const Movable = MovableSoA.arrays
for (let i = 0; i < MovableSoA.length; i++) {
  Movable.x[i] += Movable.vx[i]
  Movable.y[i] += Movable.vy[i]
}
```

## API
```ts
type Structure = Record<string, TypedArrayConstructor>

type TypedArraysOfStructure<T extends Structure> = {
  [Name in keyof T]: TypedArrayOfConstructor<T[Name]>
}
```

### StructureOfArrays
```ts
interface IStructureOfArraysOptions<T extends Structure> {
  structure: T
  length: number
}

class StructureOfArrays<T extends Structure> {
  readonly arrays: TypedArraysOfStructure<T>
  readonly length: number

  constructor(options: IStructureOfArraysOptions<T>)
}
```

### StructureOfResizableArrays
```ts
interface IStructureOfResizableArraysOptions<T extends Structure> {
  structure: T
  maxCapacity: number

  initialCapacity?: number
  growthFactor?: number
}

class StructureOfResizableArrays<T extends Structure> {
  readonly arrays: TypedArraysOfStructure<T>
  readonly maxCapacity: number

  get length(): number

  constructor(options: IStructureOfResizableArraysOptions<T>)

  ensure(index: number): void
}
```

### StructureOfSparseMaps
```ts
interface IStructureOfSparseMapsOptions<T extends Structure> {
  structure: T
  keys: UnsignedTypedArrayConstructor
  capacity: number
}

class StructureOfSparseMaps<T extends Structure> {
  readonly arrays: TypedArraysOfStructure<T>
  readonly capacity: number

  get length(): number

  constructor(options: IStructureOfSparseMapsOptions<T>)

  keys(): IterableIterator<number>

  getIndexByKey(key: number): number | undefined

  register(key: number): void
  unregister(key: number): void
}
```

### StructureOfResizableSparseMaps
```ts
interface IStructureOfResizableSparseMapsOptions<T extends Structure> {
  structure: T
  keys: UnsignedTypedArrayConstructor
  maxCapacity: number

  initialCapacity?: number
  growthFactor?: number
}

class StructureOfResizableSparseMaps<T extends Structure> {
  readonly arrays: TypedArraysOfStructure<T>
  readonly maxCapacity: number

  get length(): number

  constructor(options: IStructureOfResizableSparseMapsOptions<T>)

  keys(): IterableIterator<number>

  getIndexByKey(key: number): number | undefined

  register(key: number): void
  unregister(key: number): void
}
```
