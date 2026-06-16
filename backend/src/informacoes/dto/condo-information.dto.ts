import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ContactDTO {
  @IsString()
  id: string;

  @IsString()
  category: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  hours: string;
}

class RuleSectionDTO {
  @IsString()
  id: string;

  @IsString()
  category: string;

  @IsString()
  icon: string;

  @IsArray()
  @IsString({ each: true })
  items: string[];
}

class DocumentDTO {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  size: string;

  @IsString()
  updated: string;

  @IsOptional()
  @IsString()
  url?: string;
}

class AddressDTO {
  @IsString()
  name: string;

  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsString()
  neighborhood: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;
}

export class CondoInformationDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDTO)
  contacts: ContactDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleSectionDTO)
  rules: RuleSectionDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDTO)
  documents: DocumentDTO[];

  @ValidateNested()
  @Type(() => AddressDTO)
  address: AddressDTO;

  @IsOptional()
  @IsString()
  notice?: string;
}
