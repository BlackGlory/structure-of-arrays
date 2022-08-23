import { create, get, set, remove } from '@src/structure-of-sparse-maps/utils'
import { int8, string } from '@src/types'
import { SparseMap, TypedSparseMap } from '@blackglory/structures'

describe('create', () => {
  test('TypedSparseMap', () => {
    const map = create(int8)

    expect(map).toBeInstanceOf(TypedSparseMap)
    expect(map.size).toBe(0)
  })

  test('SparseMap', () => {
    const map = create(string)

    expect(map).toBeInstanceOf(SparseMap)
    expect(map.size).toBe(0)
  })
})

describe('get', () => {
  describe('index does not exist', () => {
    test('TypedSparseMap', () => {
      const map = create(int8)

      const result = map.get(0)

      expect(result).toBe(undefined)
    })
    
    test('SparseMap', () => {
      const map = create(string)

      const result = map.get(0)

      expect(result).toBe(undefined)
    })
  })

  describe('index exists', () => {
    test('TypedSparseMap', () => {
      const map = create(int8)
      map.set(0, 1)

      const result = get(map, 0)

      expect(result).toBe(1)
    })

    test('SparseMap', () => {
      const map = create(string)
      map.set(0, '1')

      const result = get(map, 0)

      expect(result).toBe('1')
    })
  })
})

describe('set', () => {
  describe('index exists', () => {
    test('SparseMap', () => {
      const map = create(string)
      map.set(0, '1')

      set(map, 0, '2')

      expect(map.get(0)).toBe('2')
      expect(map.size).toBe(1)
    })

    test('TypedSparseMap', () => {
      const map = create(int8)
      map.set(0, 1)

      set(map, 0, 2)

      expect(map.get(0)).toBe(2)
      expect(map.size).toBe(1)
    })
  })

  describe('index does not exist', () => {
    test('SparseMap', () => {
      const map = create(string)

      set(map, 0, '1')

      expect(map.get(0)).toBe('1')
      expect(map.size).toBe(1)
    })

    test('TypedSparseMap', () => {
      const map = create(int8)

      set(map, 0, 1)

      expect(map.get(0)).toBe(1)
      expect(map.size).toBe(1)
    })
  })
})

describe('remove', () => {
  describe('does not exist', () => {
    test('SparseMap', () => {
      const map = create(string)

      remove(map, 1)

      expect(map.get(0)).toBe(undefined)
      expect(map.size).toBe(0)
    })

    test('TypedSparseMap', () => {
      const map = create(int8)

      remove(map, 1)

      expect(map.get(0)).toBe(undefined)
      expect(map.size).toBe(0)
    })
  })

  describe('exists', () => {
    test('SparseMap', () => {
      const map = create(string)
      map.set(0, '1')
      map.set(1, '2')

      remove(map, 1)

      expect(map.get(0)).toBe('1')
      expect(map.get(1)).toBe(undefined)
      expect(map.size).toBe(1)
    })

    test('TypedSparseMap', () => {
      const map = create(int8)
      map.set(0, 1)
      map.set(1, 2)

      remove(map, 1)

      expect(map.get(0)).toBe(1)
      expect(map.get(1)).toBe(undefined)
      expect(map.size).toBe(1)
    })
  })
})
