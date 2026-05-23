// frontend/src/app/(admin)/categories/page.tsx
// Full categories management — list table, add modal, edit modal, delete confirm.
// Same design patterns as brands page.

'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Layers } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory
} from '@/hooks/useCategories'
import { Category } from '@/types/category'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .min(2, 'Must be at least 2 characters')
    .max(80, 'Cannot exceed 80 characters')
    .trim(),
  description: z
    .string()
    .max(300, 'Cannot exceed 300 characters')
    .trim()
    .optional()
})
type CategoryFormValues = z.infer<typeof categoryFormSchema>

export default function CategoriesPage() {
  const { data, isLoading, isError } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  )

  const addForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', description: '' }
  })

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', description: '' }
  })

  const handleAddSubmit = async (data: CategoryFormValues) => {
    await createCategory.mutateAsync(data)
    addForm.reset()
    setIsAddModalOpen(false)
  }

  const handleEditOpen = (category: Category) => {
    setEditingCategory(category)
    editForm.reset({
      name: category.name,
      description: category.description ?? ''
    })
  }

  const handleEditSubmit = async (data: CategoryFormValues) => {
    if (!editingCategory) return
    await updateCategory.mutateAsync({ id: editingCategory._id, data })
    setEditingCategory(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
    await deleteCategory.mutateAsync(deletingCategory._id)
    setDeletingCategory(null)
  }

  const categories = data?.categories ?? []

  return (
    <div>
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <Layers className="h-6 w-6" style={{ color: '#0F5469' }} />
            Categories
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            Manage product categories for the spare parts catalogue
          </p>
        </div>
        <Button
          onClick={() => {
            addForm.reset()
            setIsAddModalOpen(true)
          }}
          className="flex items-center gap-2 text-white text-sm font-semibold"
          style={{ backgroundColor: '#0F5469' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#1A7A96')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#0F5469')
          }
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-lg border overflow-hidden"
        style={{ borderColor: '#E2E8F0' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: '#0F5469' }}
            />
            <span className="ml-2 text-sm" style={{ color: '#64748B' }}>
              Loading categories...
            </span>
          </div>
        ) : isError ? (
          <div
            className="text-center py-16 text-sm"
            style={{ color: '#DC2626' }}
          >
            Failed to load categories. Please refresh the page.
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <Layers
              className="h-10 w-10 mx-auto mb-3"
              style={{ color: '#CBD5E1' }}
            />
            <p className="text-sm font-medium" style={{ color: '#1E293B' }}>
              No categories yet
            </p>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>
              Add your first category to get started.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td className="font-medium" style={{ color: '#1E293B' }}>
                    {category.name}
                  </td>
                  <td>
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: '#F8FAFC',
                        color: '#64748B',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      {category.slug}
                    </span>
                  </td>
                  <td
                    className="text-sm max-w-xs truncate"
                    style={{ color: '#64748B' }}
                  >
                    {category.description || (
                      <span style={{ color: '#CBD5E1' }}>No description</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        category.isActive ? 'badge-in-stock' : 'badge-out-stock'
                      }
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-sm" style={{ color: '#64748B' }}>
                    {formatDateTime(category.createdAt)}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditOpen(category)}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: '#64748B' }}
                        onMouseEnter={(e) => {
                          ;(
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = '#F8FAFC'
                          ;(e.currentTarget as HTMLButtonElement).style.color =
                            '#0F5469'
                        }}
                        onMouseLeave={(e) => {
                          ;(
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = 'transparent'
                          ;(e.currentTarget as HTMLButtonElement).style.color =
                            '#64748B'
                        }}
                        title="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(category)}
                        disabled={!category.isActive}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: '#64748B' }}
                        onMouseEnter={(e) => {
                          ;(
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = '#FEE2E2'
                          ;(e.currentTarget as HTMLButtonElement).style.color =
                            '#DC2626'
                        }}
                        onMouseLeave={(e) => {
                          ;(
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = 'transparent'
                          ;(e.currentTarget as HTMLButtonElement).style.color =
                            '#64748B'
                        }}
                        title="Deactivate category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {categories.length > 0 && (
          <div
            className="px-4 py-3 text-xs border-t"
            style={{
              borderColor: '#E2E8F0',
              color: '#64748B',
              backgroundColor: '#F8FAFC'
            }}
          >
            Showing {categories.length} categor
            {categories.length !== 1 ? 'ies' : 'y'}
          </div>
        )}
      </div>

      {/* ── Add Category Modal ────────────────────────────────────────── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#1E293B' }}>
              Add New Category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(handleAddSubmit)}>
            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>Category Name</Label>
                <Input
                  placeholder="e.g. Engine Parts, Electrical"
                  autoFocus
                  {...addForm.register('name')}
                  style={{
                    borderColor: addForm.formState.errors.name
                      ? '#DC2626'
                      : '#E2E8F0'
                  }}
                />
                {addForm.formState.errors.name && (
                  <p className="text-xs" style={{ color: '#DC2626' }}>
                    {addForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>
                  Description{' '}
                  <span style={{ color: '#94A3B8' }}>(optional)</span>
                </Label>
                <Textarea
                  placeholder="Brief description of what products belong in this category"
                  rows={3}
                  {...addForm.register('description')}
                  style={{ borderColor: '#E2E8F0', resize: 'none' }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategory.isPending}
                className="text-white"
                style={{ backgroundColor: '#0F5469' }}
              >
                {createCategory.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Category Modal ───────────────────────────────────────── */}
      <Dialog
        open={editingCategory !== null}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#1E293B' }}>
              Edit Category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>Category Name</Label>
                <Input
                  placeholder="Category name"
                  autoFocus
                  {...editForm.register('name')}
                  style={{
                    borderColor: editForm.formState.errors.name
                      ? '#DC2626'
                      : '#E2E8F0'
                  }}
                />
                {editForm.formState.errors.name && (
                  <p className="text-xs" style={{ color: '#DC2626' }}>
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>
                  Description{' '}
                  <span style={{ color: '#94A3B8' }}>(optional)</span>
                </Label>
                <Textarea
                  placeholder="Brief description"
                  rows={3}
                  {...editForm.register('description')}
                  style={{ borderColor: '#E2E8F0', resize: 'none' }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateCategory.isPending}
                className="text-white"
                style={{ backgroundColor: '#0F5469' }}
              >
                {updateCategory.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────── */}
      <AlertDialog
        open={deletingCategory !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#1E293B' }}>
              Deactivate Category
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#64748B' }}>
              Are you sure you want to deactivate{' '}
              <strong style={{ color: '#1E293B' }}>
                {deletingCategory?.name}
              </strong>
              ? Products in this category will remain, but the category will no
              longer appear in dropdowns.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCategory(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="text-white"
              style={{ backgroundColor: '#DC2626' }}
            >
              {deleteCategory.isPending ? 'Deactivating...' : 'Yes, Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
