import { AppFunction } from './appFunction'

export interface Profile {
  id: string
  name: string
  description: string
  functions: AppFunction[]
  isSystem: boolean
}
