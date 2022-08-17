# structure-of-arrays
## Install
```sh
npm install --save structure-of-arrays
# or
yarn add structure-of-arrays
```

## Usage
```ts
import { StructureOfArrays, double } from 'structure-of-arrays'

const structure = {
  x: double
, y: double
, vx: double
, vy: double
}

const Movable = new StructureOfArrays(structure)
const [player, enemy] = Movable.add([
  {
    x: 0
  , y: 0
  , vx: 0
  , vy: 0
  }
, {
    x: 100
  , y: 0
  , vx: -1
  , vy: 0
  }
])

for (const index of Movable.indexes()) {
  Movable.set(index, 'x', Movable.get(index, 'x') + Movable.get(index, 'vx'))
  Movable.set(index, 'y', Movable.get(index, 'y') + Movable.get(index, 'vy'))
}
// or
for (const index of Movable.indexes()) {
  Movable.arrays.x[index] += Movable.arrays.vx[index]
  Movable.arrays.y[index] += Movable.arrays.vy[index]
}
```

## API
```ts
import { DynamicTypedArray } from '@blackglory/structures'

type Structure = Record<string, Type>

type StructureInternalArrays<T extends Structure> = {
  [Key in keyof T]: InternalArrayOfTypeArrayConsturctor<T[Key]>
}

type StructurePrimitive<T extends Structure> = {
  [Key in keyof T]: PrimitiveOfType<T[Key]>
}

type StructureArrays<T extends Structure> = {
  [Key in keyof T]: TypeArrayOfType<T[Key]>
}

type PrimitiveOfTypeArray<T extends TypeArray> =
  T extends DynamicTypedArray<any> ? number
: T extends boolean[] ? boolean
: T extends string[] ? string
: never

type TypeArrayOfType<T extends Type> =
  T extends typeof int8 ? DynamicTypedArray<typeof int8>
: T extends typeof uint8 ? DynamicTypedArray<typeof uint8>
: T extends typeof int16 ? DynamicTypedArray<typeof int16>
: T extends typeof uint16 ? DynamicTypedArray<typeof uint16>
: T extends typeof int32 ? DynamicTypedArray<typeof int32>
: T extends typeof uint32 ? DynamicTypedArray<typeof uint32>
: T extends typeof float ? DynamicTypedArray<typeof float>
: T extends typeof double ? DynamicTypedArray<typeof double>
: T extends typeof boolean ? boolean[]
: T extends typeof string ? string[]
: never

type TypeArray =
| DynamicTypedArray<typeof int8>
| DynamicTypedArray<typeof uint8>
| DynamicTypedArray<typeof int16>
| DynamicTypedArray<typeof uint16>
| DynamicTypedArray<typeof int32>
| DynamicTypedArray<typeof uint32>
| DynamicTypedArray<typeof float>
| DynamicTypedArray<typeof double>
| boolean[]
| string[]
```

### StructureOfArrays
```ts
class StructureOfArrays<T extends Stucture> {
  /**
   * Note that `StructureOfArrays` cannot respond to any operations on the internal arrays,
   * you must make sure that indexes being accessed are within bounds and not deleted.
   */
  readonly arrays: StructureInternalArrays<T>

  indexes(): Iterable<number>

  has(index: number): boolean

  /**
   * @throws {RangeError}
   */
  get<U extends keyof T>(index: number, key: U): PrimitiveOfType<T[U]>

  tryGet<U extends keyof T>(index: number, key: U): PrimitiveOfType<T[U]> | undefined

  add(...structures: Array<StructurePrimitive<T>>): number[]

  /**
   * @throws {RangeError}
   */
  set<U extends keyof T>(
    index: number
  , key: U
  , value: PrimitiveOfTypeArray<StructureArrays<T>[U]>
  ): void

  trySet<U extends keyof T>(
    index: number
  , key: U
  , value: PrimitiveOfTypeArray<StructureArrays<T>[U]>
  ): boolean

  delete(index: number): void
}
```

### Type
```ts
type Type =
| typeof int8
| typeof uint8
| typeof int16
| typeof uint16
| typeof int32
| typeof uint32
| typeof float
| typeof double
| typeof boolean
| typeof string

const int8 = Int8Array
const uint8 = Uint8Array
const int16 = Int16Array
const uint16 = Uint16Array
const int32 = Int32Array
const uint32 = Uint32Array
const float = Float32Array
const double = Float64Array
const string = String
const boolean = Boolean
```
