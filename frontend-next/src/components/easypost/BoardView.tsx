'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi, Board, BoardColumn, Card } from '@/services/boardApi';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MoreVertical, Calendar, User as UserIcon, 
  MessageSquare, Trash2, ArrowRight, Layout,
  MoreHorizontal, GripVertical, Clock, AlertCircle
} from 'lucide-react';
import { NeuButton, NeuCard, NeuInput, NeuModal } from './DashboardUI';
import { cn } from '@/lib/utils';
import SpinningLoader from '../SpinningLoader';

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
  
  const queryClient = useQueryClient();

  // Fetch Boards
  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['boards', workspaceId],
    queryFn: () => boardApi.getBoards(workspaceId),
  });

  // Create Board Mutation
  const createBoardMutation = useMutation({
    mutationFn: (name: string) => boardApi.createBoard(workspaceId, { name }),
    onSuccess: (newBoard) => {
      toast.success('BOARD_INITIALIZED');
      setIsCreateBoardOpen(false);
      setNewBoardName('');
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] });
      setSelectedBoardId(newBoard.id);
    },
    onError: () => toast.error('BOARD_INIT_FAILED')
  });

  if (isLoading) return <SpinningLoader />;

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
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">Workspace Boards</h2>
          <p className="text-sm font-bold text-gray-500 uppercase">Manage your projects and tasks</p>
        </div>
        <NeuButton onClick={() => setIsCreateBoardOpen(true)} className="bg-[#3C48F5] text-white">
          <Plus size={20} className="mr-2" /> NEW_BOARD
        </NeuButton>
      </div>

      {boards.length === 0 ? (
        <div className="py-20 text-center border-4 border-dashed border-gray-300 dark:border-zinc-800">
          <Layout size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-black uppercase text-gray-400">No boards found in this workspace</h3>
          <button 
            onClick={() => setIsCreateBoardOpen(true)}
            className="mt-4 text-[#3C48F5] font-black uppercase underline hover:no-underline"
          >
            Create your first board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <motion.div
              key={board.id}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedBoardId(board.id)}
              className="cursor-pointer"
            >
              <NeuCard className="h-full hover:border-[#3C48F5] transition-colors group relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 right-0 h-2" 
                  style={{ backgroundColor: board.color || '#3C48F5' }}
                />
                <div className="pt-4">
                  <h3 className="text-lg font-black uppercase mb-2 group-hover:text-[#3C48F5]">{board.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{board.description || 'No description provided'}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-dashed border-gray-100 dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase bg-gray-100 dark:bg-zinc-800 px-2 py-1">
                      {board._count?.columns || 0} COLUMNS
                    </span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
        title="INITIALIZE_BOARD"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase mb-1 block">Board Name</label>
            <NeuInput 
              placeholder="E.G. MARKETING_CAMPAIGN_2026"
              value={newBoardName}
              onChange={(e: any) => setNewBoardName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <NeuButton onClick={() => setIsCreateBoardOpen(false)} className="bg-white">CANCEL</NeuButton>
            <NeuButton 
              onClick={() => createBoardMutation.mutate(newBoardName)}
              className="bg-[#3C48F5] text-white"
            >
              CREATE_BOARD
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
    queryFn: () => boardApi.getBoardDetails(boardId),
  });

  const updateBoardMutation = useMutation({
    mutationFn: (name: string) => boardApi.updateBoard(boardId, { name }),
    onSuccess: () => {
      setIsEditBoardOpen(false);
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success('BOARD_UPDATED');
    }
  });

  const updateColumnMutation = useMutation({
    mutationFn: (data: { id: string, name: string }) => boardApi.updateColumn(data.id, { name: data.name }),
    onSuccess: () => {
      setIsEditColumnOpen(false);
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success('COLUMN_UPDATED');
    }
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (id: string) => boardApi.deleteColumn(id),
    onSuccess: () => {
      setIsEditColumnOpen(false);
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      toast.success('COLUMN_DELETED');
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
      toast.success('CARD_CREATED');
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

  if (isLoading || !board) return <SpinningLoader />;

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
            className="p-2 border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowRight className="rotate-180" size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">{board.name}</h2>
              <p className="text-xs font-bold text-gray-500 uppercase italic">Board View • {board.columns?.length || 0} Columns</p>
            </div>
            <button 
              onClick={() => setIsEditBoardOpen(true)}
              className="p-2 border-2 border-black dark:border-white hover:bg-yellow-200 transition-colors"
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
            
            <button className="flex-shrink-0 w-80 h-16 border-4 border-dashed border-gray-300 dark:border-zinc-800 flex items-center justify-center gap-2 hover:border-[#3C48F5] hover:text-[#3C48F5] transition-all group">
              <Plus size={20} />
              <span className="font-black uppercase text-sm">Add Column</span>
            </button>
          </div>
        </DndContext>
      </div>

      {/* Board Rename Modal */}
      <NeuModal
        isOpen={isEditBoardOpen}
        onClose={() => setIsEditBoardOpen(false)}
        title="RENAME_BOARD"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase mb-1 block">New Name</label>
            <NeuInput 
              value={editBoardName}
              onChange={(e: any) => setEditBoardName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <NeuButton onClick={() => setIsEditBoardOpen(false)} className="bg-white">CANCEL</NeuButton>
            <NeuButton 
              onClick={() => updateBoardMutation.mutate(editBoardName)}
              className="bg-[#3C48F5] text-white"
            >
              UPDATE
            </NeuButton>
          </div>
        </div>
      </NeuModal>

      {/* Column Edit Modal */}
      <NeuModal
        isOpen={isEditColumnOpen}
        onClose={() => setIsEditColumnOpen(false)}
        title="MANAGE_COLUMN"
      >
        <div className="space-y-6">
          <div>
            <label className="text-xs font-black uppercase mb-1 block">Column Name</label>
            <NeuInput 
              value={editColumnName}
              onChange={(e: any) => setEditColumnName(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-100">
            <button 
              onClick={() => {
                if(confirm('Are you sure? This will delete all cards in this column.')) {
                  deleteColumnMutation.mutate(editingColumn!.id);
                }
              }}
              className="text-red-500 font-black uppercase text-xs hover:underline"
            >
              Delete Column
            </button>
            <div className="flex gap-3">
              <NeuButton onClick={() => setIsEditColumnOpen(false)} className="bg-white">CANCEL</NeuButton>
              <NeuButton 
                onClick={() => updateColumnMutation.mutate({ id: editingColumn!.id, name: editColumnName })}
                className="bg-black text-white"
              >
                SAVE_CHANGES
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
        title="NEW_CARD"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase mb-1 block">Title</label>
            <NeuInput 
              placeholder="TASK_TITLE..."
              value={newCardTitle}
              onChange={(e: any) => setNewCardTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <NeuButton onClick={() => setIsCreateCardOpen(false)} className="bg-white">CANCEL</NeuButton>
            <NeuButton 
              onClick={() => createCardMutation.mutate({ columnId: targetColumnId!, title: newCardTitle })}
              className="bg-[#3C48F5] text-white"
              disabled={!newCardTitle.trim()}
            >
              CREATE
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
          <h3 className="font-black uppercase text-sm tracking-tight">{column.name}</h3>
          <span className="text-[10px] font-black bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5">
            {column.cards?.length || 0}
          </span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onAddCard}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Plus size={16} />
          </button>
          <button 
            onClick={onEditColumn}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 bg-gray-50 dark:bg-zinc-900/50 border-2 border-black dark:border-white p-3 space-y-3 overflow-y-auto custom-scrollbar"
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
          <div className="h-20 border-2 border-dashed border-gray-300 dark:border-zinc-800 flex items-center justify-center">
             <p className="text-[10px] font-black uppercase text-gray-400">Empty_Column</p>
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
      case 'MEDIUM': return 'bg-blue-500';
      default: return 'bg-gray-500';
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
        className="p-3 cursor-pointer hover:border-[#3C48F5] transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className={`w-8 h-1 ${getPriorityColor(card.priority)}`} />
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={14} />
            </div>
          </div>
          
          <h4 className="font-bold text-sm leading-tight">{card.title}</h4>
          
          {card.description && (
            <p className="text-[10px] text-gray-500 line-clamp-2 italic">{card.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex -space-x-2">
              {card.assignee ? (
                <div className="w-6 h-6 border-2 border-black bg-white rounded-none overflow-hidden" title={card.assignee.firstName}>
                  <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${card.assignee.firstName}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-6 h-6 border-2 border-black bg-gray-100 flex items-center justify-center rounded-none">
                  <UserIcon size={12} className="text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
              {card._count?.comments ? (
                <div className="flex items-center gap-0.5">
                  <MessageSquare size={10} /> {card._count.comments}
                </div>
              ) : null}
              {card.dueDate && (
                <div className="flex items-center gap-0.5">
                  <Clock size={10} />
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
      toast.success('COMMENT_POSTED');
    }
  });

  const convertMutation = useMutation({
    mutationFn: () => boardApi.convertToPost(cardId),
    onSuccess: () => {
      toast.success('NODE_SYNCED_TO_CONTENT_FEED');
      queryClient.invalidateQueries({ queryKey: ['card', cardId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  if (!card) return null;

  return (
    <NeuModal
      isOpen={isOpen}
      onClose={onClose}
      title="CARD_INSPECTOR"
      maxWidth="max-w-3xl"
    >
      {isLoading ? <SpinningLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
               <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{card.title}</h3>
               <p className="text-xs font-bold text-gray-500 uppercase italic">In column: {card.column?.name}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-black uppercase text-xs">Description</h4>
              <div className="p-4 bg-gray-50 dark:bg-zinc-900 border-2 border-black dark:border-white min-h-[100px] text-sm">
                {card.description || 'No description provided.'}
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
               <h4 className="font-black uppercase text-xs flex items-center gap-2">
                 <MessageSquare size={14}/> Discussions ({card.comments?.length || 0})
               </h4>
               
               <div className="flex gap-2">
                  <NeuInput 
                    placeholder="WRITE_A_REPLY..." 
                    value={comment}
                    onChange={(e: any) => setComment(e.target.value)}
                  />
                  <NeuButton 
                    onClick={() => addCommentMutation.mutate(comment)}
                    className="bg-black text-white"
                    disabled={!comment.trim()}
                  >
                    SEND
                  </NeuButton>
               </div>

               <div className="space-y-3 mt-4">
                 {card.comments?.map((c) => (
                   <div key={c.id} className="p-3 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 flex gap-3">
                      <div className="w-8 h-8 border-2 border-black bg-white flex-shrink-0">
                         <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${c.author.firstName}`} className="w-full h-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-black uppercase text-[10px]">{c.author.firstName}</span>
                           <span className="text-[10px] text-gray-400 italic">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm">{c.content}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 border-2 border-black dark:border-white bg-yellow-50 dark:bg-zinc-900 space-y-4">
               <div>
                  <h4 className="font-black uppercase text-[10px] text-gray-400 mb-1">Assignee</h4>
                  {card.assignee ? (
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 border-2 border-black overflow-hidden">
                          <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${card.assignee.firstName}`} className="w-full h-full" />
                       </div>
                       <span className="font-bold text-xs">{card.assignee.firstName}</span>
                    </div>
                  ) : <p className="text-xs font-bold text-gray-300">Unassigned</p>}
               </div>

               <div>
                  <h4 className="font-black uppercase text-[10px] text-gray-400 mb-1">Priority</h4>
                  <span className={`px-2 py-0.5 font-black text-[10px] uppercase text-white ${
                    card.priority === 'URGENT' ? 'bg-red-500' : 
                    card.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {card.priority}
                  </span>
               </div>

               {card.dueDate && (
                 <div>
                    <h4 className="font-black uppercase text-[10px] text-gray-400 mb-1">Due Date</h4>
                    <div className="flex items-center gap-2 text-xs font-bold">
                       <Calendar size={14} />
                       {new Date(card.dueDate).toLocaleDateString()}
                    </div>
                 </div>
               )}
            </div>

            <div className="space-y-2">
               <h4 className="font-black uppercase text-xs">Actions</h4>
               <NeuButton 
                 onClick={() => convertMutation.mutate()} 
                 className="w-full bg-[#3C48F5] text-white flex justify-center items-center gap-2"
                 disabled={!!card.postId}
               >
                 <ArrowRight size={16}/> {card.postId ? 'SYNCED_TO_FEED' : 'CONVERT_TO_POST'}
               </NeuButton>
               
               <NeuButton className="w-full bg-white border-red-500 text-red-500 hover:bg-red-50 flex justify-center items-center gap-2">
                 <Trash2 size={16}/> ARCHIVE_CARD
               </NeuButton>
            </div>

            {/* Mini Activity Log */}
            <div className="space-y-2">
               <h4 className="font-black uppercase text-[10px] text-gray-400">Recent Activity</h4>
               <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {card.activities?.slice(0, 5).map(a => (
                    <div key={a.id} className="text-[10px] flex gap-2">
                       <span className="font-black uppercase text-[#3C48F5]">{a.user.firstName}</span>
                       <span className="italic">{a.action}</span>
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
