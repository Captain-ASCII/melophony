
export default class Arrays {
  
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
    return array.filter(condition)
  }
  
  static add(array, element) {
    return [...array, element]
  }
  
  static reverse(array) {
    return [...array].reverse()
  }
}