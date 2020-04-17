
class IntegrityResult {

  private result: boolean
  private messages: Array<string>

  constructor(result = true, message = '') {
    this.result = result
    this.messages = [ message ]
  }

  public withResult(test: IntegrityResult): void {
    this.result = this.result && test.isCorrect()
    this.messages = [ ...this.messages, ...test.getMessages() ]
  }

  public isCorrect(): boolean {
    return this.result
  }

  public getMessages(): Array<string> {
    return this.result ? [] : this.messages
  }
}

export default class IntegrityUtils {
  static assertRequired(requiredFields: Array<string>, object: object): IntegrityResult {
    let result = true
    const missingFields = []

    for (const field of requiredFields) {
      if (!(field in object)) {
        result = false
        missingFields.push(field)
      }
    }

    return new IntegrityResult(result, `Few required fields are not present: ${missingFields}`)
  }
}

export { IntegrityResult }