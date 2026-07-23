'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi, Board, BoardColumn, Card } from '@/services/boardApi';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MoreVertical, Calendar, User as UserIcon, 
  MessageSquare, Trash2, ArrowRight, Layout,
  MoreHorizontal, GripVertical, Clock, AlertCircle
} from 'lucide-react';
import { NeuButton, NeuCard, NeuInput, NeuModal } from './DashboardUI';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function BoardsListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-[8px]" />
          <Skeleton className="h-4 w-32 rounded-[6px]" />
        </div>
        <Skeleton className="h-10 w-32 rounded-[10px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] p-4 space-y-3">
            <div className="h-2 w-full rounded-full bg-[#174CD2]/20" />
            <Skeleton className="h-5 w-36 rounded-[6px] mt-2" />
            <Skeleton className="h-3 w-full rounded-[4px]" />
            <Skeleton className="h-3 w-2/3 rounded-[4px]" />
            <div className="flex justify-between pt-3 border-t border-black/5 dark:border-white/5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
import { CSS } from '@dnd-kit/utilities';

interface BoardViewProps {
  workspaceId: string;
}

export default function BoardView({ workspaceId }: BoardViewProps) {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const { t } = useLanguage();

  const queryClient = useQueryClient();

  // Fetch Boards
  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['boards', workspaceId],
    gcTime: 0,
    queryFn: () => boardApi.getBoards(workspaceId),
  });

  // Create Board Mutation
  const createBoardMutation = useMutation({
    mutationFn: (name: string) => boardApi.createBoard(workspaceId, { name }),
    onSuccess: (newBoard) => {
      toast.success(t('Board created', 'Tableau créé'));
      setIsCreateBoardOpen(false);
      setNewBoardName('');
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] });
      setSelectedBoardId(newBoard.id);
    },
    onError: () => toast.error(t('Failed to create board', 'Échec de la création du tableau'))
  });

  if (isLoading) return <BoardsListSkeleton />;

  if (selectedBoardId) {
    const activeBoard = boards.find(b => b.id === selectedBoardId);
    return (
      <KanbanBoard 
        boardId={selectedBoardId} 
        boardName={activeBoard?.name || ''}
        onBack={() => setSelectedBoardId(null)} 
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#040028] dark:text-white">{t("Workspace boards", "Tableaux de l'espace")}</h2>
        </div>
        <NeuButton onClick={() => setIsCreateBoardOpen(true)} className="bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-[#D9D9D9] dark:border-white/10 hover:border-[#D9D9D9] dark:hover:border-white/10">
          <Plus size={18} className="inline mr-2" /> {t("New board", "Nouveau tableau")}
        </NeuButton>
      </div>

      {boards.length === 0 ? (
        <div className="py-20 text-center rounded-[16px] bg-[#F7F6F3] dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10">
          <Layout size={40} className="mx-auto text-[#040028] dark:text-white mb-4" />
          <h3 className="text-lg font-semibold text-[#8E8E8E]">{t("No boards found in this workspace", "Aucun tableau trouvé dans cet espace")}</h3>
          <button
            onClick={() => setIsCreateBoardOpen(true)}
            className="mt-3 text-[#040028] dark:text-white font-semibold text-sm hover:underline"
          >
            {t("Create your first board", "Créer votre premier tableau")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <motion.div
              key={board.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedBoardId(board.id)}
              className="cursor-pointer"
            >
              <NeuCard className="h-full transition-shadow group relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[16px]"
                  style={{ backgroundColor: board.color || '#174CD2' }}
                />
                <div className="pt-3">
                  <h3 className="text-lg font-bold text-[#040028] dark:text-white mb-2 group-hover:text-[#174CD2] transition-colors">{board.name}</h3>
                  <p className="text-sm text-[#8E8E8E] line-clamp-2 mb-4">{board.description || t('No description provided', 'Aucune description fournie')}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                    <span className="text-xs font-semibold rounded-full bg-[#F5F7FA] dark:bg-white/5 text-[#040028] dark:text-white px-2.5 py-1">
                      {board._count?.columns || 0} {t("columns", "colonnes")}
                    </span>
                    <ArrowRight size={16} className="text-[#8E8E8E] group-hover:translate-x-1 group-hover:text-[#174CD2] transition-all" />
                  </div>
                </div>
              </NeuCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      <NeuModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        title={t("New board", "Nouveau tableau")}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8E8E8E] mb-1 block">{t("Board name", "Nom du tableau")}</label>
            <NeuInput
              placeholder={t("e.g. Marketing campaign 2026", "ex. Campagne marketing 2026")}
              value={newBoardName}
              onChange={(e: any) => setNewBoardName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <NeuButton onClick={() => setIsCreateBoardOpen(false)}>{t("Cancel", "Annuler")}</NeuButton>
            <NeuButton
              onClick={() => createBoardMutation.mutate(newBoardName)}
              active
            >
              {t("Create board", "Créer le tableau")}
            </NeuButton>
          </div>
        </div>
      </NeuModal>
    </div>
  );
}

// ==========================================
// KANBAN BOARD COMPONENT
// ==========================================

function KanbanBoard({ boardId, boardName, onBack }: { boardId: string, boardName: string, onBack: () => void }) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Board Rename
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [editBoardName, setEditBoardName] = useState(boardName);

  // Column Rename/Delete
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [editColumnName, setEditColumnName] = useState('');

  // Create Card Modal
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    gcTime: 0,
    queryFn: () => boardApi.getBoardDetails(boardId),
  });

  const updateBoardMutation = useMutation({
    mutationFn: (name: string) => boardApi.updateBoard(boardId, { name }),
    onSuccess: () => {
      setIsEditBoardOpen(false);
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Board updated', 'Tableau mis à jour'));
    }
  });

  const updateColumnMutation = useMutation({
    mutationFn: (data: { id: string, name: string }) => boardApi.updateColumn(data.id, { name: data.name }),
    onSuccess: () => {
      setIsEditColumnOpen(false);
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Column updated', 'Colonne mise à jour'));
    }
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (id: string) => boardApi.deleteColumn(id),
    onSuccess: () => {
      setIsEditColumnOpen(false);
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Column deleted', 'Colonne supprimée'));
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
    mutationFn: (data: { columnId: string, title: string }) =>
      boardApi.createCard(data.columnId, { title: data.title }),
    onSuccess: () => {
      setIsCreateCardOpen(false);
      setNewCardTitle('');
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success(t('Card created', 'Carte créée'));
    }
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

  const openCardDetails = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsCardModalOpen(true);
  };

  const openCreateCard = (columnId: string) => {
    setTargetColumnId(columnId);
    setIsCreateCardOpen(true);
  };

  const openEditColumn = (column: BoardColumn) => {
    setEditingColumn(column);
    setEditColumnName(column.name);
    setIsEditColumnOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#040028] dark:text-white transition-colors"
          >
            <ArrowRight className="rotate-180" size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[#040028] dark:text-white">{board.name}</h2>
              <p className="text-xs font-medium text-[#8E8E8E]">{t("Board view", "Vue tableau")} · {board.columns?.length || 0} {t("columns", "colonnes")}</p>
            </div>
            <button
              onClick={() => setIsEditBoardOpen(true)}
              className="p-2 rounded-[10px] hover:bg-black/5 dark:hover:bg-white/10 text-[#8E8E8E] transition-colors"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max pr-8">
            {board.columns?.map((column) => (
              <KanbanColumn 
                key={column.id} 
                column={column} 
                onAddCard={() => openCreateCard(column.id)}
                onCardClick={openCardDetails}
                onEditColumn={() => openEditColumn(column)}
              />
            ))}
            
            <button className="flex-shrink-0 w-80 h-16 rounded-[16px] border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center gap-2 text-[#8E8E8E] hover:border-[#174CD2]/40 hover:text-[#174CD2] transition-all group">
              <Plus size={18} />
              <span className="font-semibold text-sm">{t("Add column", "Ajouter une colonne")}</span>
            </button>
          </div>
        </DndContext>
      </div>

      {/* Board Rename Modal */}
      <NeuModal
        isOpen={isEditBoardOpen}
        onClose={() => setIsEditBoardOpen(false)}
        title={t("Rename board", "Renommer le tableau")}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8E8E8E] mb-1 block">{t("New name", "Nouveau nom")}</label>
            <NeuInput
              value={editBoardName}
              onChange={(e: any) => setEditBoardName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <NeuButton onClick={() => setIsEditBoardOpen(false)}>{t("Cancel", "Annuler")}</NeuButton>
            <NeuButton
              onClick={() => updateBoardMutation.mutate(editBoardName)}
              active
            >
              {t("Update", "Mettre à jour")}
            </NeuButton>
          </div>
        </div>
      </NeuModal>

      {/* Column Edit Modal */}
      <NeuModal
        isOpen={isEditColumnOpen}
        onClose={() => setIsEditColumnOpen(false)}
        title={t("Manage column", "Gérer la colonne")}
      >
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-[#8E8E8E] mb-1 block">{t("Column name", "Nom de la colonne")}</label>
            <NeuInput
              value={editColumnName}
              onChange={(e: any) => setEditColumnName(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-black/5 dark:border-white/5">
            <button
              onClick={() => {
                if(confirm(t('Are you sure? This will delete all cards in this column.', 'Êtes-vous sûr ? Cela supprimera toutes les cartes de cette colonne.'))) {
                  deleteColumnMutation.mutate(editingColumn!.id);
                }
              }}
              className="text-red-500 font-semibold text-xs hover:underline"
            >
              {t("Delete column", "Supprimer la colonne")}
            </button>
            <div className="flex gap-3">
              <NeuButton onClick={() => setIsEditColumnOpen(false)}>{t("Cancel", "Annuler")}</NeuButton>
              <NeuButton
                onClick={() => updateColumnMutation.mutate({ id: editingColumn!.id, name: editColumnName })}
                active
              >
                {t("Save changes", "Enregistrer")}
              </NeuButton>
            </div>
          </div>
        </div>
      </NeuModal>

      {/* Card Details Modal */}
      {selectedCardId && (
        <CardDetailsModal 
          cardId={selectedCardId} 
          isOpen={isCardModalOpen} 
          onClose={() => setIsCardModalOpen(false)} 
        />
      )}

      {/* Create Card Modal */}
      <NeuModal
        isOpen={isCreateCardOpen}
        onClose={() => setIsCreateCardOpen(false)}
        title={t("New card", "Nouvelle carte")}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8E8E8E] mb-1 block">{t("Title", "Titre")}</label>
            <NeuInput
              placeholder={t("Task title...", "Titre de la tâche...")}
              value={newCardTitle}
              onChange={(e: any) => setNewCardTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <NeuButton onClick={() => setIsCreateCardOpen(false)}>{t("Cancel", "Annuler")}</NeuButton>
            <NeuButton
              onClick={() => createCardMutation.mutate({ columnId: targetColumnId!, title: newCardTitle })}
              active
              disabled={!newCardTitle.trim()}
            >
              {t("Create", "Créer")}
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

function KanbanColumn({ column, onAddCard, onCardClick, onEditColumn }: {
  column: BoardColumn,
  onAddCard: () => void,
  onCardClick: (id: string) => void,
  onEditColumn: () => void
}) {
  const { t } = useLanguage();
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      columnId: column.id
    }
  });

  return (
    <div className="flex-shrink-0 w-80 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-[#040028] dark:text-white">{column.name}</h3>
          <span className="text-xs font-semibold rounded-full bg-[#F5F7FA] dark:bg-white/10 text-[#8E8E8E] px-2 py-0.5">
            {column.cards?.length || 0}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onAddCard}
            className="p-1.5 rounded-[8px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#174CD2] transition-colors"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onEditColumn}
            className="p-1.5 rounded-[8px] text-[#8E8E8E] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 bg-[#F5F7FA] dark:bg-white/[0.03] rounded-[16px] p-3 space-y-3 overflow-y-auto custom-scrollbar"
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
            />
          ))}
        </SortableContext>

        {column.cards?.length === 0 && (
          <div className="h-20 rounded-[12px] border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center">
             <p className="text-xs font-medium text-[#8E8E8E]">{t("Empty column", "Colonne vide")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// CARD COMPONENT
// ==========================================

function KanbanCard({ card, columnId, onClick }: { card: Card, columnId: string, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: card.id,
    data: {
      type: 'Card',
      columnId: columnId
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-[#174CD2]';
      default: return 'bg-[#8E8E8E]';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
    >
      <NeuCard
        onClick={onClick}
        className="!p-3 cursor-pointer transition-all"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className={`w-8 h-1 rounded-full ${getPriorityColor(card.priority)}`} />
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#8E8E8E] opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={14} />
            </div>
          </div>

          <h4 className="font-semibold text-sm leading-tight text-[#040028] dark:text-white">{card.title}</h4>

          {card.description && (
            <p className="text-xs text-[#8E8E8E] line-clamp-2">{card.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex -space-x-2">
              {card.assignee ? (
                <div className="w-6 h-6 rounded-full bg-white overflow-hidden ring-2 ring-white dark:ring-[#0A0A2E]" title={card.assignee.firstName}>
                  <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${card.assignee.firstName}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex items-center justify-center">
                  <UserIcon size={12} className="text-[#8E8E8E]" />
                </div>
              )}
            </div>

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
        </div>
      </NeuCard>
    </div>
  );
}

// ==========================================
// CARD DETAILS MODAL
// ==========================================

function CardDetailsModal({ cardId, isOpen, onClose }: { cardId: string, isOpen: boolean, onClose: () => void }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: card, isLoading } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => boardApi.getCardDetails(cardId),
    enabled: isOpen
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => boardApi.addComment(cardId, content),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['card', cardId] });
      toast.success(t('Comment posted', 'Commentaire publié'));
    }
  });

  const convertMutation = useMutation({
    mutationFn: () => boardApi.convertToPost(cardId),
    onSuccess: () => {
      toast.success(t('Synced to content feed', 'Synchronisé avec le fil de contenu'));
      queryClient.invalidateQueries({ queryKey: ['card', cardId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  if (!card) return null;

  return (
    <NeuModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("Card details", "Détails de la carte")}
      maxWidth="max-w-3xl"
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-7 w-48 rounded-[8px]" />
          <Skeleton className="h-3 w-32 rounded-[6px]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-24 w-full rounded-[10px]" />
              <Skeleton className="h-10 w-full rounded-[10px]" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-20 rounded-[6px]" />
              <Skeleton className="h-8 w-full rounded-[8px]" />
              <Skeleton className="h-5 w-24 rounded-[6px]" />
              <Skeleton className="h-8 w-full rounded-[8px]" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
               <h3 className="text-xl font-bold text-[#040028] dark:text-white mb-1">{card.title}</h3>
               <p className="text-xs font-medium text-[#8E8E8E]">{t('In column:', 'Dans la colonne :')} {card.column?.name}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[#8E8E8E]">{t('Description', 'Description')}</h4>
              <div className="p-4 rounded-[12px] bg-[#F5F7FA] dark:bg-white/5 min-h-[100px] text-sm text-[#040028] dark:text-white">
                {card.description || t('No description provided.', 'Aucune description fournie.')}
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
               <h4 className="font-semibold text-xs text-[#8E8E8E] flex items-center gap-2">
                 <MessageSquare size={14}/> {t('Discussions', 'Discussions')} ({card.comments?.length || 0})
               </h4>

               <div className="flex gap-2">
                  <NeuInput
                    placeholder={t('Write a reply...', 'Écrire une réponse...')}
                    value={comment}
                    onChange={(e: any) => setComment(e.target.value)}
                  />
                  <NeuButton
                    onClick={() => addCommentMutation.mutate(comment)}
                    active
                    disabled={!comment.trim()}
                  >
                    {t('Send', 'Envoyer')}
                  </NeuButton>
               </div>

               <div className="space-y-3 mt-4">
                 {card.comments?.map((c) => (
                   <div key={c.id} className="p-3 rounded-[12px] bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F5F7FA] dark:bg-white/10 overflow-hidden flex-shrink-0">
                         <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${c.author.firstName}`} className="w-full h-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-semibold text-xs text-[#040028] dark:text-white">{c.author.firstName}</span>
                           <span className="text-xs text-[#8E8E8E]">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-[#040028] dark:text-white">{c.content}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-[14px] bg-[#F5F7FA] dark:bg-white/5 space-y-4">
               <div>
                  <h4 className="font-semibold text-xs text-[#8E8E8E] mb-1">{t('Assignee', 'Assigné à')}</h4>
                  {card.assignee ? (
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full overflow-hidden">
                          <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${card.assignee.firstName}`} className="w-full h-full" />
                       </div>
                       <span className="font-medium text-xs text-[#040028] dark:text-white">{card.assignee.firstName}</span>
                    </div>
                  ) : <p className="text-xs font-medium text-[#8E8E8E]">{t('Unassigned', 'Non assigné')}</p>}
               </div>

               <div>
                  <h4 className="font-semibold text-xs text-[#8E8E8E] mb-1">{t('Priority', 'Priorité')}</h4>
                  <span className={`px-2.5 py-1 rounded-full font-semibold text-xs text-white ${
                    card.priority === 'URGENT' ? 'bg-red-500' :
                    card.priority === 'HIGH' ? 'bg-orange-500' : 'bg-[#174CD2]'
                  }`}>
                    {card.priority}
                  </span>
               </div>

               {card.dueDate && (
                 <div>
                    <h4 className="font-semibold text-xs text-[#8E8E8E] mb-1">{t('Due date', "Date d'échéance")}</h4>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#040028] dark:text-white">
                       <Calendar size={14} />
                       {new Date(card.dueDate).toLocaleDateString()}
                    </div>
                 </div>
               )}
            </div>

            <div className="space-y-2">
               <h4 className="font-semibold text-xs text-[#8E8E8E]">{t('Actions', 'Actions')}</h4>
               <NeuButton
                 onClick={() => convertMutation.mutate()}
                 active
                 className="w-full flex justify-center items-center gap-2"
                 disabled={!!card.postId}
               >
                 <ArrowRight size={16}/> {card.postId ? t('Synced to feed', 'Synchronisé') : t('Convert to post', 'Convertir en publication')}
               </NeuButton>

               <NeuButton className="w-full flex justify-center items-center gap-2 !text-red-500 hover:!border-red-200 dark:hover:!border-red-900/40">
                 <Trash2 size={16}/> {t('Archive card', 'Archiver la carte')}
               </NeuButton>
            </div>

            {/* Mini Activity Log */}
            <div className="space-y-2">
               <h4 className="font-semibold text-xs text-[#8E8E8E]">{t('Recent activity', 'Activité récente')}</h4>
               <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {card.activities?.slice(0, 5).map(a => (
                    <div key={a.id} className="text-xs flex gap-2">
                       <span className="font-semibold text-[#174CD2]">{a.user.firstName}</span>
                       <span className="text-[#8E8E8E]">{a.action}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </NeuModal>
  );
}
