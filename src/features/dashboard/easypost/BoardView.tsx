'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi, Board, BoardColumn, Card } from '@/services/boardApi';
import { api } from '@/lib/api';
import { useAppToast } from '@/hooks/useAppToast';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import {
  Plus, MoreVertical,
  MessageSquare, Trash2,
  Clock, Edit2, UserPlus, Tag,
  Sparkles, Loader2, Layers, Check, ImagePlus
} from 'lucide-react';
import { NeuButton, NeuInput, NeuModal, ConfirmModal } from './DashboardUI';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {[...Array(3)].map((_, col) => (
        <div key={col} className="w-72 flex-shrink-0 bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px]">
          <div className="p-3 border-b border-black/5 dark:border-white/5">
            <Skeleton className="h-5 w-24 rounded-[6px]" />
          </div>
          <div className="p-3 space-y-3">
            {[...Array(col + 2)].map((_, card) => (
              <div key={card} className="bg-[#F5F7FA] dark:bg-white/5 rounded-[12px] p-3 space-y-2">
                <Skeleton className="h-4 w-full rounded-[4px]" />
                <Skeleton className="h-3 w-2/3 rounded-[4px]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// DND
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

interface BoardViewProps {
  workspaceId: string;
}

const DESCRIPTION_PLACEHOLDERS: [string, string][] = [
  ["A behind-the-scenes look at...", "Un aperçu des coulisses de..."],
  ["Try filming a quick tutorial on...", "Filmez un tutoriel rapide sur..."],
  ["Share a customer story about...", "Partagez une histoire client sur..."],
  ["Turn this week's biggest win into a post about...", "Transformez la plus grande réussite de la semaine en publication sur..."],
  ["Ask your audience what they think about...", "Demandez à votre audience ce qu'elle pense de..."],
  ["Show the process behind...", "Montrez le processus derrière..."],
];

export default function BoardView({ workspaceId }: BoardViewProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // There's exactly one implicit board per workspace — users never create or
  // pick a board, they just land straight in it and manage groups/ideas.
  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['boards', workspaceId],
    gcTime: 0,
    queryFn: () => boardApi.getBoards(workspaceId),
  });

  const provisionBoardMutation = useMutation({
    mutationFn: async () => {
      const board = await boardApi.createBoard(workspaceId, { name: t('Ideas', 'Idées') });
      await Promise.all([
        boardApi.createColumn(board.id, { name: t('Unassigned', 'Non assigné'), order: 0 }),
        boardApi.createColumn(board.id, { name: t('To Do', 'À faire'), order: 1 }),
        boardApi.createColumn(board.id, { name: t('In Progress', 'En cours'), order: 2 }),
      ]);
      return board;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] });
    },
  });

  useEffect(() => {
    if (!isLoading && boards.length === 0 && provisionBoardMutation.isIdle) {
      provisionBoardMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, boards.length]);

  if (isLoading || boards.length === 0) {
    return <KanbanSkeleton />;
  }

  return <KanbanBoard boardId={boards[0].id} boardName={boards[0].name} />;
}

// ==========================================
// KANBAN BOARD COMPONENT
// ==========================================

function KanbanBoard({ boardId, boardName }: { boardId: string, boardName: string }) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const toast = useAppToast();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Idea Modal — shared between creating a new idea and editing an existing one.
  // editingCardId is null when creating; set to the card's id when editing.
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [descriptionPlaceholder, setDescriptionPlaceholder] = useState(DESCRIPTION_PLACEHOLDERS[0]);
  const [newCardAssigneeId, setNewCardAssigneeId] = useState<string | null>(null);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [newCardImageFile, setNewCardImageFile] = useState<File | null>(null);
  const [newCardImagePreviewUrl, setNewCardImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create Column ("+ New Group")
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const [cardPendingDelete, setCardPendingDelete] = useState<Card | null>(null);
  const [columnPendingDelete, setColumnPendingDelete] = useState<BoardColumn | null>(null);

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    gcTime: 0,
    queryFn: () => boardApi.getBoardDetails(boardId),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['team-members', board?.workspaceId],
    queryFn: () => api.get<any[]>(`/workspaces/${board!.workspaceId}/members`).then(res => res || []),
    enabled: !!board?.workspaceId,
  });

  const updateColumnMutation = useMutation({
    mutationFn: (data: { id: string, name: string }) => boardApi.updateColumn(data.id, { name: data.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Group updated', 'Groupe mis à jour'));
    }
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (id: string) => boardApi.deleteColumn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Group deleted', 'Groupe supprimé'));
      setColumnPendingDelete(null);
    }
  });

  const createColumnMutation = useMutation({
    mutationFn: (name: string) => boardApi.createColumn(boardId, { name, order: board?.columns?.length || 0 }),
    onSuccess: () => {
      setIsCreateColumnOpen(false);
      setNewColumnName('');
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Group created', 'Groupe créé'));
    }
  });

  const moveCardMutation = useMutation({
    mutationFn: ({ cardId, columnId, order }: { cardId: string, columnId: string, order: number }) => 
      boardApi.moveCard(cardId, { columnId, order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    }
  });

  const createCardMutation = useMutation({
    mutationFn: (data: { columnId: string, title: string, description?: string, assigneeId?: string | null }) =>
      boardApi.createCard(data.columnId, {
        title: data.title,
        ...(data.description?.trim() ? { description: data.description.trim() } : {}),
        ...(data.assigneeId ? { assigneeId: data.assigneeId } : {}),
      }),
    onSuccess: () => {
      closeIdeaModal();
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Idea created', 'Idée créée'));
    }
  });

  const updateCardMutation = useMutation({
    mutationFn: async (data: { cardId: string, columnId: string, originalColumnId: string, title: string, description?: string, assigneeId?: string | null }) => {
      await boardApi.updateCard(data.cardId, {
        title: data.title,
        description: data.description?.trim() || '',
        assigneeId: data.assigneeId,
      });
      if (data.columnId !== data.originalColumnId) {
        await boardApi.moveCard(data.cardId, { columnId: data.columnId, order: 0 });
      }
    },
    onSuccess: () => {
      closeIdeaModal();
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Idea updated', 'Idée mise à jour'));
    },
    onError: () => toast.error(t('Failed to update idea', "Échec de la mise à jour de l'idée")),
  });

  const resetImageState = () => {
    if (newCardImagePreviewUrl) URL.revokeObjectURL(newCardImagePreviewUrl);
    setNewCardImageFile(null);
    setNewCardImagePreviewUrl(null);
  };

  const handleFileSelected = async (file: File) => {
    setNewCardImageFile(file);
    setNewCardImagePreviewUrl(URL.createObjectURL(file));
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.upload<any>('/media/upload', formData);
      toast.success(t('Image uploaded to media library — it will attach to the idea once the backend supports it', "Image importée dans la médiathèque — elle sera liée à l'idée dès que le backend le prendra en charge"));
    } catch {
      toast.error(t('Upload failed', "Échec de l'import"));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleGenerateIdea = async () => {
    setIsGeneratingIdea(true);
    try {
      const res = await api.post<any>('/ai/test-copywriting', {
        product: newCardTitle.trim() || t('a social media content idea', 'une idée de contenu pour réseaux sociaux'),
        tone: 'PROFESSIONAL',
      });
      const generated = res.content || res.data?.content;
      if (!generated) throw new Error('Empty response from AI');
      setNewCardDescription(generated);
    } catch {
      toast.error(t('AI generation failed', "Échec de la génération IA"));
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => boardApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Idea deleted', 'Idée supprimée'));
      setCardPendingDelete(null);
    },
    onError: () => toast.error(t('Failed to delete idea', "Échec de la suppression de l'idée")),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (isLoading || !board) return <KanbanSkeleton />;

  const handleDragEnd = (event: any) => {
    setActiveCardId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Resolve target column ID
    // 1. Check if we dropped on a column container
    let overColumnId = over.data.current?.columnId || overId;
    
    // 2. Check if we dropped on a card within a column
    if (over.data.current?.type === 'Card') {
      overColumnId = over.data.current.columnId;
    }

    const activeCard = board.columns?.flatMap(c => c.cards || []).find(c => c.id === activeId);

    if (activeCard) {
        // If it's a different column or different position
        if (activeCard.columnId !== overColumnId) {
            moveCardMutation.mutate({ 
                cardId: activeId as string, 
                columnId: overColumnId as string, 
                order: 0 
            });
        }
    }
  };

  const handleDragStart = (event: any) => {
    setActiveCardId(event.active.id as string);
  };

  const activeCard = activeCardId
    ? board.columns?.flatMap(c => c.cards || []).find(c => c.id === activeCardId) ?? null
    : null;

  const openEditCard = (cardId: string) => {
    const card = board.columns?.flatMap(c => c.cards || []).find(c => c.id === cardId);
    if (!card) return;
    setEditingCardId(cardId);
    setTargetColumnId(card.columnId);
    setNewCardTitle(card.title);
    setNewCardDescription(card.description || '');
    setNewCardAssigneeId(card.assignee?.id || card.assigneeId || null);
    resetImageState();
    setIsIdeaModalOpen(true);
  };

  const openCreateCard = (columnId: string) => {
    setEditingCardId(null);
    setTargetColumnId(columnId);
    setNewCardTitle('');
    setNewCardAssigneeId(null);
    setNewCardDescription('');
    setDescriptionPlaceholder(DESCRIPTION_PLACEHOLDERS[Math.floor(Math.random() * DESCRIPTION_PLACEHOLDERS.length)]);
    resetImageState();
    setIsIdeaModalOpen(true);
  };

  const closeIdeaModal = () => {
    setIsIdeaModalOpen(false);
    setEditingCardId(null);
    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardAssigneeId(null);
    resetImageState();
  };

  const selectedAssignee = members.find((m: any) => m.user?.id === newCardAssigneeId)?.user;
  const targetColumnName = board.columns?.find(c => c.id === targetColumnId)?.name;
  const editingOriginalColumnId = editingCardId
    ? board.columns?.flatMap(c => c.cards || []).find(c => c.id === editingCardId)?.columnId
    : undefined;

  const handleSubmitIdea = () => {
    if (!newCardTitle.trim()) return;
    if (editingCardId) {
      updateCardMutation.mutate({
        cardId: editingCardId,
        columnId: targetColumnId!,
        originalColumnId: editingOriginalColumnId!,
        title: newCardTitle,
        description: newCardDescription,
        assigneeId: newCardAssigneeId,
      });
    } else {
      createCardMutation.mutate({ columnId: targetColumnId!, title: newCardTitle, description: newCardDescription, assigneeId: newCardAssigneeId });
    }
  };

  const isSubmittingIdea = createCardMutation.isPending || updateCardMutation.isPending;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[#040028] dark:text-white">{board.name}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-nowrap gap-6 h-full min-w-max pr-8">
            {board.columns?.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddCard={() => openCreateCard(column.id)}
                onCardClick={openEditCard}
                onCardDelete={(card) => setCardPendingDelete(card)}
                onRename={(name) => updateColumnMutation.mutate({ id: column.id, name })}
                onDelete={() => setColumnPendingDelete(column)}
              />
            ))}

            {isCreateColumnOpen ? (
              <div className="flex-shrink-0 w-80 flex flex-col h-full">
                <div className="mb-4 px-2">
                  <input
                    autoFocus
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newColumnName.trim()) createColumnMutation.mutate(newColumnName.trim());
                      if (e.key === 'Escape') { setIsCreateColumnOpen(false); setNewColumnName(''); }
                    }}
                    onBlur={() => {
                      if (newColumnName.trim()) createColumnMutation.mutate(newColumnName.trim());
                      else setIsCreateColumnOpen(false);
                    }}
                    placeholder={t("Group name...", "Nom du groupe...")}
                    className="w-full bg-transparent font-bold text-sm text-[#040028] dark:text-white placeholder:text-[#8E8E8E] focus:outline-none"
                  />
                </div>
                <div className="flex-1 bg-[#F7F6F3] dark:bg-white/[0.03] rounded-[10px] p-2.5" />
              </div>
            ) : (
              <button
                onClick={() => setIsCreateColumnOpen(true)}
                className="flex-shrink-0 flex items-start gap-1.5 pt-1 text-[#8E8E8E] hover:text-[#040028] dark:hover:text-white transition-colors"
              >
                <Plus size={16} />
                <span className="font-semibold text-sm whitespace-nowrap">{t("New Group", "Nouveau groupe")}</span>
              </button>
            )}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeCard && (
              <motion.div
                initial={{ scale: 1, rotate: 0 }}
                animate={{ scale: 1.03, rotate: 1.5 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="bg-white dark:bg-[#0A0A2E] rounded-[10px] shadow-2xl p-3 w-80 cursor-grabbing"
              >
                <h4 className="font-semibold text-sm leading-snug text-[#040028] dark:text-white">{activeCard.title}</h4>
                {activeCard.description && (
                  <p className="text-xs text-[#8E8E8E] line-clamp-2 mt-1.5">{activeCard.description}</p>
                )}
              </motion.div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <ConfirmModal
        isOpen={!!cardPendingDelete}
        onClose={() => setCardPendingDelete(null)}
        onConfirm={() => cardPendingDelete && deleteCardMutation.mutate(cardPendingDelete.id)}
        isConfirming={deleteCardMutation.isPending}
        title={t('Delete idea', "Supprimer l'idée")}
        message={
          cardPendingDelete?.postId
            ? t(
                'Delete this idea? The post it was converted to will stay in your schedule — only the link between them is removed.',
                'Supprimer cette idée ? La publication issue de sa conversion restera dans votre planning — seul le lien entre les deux sera supprimé.'
              )
            : t('Delete this idea? This cannot be undone.', 'Supprimer cette idée ? Cette action est irréversible.')
        }
        confirmLabel={t('Delete', 'Supprimer')}
        cancelLabel={t('Cancel', 'Annuler')}
      />

      <ConfirmModal
        isOpen={!!columnPendingDelete}
        onClose={() => setColumnPendingDelete(null)}
        onConfirm={() => columnPendingDelete && deleteColumnMutation.mutate(columnPendingDelete.id)}
        isConfirming={deleteColumnMutation.isPending}
        title={t('Delete group', 'Supprimer le groupe')}
        message={t(
          'Are you sure? This will delete all ideas in this group.',
          'Êtes-vous sûr ? Cela supprimera toutes les idées de ce groupe.'
        )}
        confirmLabel={t('Delete', 'Supprimer')}
        cancelLabel={t('Cancel', 'Annuler')}
      />

      {/* Create Card Modal — matches the Create Workspace modal's chrome (white header, navy accent) */}
      <NeuModal
        isOpen={isIdeaModalOpen}
        onClose={closeIdeaModal}
        title={editingCardId ? t("Edit idea", "Modifier l'idée") : t("New idea", "Nouvelle idée")}
        maxWidth="max-w-2xl"
        headerClassName="bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white"
        iconClassName="text-[#040028]/70 hover:text-[#040028] dark:text-white/70 dark:hover:text-white"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#040028] dark:text-white">{t("Title", "Titre")}</label>
            <NeuInput
              placeholder={t("Idea title...", "Titre de l'idée...")}
              value={newCardTitle}
              onChange={(e: any) => setNewCardTitle(e.target.value)}
              onKeyDown={(e: any) => { if (e.key === 'Enter') handleSubmitIdea(); }}
              className="border-0 px-0 focus:border-0 focus:ring-0"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block text-[#040028] dark:text-white">{t("Description", "Description")}</label>
            <div className="relative">
              <textarea
                value={newCardDescription}
                onChange={(e) => setNewCardDescription(e.target.value)}
                placeholder={t(descriptionPlaceholder[0], descriptionPlaceholder[1])}
                rows={7}
                className="w-full bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] px-3 py-2.5 font-medium text-sm placeholder:text-[#8E8E8E] focus:outline-none focus:border-[#D9D9D9] dark:focus:border-white/10 focus:ring-0 transition-all text-[#040028] dark:text-white resize-none"
              />
              {!newCardDescription && (
                <button
                  type="button"
                  onClick={handleGenerateIdea}
                  disabled={isGeneratingIdea}
                  title={t("Generate with AI", "Générer avec l'IA")}
                  className="group absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold bg-white dark:bg-[#0A0A2E] px-2 py-1 rounded-[6px] border border-[#D9D9D9] dark:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingIdea
                    ? <Loader2 size={12} className="animate-spin text-[#8E8E8E] group-hover:text-[#174CD2] transition-colors" />
                    : <Sparkles size={12} className="text-[#8E8E8E] group-hover:text-[#174CD2] transition-colors" />}
                  <span className="ai-generate-label">
                    {isGeneratingIdea ? t("Generating...", "Génération...") : t("Generate with AI", "Générer avec l'IA")}
                  </span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelected(f); }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileSelected(f);
              }}
              className={cn(
                "mt-2 flex items-center gap-2 w-fit max-w-full min-h-[96px] px-4 py-6 rounded-[8px] border border-dashed cursor-pointer transition-colors",
                isDraggingFile ? "border-[#174CD2] bg-[#174CD2]/5" : "border-[#D9D9D9] dark:border-white/15"
              )}
            >
              {newCardImagePreviewUrl ? (
                <>
                  <img src={newCardImagePreviewUrl} alt="" className="w-8 h-8 rounded-[6px] object-cover flex-shrink-0" />
                  <span className="text-xs font-medium text-[#040028] dark:text-white truncate max-w-[200px]">{newCardImageFile?.name}</span>
                  {isUploadingImage && <Loader2 size={12} className="animate-spin text-[#8E8E8E] flex-shrink-0" />}
                </>
              ) : (
                <>
                  <ImagePlus size={14} className="text-[#8E8E8E] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#8E8E8E]">{t("Drag and drop a file or select a file", "Glissez-déposez un fichier ou sélectionnez-en un")}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover open={groupMenuOpen} onOpenChange={setGroupMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] border border-[#E5E5E5] dark:border-white/10 text-xs font-medium text-[#040028] dark:text-white hover:border-[#040028]/30 dark:hover:border-white/30 transition-colors"
                >
                  <Layers size={14} /> {targetColumnName || t("Group", "Groupe")}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-48 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 py-1 overflow-hidden max-h-60 overflow-y-auto"
                align="start"
              >
                {board.columns?.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => { setTargetColumnId(col.id); setGroupMenuOpen(false); }}
                    className="w-full h-9 px-4 flex items-center justify-between gap-2 text-left transition-colors text-sm font-medium text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <span className="truncate">{col.name}</span>
                    {col.id === targetColumnId && <Check size={14} className="text-[#174CD2] flex-shrink-0" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <Popover open={assigneeMenuOpen} onOpenChange={setAssigneeMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] border border-[#E5E5E5] dark:border-white/10 text-xs font-medium text-[#040028] dark:text-white hover:border-[#040028]/30 dark:hover:border-white/30 transition-colors"
                >
                  {selectedAssignee ? (
                    <>
                      <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                        <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${selectedAssignee.firstName}`} alt="" className="w-full h-full" />
                      </div>
                      {selectedAssignee.firstName}
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} /> {t("Assignee", "Assigné à")}
                    </>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-52 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 py-1 overflow-hidden max-h-60 overflow-y-auto"
                align="start"
              >
                {newCardAssigneeId && (
                  <button
                    onClick={() => { setNewCardAssigneeId(null); setAssigneeMenuOpen(false); }}
                    className="w-full h-9 px-4 flex items-center gap-2 text-left transition-colors text-sm font-medium text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    {t("Unassign", "Retirer l'assignation")}
                  </button>
                )}
                {members.length === 0 && (
                  <p className="px-4 py-2 text-xs text-[#8E8E8E]">{t("No members found", "Aucun membre trouvé")}</p>
                )}
                {members.map((m: any) => (
                  <button
                    key={m.user?.id}
                    onClick={() => { setNewCardAssigneeId(m.user?.id); setAssigneeMenuOpen(false); }}
                    className="w-full h-9 px-4 flex items-center gap-2 text-left transition-colors text-sm font-medium text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                      <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${m.user?.firstName}`} alt="" className="w-full h-full" />
                    </div>
                    {m.user?.firstName}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <button
              type="button"
              disabled
              title={t("Tags are coming soon", "Les tags arrivent bientôt")}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] border border-[#E5E5E5] dark:border-white/10 text-xs font-medium text-[#8E8E8E] opacity-60 cursor-not-allowed"
            >
              <Tag size={14} /> {t("Tags", "Tags")}
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
            <NeuButton onClick={closeIdeaModal} className="hover:border-[#040028]/40">{t("Cancel", "Annuler")}</NeuButton>
            <NeuButton
              onClick={handleSubmitIdea}
              active
              disabled={!newCardTitle.trim() || isSubmittingIdea}
              className="bg-[#040028] hover:bg-[#040028]/90 flex items-center justify-center gap-1.5"
            >
              {isSubmittingIdea && <Loader2 size={14} className="animate-spin" />}
              {isSubmittingIdea
                ? t("Saving...", "Enregistrement...")
                : editingCardId ? t("Save changes", "Enregistrer les modifications") : t("Save idea", "Enregistrer l'idée")}
            </NeuButton>
          </div>
        </div>
      </NeuModal>

    </div>
  );
}

// ==========================================
// COLUMN COMPONENT
// ==========================================

function KanbanColumn({ column, onAddCard, onCardClick, onCardDelete, onRename, onDelete }: {
  column: BoardColumn,
  onAddCard: () => void,
  onCardClick: (id: string) => void,
  onCardDelete: (card: Card) => void,
  onRename: (name: string) => void,
  onDelete: () => void,
}) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.name);
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      columnId: column.id
    }
  });

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== column.name) onRename(trimmed);
    setIsRenaming(false);
  };

  return (
    <div className="flex-shrink-0 w-80 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 min-w-0">
          {isRenaming ? (
            <input
              autoFocus
              value={renameValue}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setIsRenaming(false); setRenameValue(column.name); }
              }}
              onBlur={commitRename}
              className="font-bold text-sm bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[6px] px-1.5 py-0.5 text-[#040028] dark:text-white focus:outline-none min-w-0 w-36"
            />
          ) : (
            <h3 className="font-bold text-sm text-[#040028] dark:text-white truncate">{column.name}</h3>
          )}
          <span className="text-xs font-semibold rounded-full bg-[#F5F7FA] dark:bg-white/10 text-[#8E8E8E] px-2 py-0.5 flex-shrink-0">
            {column.cards?.length || 0}
          </span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onAddCard}
            className="p-1.5 rounded-[8px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10 hover:!text-[#040028] dark:hover:!text-white transition-colors"
          >
            <Plus size={16} />
          </button>
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button className="p-1.5 rounded-[8px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <MoreVertical size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-44 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 py-1 overflow-hidden"
              align="end"
            >
              <button
                onClick={() => { setMenuOpen(false); setRenameValue(column.name); setIsRenaming(true); }}
                className="w-full h-9 px-4 flex items-center gap-2 text-left transition-colors text-sm font-medium text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Edit2 size={14} /> {t('Rename', 'Renommer')}
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(); }}
                className="w-full h-9 px-4 flex items-center gap-2 text-left transition-colors text-sm font-medium text-red-500 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Trash2 size={14} /> {t('Delete', 'Supprimer')}
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 bg-[#F7F6F3] dark:bg-white/[0.03] rounded-[10px] p-2.5 space-y-2.5 overflow-y-auto custom-scrollbar"
      >
        <SortableContext
          items={column.cards?.map(c => c.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {column.cards?.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
              onClick={() => onCardClick(card.id)}
              onDelete={() => onCardDelete(card)}
            />
          ))}
        </SortableContext>

        <button
          onClick={onAddCard}
          className="w-full flex items-center gap-1.5 px-2 py-2 rounded-[8px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#040028] dark:hover:text-white transition-colors"
        >
          <Plus size={15} />
          <span className="text-sm font-semibold">{t("New Idea", "Nouvelle idée")}</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// CARD COMPONENT
// ==========================================

function KanbanCard({ card, columnId, onClick, onDelete }: { card: Card, columnId: string, onClick: () => void, onDelete: () => void }) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      columnId: columnId
    }
  });

  const priorityDotColor = (p: string) => {
    switch (p) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      default: return null;
    }
  };
  const priorityDot = priorityDotColor(card.priority);

  const hasFooter = !!card.assignee || !!card._count?.comments || !!card.dueDate;

  return (
    <motion.div
      layout
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group bg-white dark:bg-[#0A0A2E] rounded-[10px] shadow-sm p-3 cursor-grab active:cursor-grabbing touch-none",
        isDragging && "!shadow-none !opacity-40 border border-dashed border-black/10 dark:border-white/10"
      )}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-start gap-1.5 min-w-0">
            {priorityDot && <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${priorityDot}`} />}
            <h4 className="font-semibold text-sm leading-snug text-[#040028] dark:text-white">{card.title}</h4>
          </div>
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className={cn(
                  "p-1 rounded-[6px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10 transition-opacity flex-shrink-0 touch-none",
                  menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <MoreVertical size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-40 p-0 bg-white dark:bg-[#0A0A2E] border border-[#E5E5E5] dark:border-white/10 rounded-[8px] shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 py-1 overflow-hidden"
              align="end"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onClick(); }}
                className="w-full h-9 px-4 flex items-center gap-2 text-left transition-colors text-sm font-medium text-[#040028] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Edit2 size={14} /> {t('Edit', 'Modifier')}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
                className="w-full h-9 px-4 flex items-center gap-2 text-left transition-colors text-sm font-medium text-red-500 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Trash2 size={14} /> {t('Delete', 'Supprimer')}
              </button>
            </PopoverContent>
          </Popover>
        </div>

        {card.description && (
          <p className="text-xs text-[#8E8E8E] line-clamp-2">{card.description}</p>
        )}

        {hasFooter && (
          <div className="flex items-center justify-between mt-1">
            {card.assignee ? (
              <div className="w-6 h-6 rounded-full bg-white overflow-hidden ring-2 ring-white dark:ring-[#0A0A2E]" title={card.assignee.firstName}>
                <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${card.assignee.firstName}`} alt="avatar" className="w-full h-full object-cover" />
              </div>
            ) : <span />}

            <div className="flex items-center gap-2 text-xs font-medium text-[#8E8E8E]">
              {card._count?.comments ? (
                <div className="flex items-center gap-0.5">
                  <MessageSquare size={12} /> {card._count.comments}
                </div>
              ) : null}
              {card.dueDate && (
                <div className="flex items-center gap-0.5">
                  <Clock size={12} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

