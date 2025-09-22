export class RegisterDto {
  name: string
  email: string
  password: string
  language?: string
  phone?: string
  roleId?: number
  role?: string    // optional, can provide role directly
}
