
class Arrays {

  static copy<T>(array: Array<T>): Array<T> {
    return [...array]
  }

  static update<T>(array: Array<T>, oldElement: T, newElement: T): Array<T> {
    return Arrays.updateAt(array, newElement, array.findIndex((element: T) => oldElement === element))
  }

  static updateAt<T>(array: Array<T>, newElement: T, index: number): Array<T> {
    const copy = Arrays.copy(array)
    copy[index] = newElement
    return copy
  }

  static updateWithCondition<T>(array: Array<T>, element: T, condition: (e: T) => boolean): Array<T> {
    const copy = Arrays.copy(array)
    const index = copy.findIndex(condition)
    copy[index] = element
    return copy
  }

  static remove<T>(array: Array<T>, condition: (element: T) => boolean): Array<T> {
    return array.filter(element => !condition(element))
  }

  static removeAt<T>(array: Array<T>, index: number): Array<T> {
    if (index === undefined || index < 0 || index >= array.length) {
      return array
    }
    return [ ...array.slice(0, index), ...array.slice(index + 1) ]
  }

  static add<T>(array: Array<T>, element: T): Array<T> {
    return [...array, element]
  }

  static pop<T>(array: Array<T>): [T, Array<T>] {
    return [ array[0], array.slice(1) ]
  }

  static reverse<T>(array: Array<T>): Array<T> {
    return Arrays.copy(array).reverse()
  }

  static sort<T>(array: Array<T>, sortFct: (a: T, b: T) => number): Array<T> {
    return Arrays.copy(array).sort(sortFct)
  }

  static shuffle<T>(array: Array<T>): Array<T> {
    const copy = Arrays.copy(array)
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = copy[i]
      copy[i] = copy[j]
      copy[j] = tmp
    }
    return copy
  }
}

class Objects {
  static copy(object: {[key: string]: any}): {[key: string]: any} {
    return {...object}
  }

  static update(object: {[key: string]: any}, id: string, element: any): {[key: string]: any} {
    const copy = Objects.copy(object)
    copy[id] = element
    return copy
  }

  static removeAt(object: {[key: string]: any}, id: string): {[key: string]: any} {
    const copy = Objects.copy(object)
    delete copy[id]
    return copy
  }

  static remove(object: {[key: string]: any}, condition: (...args: Array<any>) => boolean): {[key: string]: any} {
    const copy = Objects.copy(object)
    for (const i in copy) {
      if (condition(copy[i])) {
        delete copy[i]
      }
    }
    return copy
  }

  static add(object: {[key: string]: any}, id: string, element: any): {[key: string]: any} {
    return Objects.update(object, id, element)
  }

  static isEmpty(object: {[key: string]: any}): boolean {
    return Object.keys(object).length === 0
  }
}

export { Arrays, Objects }