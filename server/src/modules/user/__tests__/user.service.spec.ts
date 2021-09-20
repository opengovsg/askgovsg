import { UserService } from '../user.service'

describe('UserService', () => {
  const userService = new UserService()

  afterEach(async () => {
    jest.clearAllMocks()
  })

  describe('loadUser', () => {
    it('should return a user given a valid user ID', async () => {
      // Arrange
      const id = 4

      // Act
      const mockUser = await userService.loadUser(id)

      // Assert
      expect(mockUser?.username).toBe('enquiries@was.gov.sg')
      expect(mockUser?.displayname).toBe('Enquiries @ WAS')
      expect(mockUser?.views).toBe(0)
      expect(mockUser?.agencyId).toBe(4)
    })

    it('should return null when the user ID is invalid', async () => {
      //Arrange
      const id = 2

      // Act
      const mockUser = await userService.loadUser(id)

      expect(mockUser).toBeNull()
    })
  })
})
