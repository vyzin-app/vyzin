import { useEffect, useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Plus, Trash2 } from 'lucide-react'
import { informationRepository } from '@/app/data/informationRepository'
import type {
  CondoContact,
  CondoDocument,
  CondoInformation,
  CondoInformationInput,
  CondoRuleSection,
} from '@/app/domain/information'

const RULE_ICON_OPTIONS = [
  { value: 'Clock', label: 'Horários' },
  { value: 'Building2', label: 'Áreas comuns' },
  { value: 'Shield', label: 'Segurança' },
  { value: 'AlertTriangle', label: 'Avisos' },
]

const CONTACT_CATEGORIES = [
  'Administração',
  'Emergências',
  'Manutenção',
  'Outros',
]

function cloneForEdit(source: CondoInformation): CondoInformationInput {
  return {
    contacts: source.contacts.map((contact) => ({ ...contact })),
    rules: source.rules.map((rule) => ({
      ...rule,
      items: [...rule.items],
    })),
    documents: source.documents.map((document) => ({ ...document })),
    address: { ...source.address },
    notice: source.notice ?? '',
  }
}

interface InformacoesEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  information: CondoInformation
  onSaved: (updated: CondoInformation) => void
}

export function InformacoesEditDialog({
  open,
  onOpenChange,
  information,
  onSaved,
}: InformacoesEditDialogProps) {
  const [draft, setDraft] = useState<CondoInformationInput>(() =>
    cloneForEdit(information),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(cloneForEdit(information))
      setError(null)
    }
  }, [open, information])

  function updateContact(index: number, patch: Partial<CondoContact>) {
    setDraft((current) => ({
      ...current,
      contacts: current.contacts.map((contact, i) =>
        i === index ? { ...contact, ...patch } : contact,
      ),
    }))
  }

  function addContact() {
    setDraft((current) => ({
      ...current,
      contacts: [
        ...current.contacts,
        {
          id: `c${Date.now()}`,
          category: 'Administração',
          name: '',
          phone: '',
          email: '-',
          hours: '',
        },
      ],
    }))
  }

  function removeContact(index: number) {
    setDraft((current) => ({
      ...current,
      contacts: current.contacts.filter((_, i) => i !== index),
    }))
  }

  function updateRule(index: number, patch: Partial<CondoRuleSection>) {
    setDraft((current) => ({
      ...current,
      rules: current.rules.map((rule, i) =>
        i === index ? { ...rule, ...patch } : rule,
      ),
    }))
  }

  function updateRuleItems(index: number, text: string) {
    updateRule(index, {
      items: text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    })
  }

  function addRule() {
    setDraft((current) => ({
      ...current,
      rules: [
        ...current.rules,
        {
          id: `r${Date.now()}`,
          category: 'Nova seção',
          icon: 'Info',
          items: [],
        },
      ],
    }))
  }

  function removeRule(index: number) {
    setDraft((current) => ({
      ...current,
      rules: current.rules.filter((_, i) => i !== index),
    }))
  }

  function updateDocument(index: number, patch: Partial<CondoDocument>) {
    setDraft((current) => ({
      ...current,
      documents: current.documents.map((document, i) =>
        i === index ? { ...document, ...patch } : document,
      ),
    }))
  }

  function addDocument() {
    setDraft((current) => ({
      ...current,
      documents: [
        ...current.documents,
        {
          id: `d${Date.now()}`,
          name: '',
          description: '',
          size: '-',
          updated: new Date().toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
          }),
          url: '',
        },
      ],
    }))
  }

  function removeDocument(index: number) {
    setDraft((current) => ({
      ...current,
      documents: current.documents.filter((_, i) => i !== index),
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const updated = await informationRepository.update({
        ...draft,
        notice: draft.notice?.trim() || undefined,
        documents: draft.documents.map((document) => ({
          ...document,
          url: document.url?.trim() || undefined,
        })),
      })
      onSaved(updated)
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível salvar as alterações.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar informações do condomínio</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="contacts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="address">Endereço</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            {draft.contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Contato {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Categoria</Label>
                    <Select
                      value={contact.category}
                      onValueChange={(value) =>
                        updateContact(index, { category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Nome</Label>
                    <Input
                      value={contact.name}
                      onChange={(e) =>
                        updateContact(index, { name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Telefone</Label>
                    <Input
                      value={contact.phone}
                      onChange={(e) =>
                        updateContact(index, { phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>E-mail</Label>
                    <Input
                      value={contact.email}
                      onChange={(e) =>
                        updateContact(index, { email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Horário</Label>
                    <Input
                      value={contact.hours}
                      onChange={(e) =>
                        updateContact(index, { hours: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addContact}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar contato
            </Button>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            {draft.rules.map((rule, index) => (
              <div key={rule.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Seção {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Título</Label>
                    <Input
                      value={rule.category}
                      onChange={(e) =>
                        updateRule(index, { category: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Ícone</Label>
                    <Select
                      value={rule.icon}
                      onValueChange={(value) =>
                        updateRule(index, { icon: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RULE_ICON_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Itens (um por linha)</Label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={rule.items.join('\n')}
                    onChange={(e) => updateRuleItems(index, e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addRule}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar seção
            </Button>
            <div className="space-y-1">
              <Label>Aviso importante</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={draft.notice ?? ''}
                onChange={(e) =>
                  setDraft((current) => ({ ...current, notice: e.target.value }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            {draft.documents.map((document, index) => (
              <div
                key={document.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Documento {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Nome</Label>
                    <Input
                      value={document.name}
                      onChange={(e) =>
                        updateDocument(index, { name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Tamanho</Label>
                    <Input
                      value={document.size}
                      onChange={(e) =>
                        updateDocument(index, { size: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Descrição</Label>
                    <Input
                      value={document.description}
                      onChange={(e) =>
                        updateDocument(index, { description: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Atualizado em</Label>
                    <Input
                      value={document.updated}
                      onChange={(e) =>
                        updateDocument(index, { updated: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>URL (opcional)</Label>
                    <Input
                      value={document.url ?? ''}
                      onChange={(e) =>
                        updateDocument(index, { url: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addDocument}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar documento
            </Button>
          </TabsContent>

          <TabsContent value="address" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(
                [
                  ['name', 'Nome do condomínio'],
                  ['street', 'Rua'],
                  ['number', 'Número'],
                  ['neighborhood', 'Bairro'],
                  ['city', 'Cidade'],
                  ['state', 'Estado'],
                  ['zipCode', 'CEP'],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="space-y-1">
                  <Label>{label}</Label>
                  <Input
                    value={draft.address[field]}
                    onChange={(e) =>
                      setDraft((current) => ({
                        ...current,
                        address: { ...current.address, [field]: e.target.value },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
