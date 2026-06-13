import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Loader2,
} from 'lucide-react'
import { authRepository } from '../data/authRepository'
import { profileRepository } from '../data/profileRepository'
import { AppFunction, FunctionDescriptor } from '../domain/appFunction'
import { Profile } from '../domain/profile'
import { useAuth } from '../contexts/AuthContext'

interface ProfileForm {
  name: string
  description: string
  functions: AppFunction[]
}

const EMPTY_FORM: ProfileForm = {
  name: '',
  description: '',
  functions: [],
}

export function ProfileManagement() {
  const { can } = useAuth()
  const canManage = can(AppFunction.PROFILES_MANAGE)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [catalog, setCatalog] = useState<FunctionDescriptor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileList, functionCatalog] = await Promise.all([
        profileRepository.list(),
        authRepository.listFunctions(),
      ])
      setProfiles(profileList)
      setCatalog(functionCatalog)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfis')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const groupedFunctions = useMemo(() => {
    const groups = new Map<string, FunctionDescriptor[]>()
    for (const item of catalog) {
      const list = groups.get(item.area) ?? []
      list.push(item)
      groups.set(item.area, list)
    }
    return Array.from(groups.entries())
  }, [catalog])

  const toggleFunction = (fn: AppFunction) => {
    setForm((prev) => ({
      ...prev,
      functions: prev.functions.includes(fn)
        ? prev.functions.filter((f) => f !== fn)
        : [...prev.functions, fn],
    }))
  }

  const openCreate = () => {
    setEditingProfile(null)
    setForm(EMPTY_FORM)
    setIsDialogOpen(true)
  }

  const openEdit = (profile: Profile) => {
    setEditingProfile(profile)
    setForm({
      name: profile.name,
      description: profile.description ?? '',
      functions: [...profile.functions],
    })
    setIsDialogOpen(true)
  }

  const openDelete = (profile: Profile) => {
    setDeletingProfile(profile)
    setIsDeleteOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        functions: form.functions,
      }
      if (editingProfile) {
        await profileRepository.update(editingProfile.id, payload)
      } else {
        await profileRepository.create(payload)
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deletingProfile) return
    setSaving(true)
    setError(null)
    try {
      await profileRepository.remove(deletingProfile.id)
      setIsDeleteOpen(false)
      setDeletingProfile(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir perfil')
    } finally {
      setSaving(false)
    }
  }

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
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-primary" />
              Gestão de Perfis
            </h1>
            <p className="text-muted-foreground mt-1">
              Tipos de usuário e funções permitidas por perfil
            </p>
          </div>
          {canManage && (
            <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Perfil
            </Button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {profiles.map((profile) => (
            <Card key={profile.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{profile.name}</h3>
                    {profile.isSystem && (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="w-3 h-3" />
                        Sistema
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {profile.functions.length} funções
                    </Badge>
                  </div>
                  {profile.description && (
                    <p className="text-sm text-muted-foreground">
                      {profile.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.functions.slice(0, 6).map((fn) => (
                      <Badge key={fn} variant="outline" className="text-xs">
                        {catalog.find((c) => c.key === fn)?.label ?? fn}
                      </Badge>
                    ))}
                    {profile.functions.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.functions.length - 6}
                      </Badge>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(profile)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      disabled={profile.isSystem}
                      onClick={() => openDelete(profile)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Editar Perfil' : 'Novo Perfil'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nome *</Label>
                <Input
                  id="profile-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Zelador"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-desc">Descrição</Label>
                <Textarea
                  id="profile-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Descreva o tipo de usuário..."
                />
              </div>

              <div className="space-y-3">
                <Label>Funções permitidas</Label>
                {groupedFunctions.map(([area, items]) => (
                  <div key={area} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {area}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            checked={form.functions.includes(item.key)}
                            onChange={() => toggleFunction(item.key)}
                            className="rounded border-border"
                          />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={!form.name.trim() || saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir perfil?</AlertDialogTitle>
              <AlertDialogDescription>
                O perfil &quot;{deletingProfile?.name}&quot; será removido. Usuários
                vinculados a ele impedem a exclusão.
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
