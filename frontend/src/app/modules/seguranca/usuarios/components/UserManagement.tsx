import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Badge } from '@/app/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  CreditCard,
  UserCircle,
  Copy,
  CheckCircle2,
  Lock,
  UserCog,
  Loader2,
  Search,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  CreateUserInput,
  ManagedUser,
  userRepository,
} from '@/app/data/userRepository'
import { profileRepository } from '@/app/data/profileRepository'
import { Profile } from '@/app/domain/profile'

function generatePassword(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function formatCPF(value: string) {
  const numbers = value.replace(/\D/g, '')
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, '')
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

interface UserForm {
  name: string
  cpf: string
  phone: string
  email: string
  profileId: string
  apartment: string
  block: string
}

const EMPTY_FORM: UserForm = {
  name: '',
  cpf: '',
  phone: '',
  email: '',
  profileId: 'resident',
  apartment: '',
  block: '',
}

export function UserManagement() {
  const { user: currentUser } = useAuth()
  const isDoorman = currentUser?.profileId === 'doorman'

  const [users, setUsers] = useState<ManagedUser[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [formData, setFormData] = useState<UserForm>(EMPTY_FORM)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    residents: 0,
    others: 0,
  })

  const profileMap = useMemo(
    () => new Map(profiles.map((p) => [p.id, p.name])),
    [profiles],
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const search = searchQuery.trim() || undefined
      const listParams = isDoorman
        ? { search, profileId: 'resident' as const }
        : { search }

      // Doorman lacks `profiles:read`; avoid the 403 by using a local fallback
      // (it only ever manages residents anyway).
      const profileListPromise: Promise<Profile[]> = isDoorman
        ? Promise.resolve([
            {
              id: 'resident',
              name: 'Morador',
              description: '',
              functions: [],
              isSystem: true,
            },
          ])
        : profileRepository.list()

      const [userList, profileList, residentUsers] = await Promise.all([
        userRepository.list(listParams),
        profileListPromise,
        isDoorman
          ? Promise.resolve([])
          : userRepository.list({ search, profileId: 'resident' }),
      ])

      const total = userList.length
      const residents = isDoorman ? total : residentUsers.length

      setUsers(userList)
      setProfiles(profileList)
      setStats({
        total,
        residents,
        others: isDoorman ? 0 : total - residents,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, isDoorman])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadData])

  const canManage = (u: ManagedUser) =>
    !isDoorman || u.profileId === 'resident'

  const selectableProfiles = isDoorman
    ? profiles.filter((p) => p.id === 'resident')
    : profiles

  const handleCreate = () => {
    setEditingUser(null)
    setFormData({
      ...EMPTY_FORM,
      profileId: isDoorman ? 'resident' : profiles[0]?.id ?? 'resident',
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (u: ManagedUser) => {
    setEditingUser(u)
    setFormData({
      name: u.name,
      cpf: u.cpf,
      phone: u.phone,
      email: u.email,
      profileId: u.profileId,
      apartment: u.apartment ?? '',
      block: u.block ?? '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (uid: string) => {
    setDeletingUserId(uid)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingUserId) return
    setSaving(true)
    try {
      await userRepository.remove(deletingUserId)
      setDeletingUserId(null)
      setIsDeleteDialogOpen(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (editingUser) {
        await userRepository.update(editingUser.uid, {
          name: formData.name,
          cpf: formData.cpf,
          phone: formData.phone,
          profileId: isDoorman ? 'resident' : formData.profileId,
          apartment: formData.apartment || undefined,
          block: formData.block || undefined,
        })
        setIsDialogOpen(false)
        await loadData()
      } else {
        const password = generatePassword()
        const input: CreateUserInput = {
          name: formData.name,
          email: formData.email,
          password,
          cpf: formData.cpf,
          phone: formData.phone,
          profileId: isDoorman ? 'resident' : formData.profileId,
          apartment: formData.apartment || undefined,
          block: formData.block || undefined,
        }
        await userRepository.create(input)
        setGeneratedPassword(password)
        setNewUserEmail(formData.email)
        setIsDialogOpen(false)
        setIsSuccessDialogOpen(true)
        setCopiedPassword(false)
        await loadData()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 2000)
  }

  const isFormValid =
    formData.name && formData.cpf && formData.phone && formData.email

  const showApartmentFields =
    formData.profileId === 'resident' || isDoorman

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Gestão de Usuários
            </h1>
            <p className="text-muted-foreground mt-1">
              {isDoorman
                ? 'Cadastre e gerencie moradores do condomínio'
                : 'Cadastre e gerencie usuários do sistema'}
            </p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            {isDoorman ? 'Novo Morador' : 'Novo Usuário'}
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {isDoorman && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
            <Lock className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" />
            <div>
              <p className="font-medium text-sm">Acesso restrito a moradores</p>
              <p className="text-sm text-blue-700 mt-0.5">
                Como porteiro, você pode cadastrar, editar e excluir apenas usuários
                com o perfil <strong>Morador</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Total de Usuários',
              value: stats.total,
              iconBg: 'bg-blue-500',
              Icon: Users,
            },
            {
              label: 'Moradores',
              value: stats.residents,
              iconBg: 'bg-[#10B981]',
              Icon: Users,
            },
            {
              label: 'Outros perfis',
              value: stats.others,
              iconBg: 'bg-purple-500',
              Icon: UserCog,
            },
          ].map((s) => (
            <Card key={s.label} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <h3 className="text-2xl font-semibold mt-1">{s.value}</h3>
                </div>
                <div
                  className={`w-12 h-12 ${s.iconBg} rounded-lg flex items-center justify-center`}
                >
                  <s.Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, CPF ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {users.map((u) => {
            const manageable = canManage(u)
            return (
              <Card
                key={u.uid}
                className={`p-6 transition-shadow ${manageable ? 'hover:shadow-lg' : 'opacity-70'}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">{u.name}</h3>
                        <Badge variant="outline">
                          {profileMap.get(u.profileId) ?? u.profileId}
                        </Badge>
                        {u.apartment && (
                          <Badge
                            variant="outline"
                            className="border-primary/30 text-primary"
                          >
                            Apto {u.apartment} - Bloco {u.block}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          {u.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 flex-shrink-0" />
                          {u.cpf}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {manageable ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(u)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(u.uid)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs px-3 py-1.5 rounded-lg bg-muted/60 border border-border">
                        <Lock className="w-3.5 h-3.5" />
                        Sem permissão
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}

          {users.length === 0 && (
            <Card className="p-12 text-center text-muted-foreground">
              Nenhum usuário cadastrado ainda.
            </Card>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser
                  ? 'Editar Usuário'
                  : isDoorman
                    ? 'Novo Morador'
                    : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({ ...formData, cpf: formatCPF(e.target.value) })
                  }
                  maxLength={14}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: formatPhone(e.target.value),
                    })
                  }
                  maxLength={15}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!!editingUser}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profile">Perfil *</Label>
                {isDoorman ? (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-muted/50">
                    <Badge>Morador</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Porteiros só podem cadastrar moradores
                    </span>
                  </div>
                ) : (
                  <Select
                    value={formData.profileId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, profileId: value })
                    }
                  >
                    <SelectTrigger id="profile">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableProfiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {showApartmentFields && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Apartamento</Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) =>
                        setFormData({ ...formData, apartment: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="block">Bloco</Label>
                    <Input
                      id="block"
                      value={formData.block}
                      onChange={(e) =>
                        setFormData({ ...formData, block: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => void handleSave()}
                className="bg-primary hover:bg-primary/90"
                disabled={!isFormValid || saving}
              >
                {saving
                  ? 'Salvando...'
                  : editingUser
                    ? 'Salvar Alterações'
                    : 'Criar Usuário'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-6 h-6" />
                Usuário Criado com Sucesso!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                O usuário <strong>{newUserEmail}</strong> foi cadastrado. Senha
                temporária:
              </p>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Input
                    value={generatedPassword}
                    readOnly
                    className="font-mono text-lg"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyPassword}>
                    {copiedPassword ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsSuccessDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação remove o usuário do Firebase Auth e do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void confirmDelete()}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
