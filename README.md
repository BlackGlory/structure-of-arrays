# structure-of-arrays
## Install
```sh
npm install --save structure-of-arrays
# or
yarn add structure-of-arrays
```

## Usage
```ts
import { StructureOfArrays, float64 } from 'structure-of-arrays'

const structure = {
  x: float64
, y: float64
, vx: float64
, vy: float64
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
type Structure = Record<string, Type>

type MapTypesOfStructureToPrimitives<T extends Structure> = {
  [Key in keyof T]: PrimitiveOfType<T[Key]>
}

type MapTypesOfStructureToInternalArrays<T extends Structure> = {
  [Key in keyof T]: InternalArrayOfType<T[Key]>
}

type PrimitiveOfType<T extends Type> =
  T extends typeof int8 ? number
: T extends typeof uint8 ? number
: T extends typeof int16 ? number
: T extends typeof uint16 ? number
: T extends typeof int32 ? number
: T extends typeof uint32 ? number
: T extends typeof float32 ? number
: T extends typeof float64 ? number
: T extends typeof boolean ? boolean
: T extends typeof string ? string
: never

type InternalArrayOfType<T extends Type> =
  T extends typeof int8 ? Int8Array
: T extends typeof uint8 ? Uint8Array
: T extends typeof int16 ? Int16Array
: T extends typeof uint16 ? Uint16Array
: T extends typeof int32 ? Int32Array
: T extends typeof uint32 ? Uint32Array
: T extends typeof float32 ? Float32Array
: T extends typeof float64 ? Float64Array
: T extends typeof boolean ? boolean[]
: T extends typeof string ? string[]
: never

type Type =
| typeof int8
| typeof uint8
| typeof int16
| typeof uint16
| typeof int32
| typeof uint32
| typeof float32
| typeof float64
| typeof boolean
| typeof string
```

### StructureOfArrays
```ts
type ValueOfContainer<T extends Container> =
  T extends DynamicTypedArray<any> ? number
: T extends boolean[] ? boolean
: T extends string[] ? string
: never

type StructureContainers<T extends Structure> = {
  [Key in keyof T]: ContainerOfType<T[Key]>
}

class StructureOfArrays<T extends Stucture> {
  /**
   * Note that `StructureOfArrays` cannot respond to any operations on the internal arrays,
   * you must make sure that indexes being accessed are within bounds and not deleted.
   */
  readonly arrays: MapStructureToInternalArrays<T>
  readonly keys: string[]

  get length(): number
  get size(): number

  constructor(
    structure: T
  , defaultValuesOfStructure?: MapTypesOfStructureToPrimitives<T>
  )

  indexes(): Iterable<number>

  has(index: number): boolean

  /**
   * @throws {RangeError}
   */
  get<U extends keyof T>(index: number, key: U): PrimitiveOfType<T[U]>

  tryGet<U extends keyof T>(index: number, key: U): PrimitiveOfType<T[U]> | undefined

  addWithDefaultValues(size: number): number[]

  /**
   * Insert items that reuse deleted indexes, return indexes.
   */
  add(...structures: Array<MapStructureToPrimitive<T>>): number[]

  pushWithDefaultValues(size: number): number[]

  /**
   * Insert items at the end of the array, return indexes.
   */
  push(...structures: Array<MapStructureToPrimitive<T>>): number[]

  pop(): void

  /**
   * Insert or update an item based on index.
   */
  upsert(index: number, structure?: MapStructureToPrimitive<T>): void

  /**
   * @throws {RangeError}
   */
  update<U extends keyof T>(
    index: number
  , key: U
  , value: ValueOfContainer<StructureContainers<T>[U]>
  ): void

  tryUpdate<U extends keyof T>(
    index: number
  , key: U
  , value: ValueOfContainer<StructureContainers<T>[U]>
  ): boolean

  delete(index: number): void

  clear(): void
}
```

### StructureOfSparseMaps<T extends Structure>
```ts
type ValueOfContainer<T extends Container> =
  T extends TypedSparseMap<any> ? number
: T extends SparseMap<boolean> ? boolean
: T extends SparseMap<string> ? string
: never

type StructureContainers<T extends Structure> = {
  [Key in keyof T]: ContainerOfType<T[Key]>
}

class StructureOfSparseMaps<T extends Structure> {
  readonly arrays: MapStructureToInternalArrays<T>
  readonly keys: string[]

  get size(): number

  constructor(
    structure: T
  , defaultValuesOfStructure?: MapTypesOfStructureToPrimitives<T>
  )

  keys(): Iterable<string>

  indexes(): Iterable<number>

  has(index: number): boolean

  getInternalIndex(externalIndex: number): number

  tryGetInternalIndex(externalIndex: number): number | undefined

  /**
   * @throws {RangeError}
   */
  get<U extends keyof T>(index: number, key: U): PrimitiveOfType<T[U]>

  tryGet<U extends keyof T>(index: number, key: U): PrimitiveOfType<T[U]> | undefined

  addWithDefaultValues(size: number): number[]

  /**
   * Insert items that reuse deleted indexes, return indexes.
   */
  add(...structures: Array<MapStructureToPrimitive<T>>): number[]

  /**
   * Insert or update an item based on index.
   */
  upsert(index: number, structure?: MapStructureToPrimitive<T>): void

  /**
   * @throws {RangeError}
   */
  update<U extends keyof T>(
    index: number
  , key: U
  , value: ValueOfContainer<StructureContainers<T>[U]>
  ): void

  tryUpdate<U extends keyof T>(
    index: number
  , key: U
  , value: ValueOfContainer<StructureContainers<T>[U]>
  ): boolean

  delete(index: number): void

  clear(): void
}
```
