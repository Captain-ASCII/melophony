
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

  public clone(user: User): User {
    return new User(user.id, user.firstName, user.lastName, user.email)
  }

  public static fromObject(o: any): User {
    return new User(o.id, o.firstName, o.lastName, o.email)
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