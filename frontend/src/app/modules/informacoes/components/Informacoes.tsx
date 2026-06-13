import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
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
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { getUserPermissions } from '@/app/utils/permissions'

export function Informacoes() {
  const { functions } = useAuth()
  const permissions = getUserPermissions(functions)
  const canEdit = permissions.canEditInformation

  const contacts = [
    {
      category: 'Administração',
      items: [
        {
          name: 'Administradora Silva & Santos',
          phone: '(61) 3456-7890',
          email: 'contato@silvaesantos.com.br',
          hours: 'Seg-Sex: 9h às 18h',
        },
        {
          name: 'Síndico - João Santos',
          phone: '(61) 98765-4321',
          email: 'sindico@condominio.com',
          hours: 'Plantão: Terça 19h-21h',
        },
      ],
    },
    {
      category: 'Emergências',
      items: [
        {
          name: 'Portaria 24h',
          phone: '(61) 3456-7891',
          email: 'portaria@condominio.com',
          hours: '24 horas',
        },
        {
          name: 'Bombeiros',
          phone: '193',
          email: '-',
          hours: '24 horas',
        },
        {
          name: 'Polícia',
          phone: '190',
          email: '-',
          hours: '24 horas',
        },
        {
          name: 'SAMU',
          phone: '192',
          email: '-',
          hours: '24 horas',
        },
      ],
    },
    {
      category: 'Manutenção',
      items: [
        {
          name: 'Zelador - Carlos',
          phone: '(61) 98888-7777',
          email: 'manutencao@condominio.com',
          hours: 'Seg-Sáb: 8h às 17h',
        },
        {
          name: 'Eletricista de Plantão',
          phone: '(61) 99999-8888',
          email: '-',
          hours: 'Emergências 24h',
        },
      ],
    },
  ]

  const rules = [
    {
      category: 'Horários',
      icon: Clock,
      items: [
        'Silêncio obrigatório das 22h às 8h',
        'Mudanças permitidas apenas das 8h às 17h',
        'Uso da piscina: 6h às 22h',
        'Academia: Seg-Sex 6h-22h, Sáb-Dom 8h-18h',
      ],
    },
    {
      category: 'Áreas Comuns',
      icon: Building2,
      items: [
        'Reserva de churrasqueiras com 48h de antecedência',
        'Salão de festas: máximo 80 pessoas',
        'Proibido som automotivo após 22h',
        'Pets devem circular com guia e focinheira',
      ],
    },
    {
      category: 'Segurança',
      icon: Shield,
      items: [
        'Visitantes devem ser cadastrados pelo morador',
        'Acesso às garagens apenas com controle',
        'Proibido estacionar em vagas de visitantes',
        'Câmeras de segurança 24h em operação',
      ],
    },
    {
      category: 'Lixo e Reciclagem',
      icon: AlertTriangle,
      items: [
        'Lixo comum: todos os dias até 20h',
        'Reciclagem: terças e quintas',
        'Lixo orgânico: sacos bem fechados',
        'Eletrônicos: ponto de coleta na portaria',
      ],
    },
  ]

  const documents = [
    {
      name: 'Regimento Interno',
      description: 'Normas e regulamentos do condomínio',
      size: '2.3 MB',
      updated: 'Janeiro 2026',
    },
    {
      name: 'Convenção do Condomínio',
      description: 'Documento de constituição e normas gerais',
      size: '1.8 MB',
      updated: 'Dezembro 2025',
    },
    {
      name: 'Ata da Última Assembleia',
      description: 'Decisões da assembleia de Dezembro/2025',
      size: '856 KB',
      updated: 'Dezembro 2025',
    },
    {
      name: 'Manual de Boas Práticas',
      description: 'Guia de convivência e uso das áreas comuns',
      size: '1.2 MB',
      updated: 'Novembro 2025',
    },
    {
      name: 'Tabela de Multas',
      description: 'Valores de multas por infrações',
      size: '524 KB',
      updated: 'Janeiro 2026',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Informações
            </h1>
            <p className="text-muted-foreground mt-1">
              Regras, contatos e documentos importantes
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
            <Pencil className="w-4 h-4 text-primary flex-shrink-0" />
            <span>
              Você tem permissão para editar informações. A persistência no
              backend será adicionada em uma próxima versão; por enquanto o
              conteúdo é estático.
            </span>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          {/* Contacts */}
          <TabsContent value="contacts" className="space-y-6">
            {contacts.map((section) => (
              <div key={section.category}>
                <h3 className="text-lg font-semibold mb-4">
                  {section.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((contact, index) => (
                    <Card
                      key={index}
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

            {/* Condominium Address */}
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
                    <h4 className="font-semibold mb-4">Residencial Vyzin</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Rua
                        </p>
                        <p className="font-medium">Rua das Flores</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Número
                        </p>
                        <p className="font-medium">1234</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Bairro
                        </p>
                        <p className="font-medium">Jardim Primavera</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Cidade
                        </p>
                        <p className="font-medium">Brasília</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Estado
                        </p>
                        <p className="font-medium">DF</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          CEP
                        </p>
                        <p className="font-medium">01234-567</p>
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

          {/* Rules */}
          <TabsContent value="rules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map((section) => {
                const Icon = section.icon
                return (
                  <Card key={section.category} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        {section.category}
                      </h3>
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

            {/* Important Notice */}
            <Card className="p-6 bg-orange-500/5 border-orange-500/20">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Importante</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    O descumprimento das regras do condomínio está sujeito a
                    multas conforme previsto na convenção. Em caso de dúvidas,
                    consulte o síndico ou a administração.
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Tabela de Multas
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Documentos oficiais e informativos do condomínio
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {documents.map((doc, index) => (
                <Card
                  key={index}
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
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Help Section */}
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar E-mail
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
