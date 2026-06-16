import {
  CondoInformation,
  CondoInformationInput,
} from '../domain/information'
import { apiClient } from '../infra/http/api'

export interface InformationRepository {
  get(): Promise<CondoInformation>
  update(input: CondoInformationInput): Promise<CondoInformation>
}

class HttpInformationRepository implements InformationRepository {
  get(): Promise<CondoInformation> {
    return apiClient.get<CondoInformation>('/information')
  }

  update(input: CondoInformationInput): Promise<CondoInformation> {
    return apiClient.put<CondoInformation>('/information', input)
  }
}

export const informationRepository: InformationRepository =
  new HttpInformationRepository()
