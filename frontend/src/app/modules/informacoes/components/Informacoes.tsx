import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import {
  Info,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Building2,
  Shield,
  AlertTriangle,
  Download,
  ExternalLink,
  Pencil,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { getUserPermissions } from '@/app/utils/permissions'
import { informationRepository } from '@/app/data/informationRepository'
import type { CondoInformation, CondoContact } from '@/app/domain/information'
import { InformacoesEditDialog } from './InformacoesEditDialog'

const RULE_ICONS: Record<string, LucideIcon> = {
  Clock,
  Building2,
  Shield,
  AlertTriangle,
}

function groupContactsByCategory(contacts: CondoContact[]) {
  const map = new Map<string, CondoContact[]>()
  for (const contact of contacts) {
    const list = map.get(contact.category) ?? []
    list.push(contact)
    map.set(contact.category, list)
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }))
}

export function Informacoes() {
  const { functions } = useAuth()
  const permissions = getUserPermissions(functions)
  const canEdit = permissions.canEditInformation

  const [information, setInformation] = useState<CondoInformation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const loadInformation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await informationRepository.get()
      setInformation(data)
    } catch {
      setError('Não foi possível carregar as informações do condomínio.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInformation()
  }, [loadInformation])

  const contactSections = useMemo(
    () => groupContactsByCategory(information?.contacts ?? []),
    [information?.contacts],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 text-muted-foreground">
        Carregando informações…
      </div>
    )
  }

  if (error || !information) {
    return (
      <div className="min-h-screen bg-background p-6">
        <p className="text-destructive">{error ?? 'Dados indisponíveis.'}</p>
        <Button className="mt-4" variant="outline" onClick={() => void loadInformation()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const { rules, documents, address, notice } = information

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Informações
            </h1>
            <p className="text-muted-foreground mt-1">
              Regras, contatos e documentos importantes
            </p>
          </div>
          {canEdit && information && (
            <Button onClick={() => setIsEditOpen(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
            <Info className="w-4 h-4 text-primary flex-shrink-0" />
            <span>
              Você pode editar contatos, regras, documentos e endereço. As
              alterações são salvas no banco de dados do condomínio.
            </span>
          </div>
        )}

        <InformacoesEditDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          information={information}
          onSaved={setInformation}
        />

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-6">
            {contactSections.map((section) => (
              <div key={section.category}>
                <h3 className="text-lg font-semibold mb-4">{section.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((contact) => (
                    <Card
                      key={contact.id}
                      className="p-6 hover:shadow-lg transition-shadow"
                    >
                      <h4 className="font-semibold mb-4">{contact.name}</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-muted-foreground text-xs mb-1">
                              Telefone
                            </p>
                            <a
                              href={`tel:${contact.phone.replace(/\D/g, '')}`}
                              className="text-primary hover:underline"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        </div>
                        {contact.email !== '-' && (
                          <div className="flex items-start gap-3 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-muted-foreground text-xs mb-1">
                                E-mail
                              </p>
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-primary hover:underline"
                              >
                                {contact.email}
                              </a>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-muted-foreground text-xs mb-1">
                              Horário
                            </p>
                            <p>{contact.hours}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Endereço do Condomínio
              </h3>
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-4">{address.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Rua</p>
                        <p className="font-medium">{address.street}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Número
                        </p>
                        <p className="font-medium">{address.number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Bairro
                        </p>
                        <p className="font-medium">{address.neighborhood}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Cidade
                        </p>
                        <p className="font-medium">{address.city}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Estado
                        </p>
                        <p className="font-medium">{address.state}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">CEP</p>
                        <p className="font-medium">{address.zipCode}</p>
                      </div>
                    </div>
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver no Mapa
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map((section) => {
                const Icon = RULE_ICONS[section.icon] ?? Info
                return (
                  <Card key={section.id} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{section.category}</h3>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item, index) => (
                        <li key={index} className="flex gap-3 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )
              })}
            </div>

            {notice && (
              <Card className="p-6 bg-orange-500/5 border-orange-500/20">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Importante</h4>
                    <p className="text-sm text-muted-foreground">{notice}</p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Documentos oficiais e informativos do condomínio
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-1">{doc.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {doc.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Atualizado em {doc.updated}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {doc.url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visualizar
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        disabled={!doc.url}
                        asChild={Boolean(doc.url)}
                      >
                        {doc.url ? (
                          <a href={doc.url} download>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-blue-500/5 border-blue-500/20 mt-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">
                    Precisa de um documento específico?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Entre em contato com a administração para solicitar outros
                    documentos ou esclarecimentos sobre as normas do condomínio.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
