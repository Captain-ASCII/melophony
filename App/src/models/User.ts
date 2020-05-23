
export default class User {

  private id: number
  private firstName: string
  private lastName: string
  private email: string

  public constructor(id: number, firstName: string, lastName: string, email: string) {
    this.id = id
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
  }

  public clone({ id = this.id, firstName = this.firstName, lastName = this.lastName, email = this.email }) {
    return new User(id, firstName, lastName, email)
  }

  public static fromObject({ id = 0, firstName = '', lastName = '', email = '' }) {
    return new User(id, firstName, lastName, email)
  }

  getId(): number {
    return this.id
  }

  getFirstName(): string {
    return this.firstName
  }

  getLastName(): string {
    return this.lastName
  }

  getEmail(): string {
    return this.email
  }
}