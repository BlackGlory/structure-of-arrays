import { create, get, set, push } from '@src/type-array-utils'
import { int8, string } from '@src/types'
import { DynamicTypedArray } from '@blackglory/structures'

describe('create', () => {
  test('TypedArray', () => {
    const array = create(int8)

    expect(array).toBeInstanceOf(DynamicTypedArray)
    expect(array.length).toBe(0)
  })

  test('Array', () => {
    const array = create(string)

    expect(array).toBeInstanceOf(Array)
    expect(array.length).toBe(0)
  })
})

describe('get', () => {
  describe('index exists', () => {
    test('TypedArray', () => {
      const array = create(int8)

      const result = get(array, 0)

      expect(result).toBeUndefined()
    })

    test('Array', () => {
      const array = create(string)

      const result = get(array, 0)

      expect(result).toBeUndefined()
    })
  })

  describe('index does not exist', () => {
    test('TypedArray', () => {
      const array = create(int8)
      array.set(0, 1)

      const result = get(array, 0)

      expect(result).toBe(1)
    })

    test('Array', () => {
      const array = create(string)
      array[0] = '1'

      const result = get(array, 0)

      expect(result).toBe('1')
    })
  })
})

describe('set', () => {
  describe('index exists', () => {
    test('TypedArray', () => {
      const array = create(int8)

      set(array, 0, 1)

      expect(array.get(0)).toBe(1)
      expect(array.length).toBe(1)
    })

    test('Array', () => {
      const array = create(string)

      set(array, 0, '1')

      expect(array[0]).toBe('1')
      expect(array.length).toBe(1)
    })
  })

  describe('index does not exist', () => {
    test('TypedArray', () => {
      const array = create(int8)

      set(array, 0, 1)

      expect(array.get(0)).toBe(1)
      expect(array.length).toBe(1)
    })

    test('Array', () => {
      const array = create(string)

      set(array, 0, '1')

      expect(array[0]).toBe('1')
      expect(array.length).toBe(1)
    })
  })
})

describe('push', () => {
  test('TypedArray', () => {
    const array = create(int8)

    push(array, 1, 2)

    expect(array.get(0)).toBe(1)
    expect(array.get(1)).toBe(2)
    expect(array.length).toBe(2)
  })

  test('Array', () => {
    const array = create(string)

    push(array, '1', '2')

    expect(array[0]).toBe('1')
    expect(array[1]).toBe('2')
    expect(array.length).toBe(2)
  })
})
