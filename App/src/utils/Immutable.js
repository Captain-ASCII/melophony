
class Arrays {

  static copy(array) {
    if (array) {
      return [...array]
    }
    return null
  }

  static update(array, id, element) {
    let copy = Arrays.copy(array)
    const index = copy.findIndex(element => element.id === id)
    copy[index] = element
    return copy
  }

  static remove(array, condition) {
    return array.filter(element => !condition(element))
  }

  static add(array, element) {
    return [...array, element]
  }

  static pop(array) {
    return [ array[0], array.slice(1) ]
  }

  static reverse(array) {
    return Arrays.copy(array).reverse()
  }

  static sort(array, sortFct) {
    return Arrays.copy(array).sort(sortFct)
  }

  static shuffle(array) {
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
  static copy(object) {
    return {...object}
  }

  static update(object, id, element) {
    let copy = Objects.copy(object)
    copy[id] = element
    return copy
  }

  static removeAt(object, id) {
    let copy = Objects.copy(object)
    delete copy[id]
    return copy
  }

  static remove(object, condition) {
    let copy = Objects.copy(object)
    for (const i in copy) {
      if (condition(copy[i])) {
        delete copy[i]
      }
    }
    return copy
  }

  static add(object, id, element) {
    return Objects.update(object, id, element)
  }
}

export { Arrays, Objects }