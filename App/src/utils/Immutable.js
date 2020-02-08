
class Arrays {

  static copy(array) {
    return [...array]
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

  static reverse(array) {
    return Arrays.copy(array).reverse()
  }

  static sort(array, sortFct) {
    return Arrays.copy(array).sort(sortFct)
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