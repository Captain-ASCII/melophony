
import AuthenticationAspect from '@api/AuthenticationAspect'
import UserAspect from '@api/UserAspect'

import TestUtils from '@tests/TestUtils'

import User from '@models/User'

describe('Test UserAspect.ts', () => {

  let authAspect: AuthenticationAspect
  let userAspect: UserAspect

  let userId: number
  const user = new User('d.benlulu25@gmail.com', 'Dan', 'Ben-Lulu', 'mypassword', [], [], [])

  beforeAll(async () => {
    await TestUtils.connect()
    authAspect = new AuthenticationAspect()
    userAspect = new UserAspect()
  })

  afterAll(async () => {
    await TestUtils.disconnect()
  })

  test('should create a new user', async () => {
    const result = await userAspect.register(user)

    expect(result.getStatus()).toBe(200)
    expect(result.getData()).not.toBeNull()
    userId = result.getData()
  })

  test('should get the newly created user', async () => {
    const result = await userAspect.getUser(userId)
    expect(result.getStatus()).toBe(200)
  })

  test('should modify the user\'s first name', async () => {
    const user = (await userAspect.getUser(userId)).getData() as User

    const firstName = 'Daniel'
    user.firstName = firstName

    const modification = await userAspect.modifyUser(userId, { ...user } as User)
    expect(modification.getStatus()).toBe(200)
    expect(modification.getData()).not.toBeNull()

    const result = await userAspect.getUser(userId)
    expect(result.getStatus()).toBe(200)
    expect(result.getData().firstName).toBe(firstName)
  })

  test('should refuse authentication', async () => {
    const result = await authAspect.authenticate(user.email, 'hello')
    expect(result.getStatus()).toBe(400)
  })

  test('should authenticate user', async () => {
    const result = await authAspect.authenticate(user.email, user.password)
    expect(result.getStatus()).toBe(200)
  })

  test('should delete user', async () => {
    const deletion = await userAspect.deleteUser(userId, userId)
    expect(deletion.getStatus()).toBe(200)

    const result = await userAspect.getUser(userId)
    expect(result.getStatus()).toBe(400)
  })

  test('should not delete another user', async () => {
    const registration = await userAspect.register({ ...user, email: 'anotherUser@gmail.com' } as User)
    const newUserId = registration.getData()

    const deletion = await userAspect.deleteUser(userId, newUserId)
    expect(deletion.getStatus()).toBe(400)

    const result = await userAspect.getUser(newUserId)
    const newUser = result.getData() as User
    expect(result.getStatus()).toBe(200)
    expect(newUser.email).toEqual('anotherUser@gmail.com')
  })
})