export interface InformationContact {
  id: string;
  category: string;
  name: string;
  phone: string;
  email: string;
  hours: string;
}

export interface InformationRuleSection {
  id: string;
  category: string;
  icon: string;
  items: string[];
}

export interface InformationDocument {
  id: string;
  name: string;
  description: string;
  size: string;
  updated: string;
  url?: string;
}

export interface CondoAddress {
  name: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CondoInformation {
  id: string;
  contacts: InformationContact[];
  rules: InformationRuleSection[];
  documents: InformationDocument[];
  address: CondoAddress;
  notice?: string;
}

export const INFORMATION_DOCUMENT_ID = 'default';
