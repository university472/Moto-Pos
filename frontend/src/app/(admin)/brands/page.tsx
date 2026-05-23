// frontend/src/app/(admin)/brands/page.tsx
// Full brands management — list table, add modal, edit modal, delete confirm.
// Design: #0F5469 primary, #E2E8F0 borders, #F8FAFC background.

'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand
} from '@/hooks/useBrands'
import { Brand } from '@/types/brand'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

// ── Form schema ────────────────────────────────────────────────────────────
const brandFormSchema = z.object({
  name: z
    .string().min(1, 'Brand name is required')
    .min(2, 'Brand name must be at least 2 characters')
    .max(50, 'Cannot exceed 50 characters')
    .trim()
})
type BrandFormValues = z.infer<typeof brandFormSchema>

export default function BrandsPage() {
  const { data, isLoading, isError } = useBrands()
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const deleteBrand = useDeleteBrand()

  // ── Modal state ────────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null)

  // ── Form for Add ───────────────────────────────────────────────────────
  const addForm = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: '' }
  })

  // ── Form for Edit ──────────────────────────────────────────────────────
  const editForm = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: '' }
  })

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAddSubmit = async (data: BrandFormValues) => {
    await createBrand.mutateAsync(data.name)
    addForm.reset()
    setIsAddModalOpen(false)
  }

  const handleEditOpen = (brand: Brand) => {
    setEditingBrand(brand)
    editForm.reset({ name: brand.name })
  }

  const handleEditSubmit = async (data: BrandFormValues) => {
    if (!editingBrand) return
    await updateBrand.mutateAsync({ id: editingBrand._id, name: data.name })
    setEditingBrand(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return
    await deleteBrand.mutateAsync(deletingBrand._id)
    setDeletingBrand(null)
  }

  const brands = data?.brands ?? []

  return (
    <div>
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <Tag className="h-6 w-6" style={{ color: '#0F5469' }} />
            Brands
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            Manage motorcycle brands available in the system
          </p>
        </div>
        <Button
          onClick={() => {
            addForm.reset()
            setIsAddModalOpen(true)
          }}
          className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-md"
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
          Add Brand
        </Button>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
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
              Loading brands...
            </span>
          </div>
        ) : isError ? (
          <div
            className="text-center py-16 text-sm"
            style={{ color: '#DC2626' }}
          >
            Failed to load brands. Please refresh the page.
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-16">
            <Tag
              className="h-10 w-10 mx-auto mb-3"
              style={{ color: '#CBD5E1' }}
            />
            <p className="text-sm font-medium" style={{ color: '#1E293B' }}>
              No brands yet
            </p>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>
              Add your first brand to get started.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand._id}>
                  <td className="font-medium" style={{ color: '#1E293B' }}>
                    {brand.name}
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
                      {brand.slug}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        brand.isActive ? 'badge-in-stock' : 'badge-out-stock'
                      }
                    >
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-sm" style={{ color: '#64748B' }}>
                    {formatDateTime(brand.createdAt)}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditOpen(brand)}
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
                        title="Edit brand"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingBrand(brand)}
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
                        title="Deactivate brand"
                        disabled={!brand.isActive}
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

        {/* Row count footer */}
        {brands.length > 0 && (
          <div
            className="px-4 py-3 text-xs border-t"
            style={{
              borderColor: '#E2E8F0',
              color: '#64748B',
              backgroundColor: '#F8FAFC'
            }}
          >
            Showing {brands.length} brand{brands.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ── Add Brand Modal ───────────────────────────────────────────── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#1E293B' }}>
              Add New Brand
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(handleAddSubmit)}>
            <div className="py-4 space-y-2">
              <Label htmlFor="add-brand-name" style={{ color: '#64748B' }}>
                Brand Name
              </Label>
              <Input
                id="add-brand-name"
                placeholder="e.g. Honda, Yamaha, Suzuki"
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
                disabled={createBrand.isPending}
                className="text-white"
                style={{ backgroundColor: '#0F5469' }}
              >
                {createBrand.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Brand'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Brand Modal ──────────────────────────────────────────── */}
      <Dialog
        open={editingBrand !== null}
        onOpenChange={(open) => {
          if (!open) setEditingBrand(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#1E293B' }}>Edit Brand</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
            <div className="py-4 space-y-2">
              <Label htmlFor="edit-brand-name" style={{ color: '#64748B' }}>
                Brand Name
              </Label>
              <Input
                id="edit-brand-name"
                placeholder="Brand name"
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingBrand(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateBrand.isPending}
                className="text-white"
                style={{ backgroundColor: '#0F5469' }}
              >
                {updateBrand.isPending ? (
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
        open={deletingBrand !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingBrand(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#1E293B' }}>
              Deactivate Brand
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#64748B' }}>
              Are you sure you want to deactivate{' '}
              <strong style={{ color: '#1E293B' }}>
                {deletingBrand?.name}
              </strong>
              ? Products using this brand will remain in the system, but the
              brand will no longer appear in dropdowns.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingBrand(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="text-white"
              style={{ backgroundColor: '#DC2626' }}
            >
              {deleteBrand.isPending ? 'Deactivating...' : 'Yes, Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
