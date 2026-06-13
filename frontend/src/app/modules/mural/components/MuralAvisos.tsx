import { useCallback, useEffect, useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import {
  MessageSquare,
  Search,
  ThumbsUp,
  MessageCircle,
  Share2,
  Pin,
  AlertCircle,
  Calendar,
  Wrench,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { getUserPermissions } from "@/app/utils/permissions";
import { announcementRepository } from "@/app/data/announcementRepository";
import {
  Announcement,
  AnnouncementCategory,
} from "@/app/domain/announcement";

const categories: {
  id: AnnouncementCategory | "all";
  name: string;
  icon?: typeof Wrench;
}[] = [
  { id: "all", name: "Todos" },
  { id: "general", name: "Avisos Gerais", icon: MessageSquare },
  { id: "event", name: "Eventos", icon: Calendar },
  { id: "maintenance", name: "Manutenção", icon: Wrench },
  { id: "important", name: "Importante", icon: AlertCircle },
];

const categoryLabels: Record<AnnouncementCategory, string> = {
  general: "Avisos Gerais",
  event: "Eventos",
  maintenance: "Manutenção",
  important: "Importante",
};

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MuralAvisos() {
  const { functions } = useAuth();
  const permissions = getUserPermissions(functions);
  const canManage = permissions.canManageNoticeBoard;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    AnnouncementCategory | "all"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general" as AnnouncementCategory,
    isPinned: false,
    isImportant: false,
  });

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await announcementRepository.list();
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar avisos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      content: "",
      category: "general",
      isPinned: false,
      isImportant: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      isPinned: announcement.isPinned,
      isImportant: announcement.isImportant,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    try {
      await announcementRepository.remove(deletingId);
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
      await loadAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir aviso");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        isPinned: formData.isPinned,
        isImportant: formData.isImportant,
      };
      if (editingAnnouncement) {
        await announcementRepository.update(editingAnnouncement.id, payload);
      } else {
        await announcementRepository.create(payload);
      }
      setIsDialogOpen(false);
      await loadAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar aviso");
    } finally {
      setSaving(false);
    }
  };

  const filteredAnnouncements = announcements
    .filter(
      (a) => selectedCategory === "all" || a.category === selectedCategory,
    )
    .filter(
      (a) =>
        searchQuery === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Mural de Avisos</h1>
            <p className="text-muted-foreground mt-1">
              Comunicados e informações importantes do condomínio
            </p>
          </div>
          {canManage && (
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Aviso
            </Button>
          )}
        </div>

        {/* Stats — standardized to match main Dashboard pattern */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total de Avisos", value: announcements.length,                            iconBg: "bg-blue-500" },
            { label: "Fixados",         value: announcements.filter(a => a.isPinned).length,    iconBg: "bg-primary" },
            { label: "Importantes",     value: announcements.filter(a => a.isImportant).length, iconBg: "bg-orange-500" }
          ].map(s => (
            <Card key={s.label} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <h3 className="text-2xl font-semibold mt-1">{s.value}</h3>
                </div>
                <div className={`w-12 h-12 ${s.iconBg} rounded-lg flex items-center justify-center`}>
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar avisos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = category.id === "all"
              ? announcements.length
              : announcements.filter(a => a.category === category.id).length;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="font-medium text-sm">{category.name}</span>
                <Badge variant="secondary" className="ml-1">{count}</Badge>
              </button>
            );
          })}
        </div>

        {/* Announcements list */}
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`p-6 hover:shadow-lg transition-shadow ${
                announcement.isPinned ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.isPinned && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Pin className="w-3 h-3 mr-1" />
                        Fixado
                      </Badge>
                    )}
                    {announcement.isImportant && (
                      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Importante
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {categoryLabels[announcement.category]}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(announcement)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(announcement.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground mb-4">{announcement.content}</p>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{announcement.author}</span>
                  <span>•</span>
                  <span>{formatDate(announcement.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    {announcement.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    {announcement.comments}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum aviso encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou buscar por outros termos
            </p>
          </Card>
        )}

        {/* Create / Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "Editar Aviso" : "Novo Aviso"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite o título do aviso"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite o conteúdo do aviso"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value as AnnouncementCategory,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== "all").map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isPinned" className="cursor-pointer">Fixar aviso</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isImportant" className="cursor-pointer">Marcar como importante</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => void handleSave()}
                className="bg-primary hover:bg-primary/90"
                disabled={!formData.title || !formData.content || saving}
              >
                {saving ? "Salvando..." : editingAnnouncement ? "Salvar Alterações" : "Publicar Aviso"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
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
  );
}
