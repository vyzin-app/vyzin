export interface CondoContact {
  id: string
  category: string
  name: string
  phone: string
  email: string
  hours: string
}

export interface CondoRuleSection {
  id: string
  category: string
  icon: string
  items: string[]
}

export interface CondoDocument {
  id: string
  name: string
  description: string
  size: string
  updated: string
  url?: string
}

export interface CondoAddress {
  name: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface CondoInformation {
  id: string
  contacts: CondoContact[]
  rules: CondoRuleSection[]
  documents: CondoDocument[]
  address: CondoAddress
  notice?: string
}

export type CondoInformationInput = Omit<CondoInformation, 'id'>
