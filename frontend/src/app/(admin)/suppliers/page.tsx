'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Users, Phone } from 'lucide-react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  type Supplier
} from '@/hooks/useSuppliers'

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

import './suppliers.css'

const supplierSchema = z.object({
  name: z.string().trim().min(2, 'Min 2 characters').max(100),

  contactPerson: z.string().trim().max(80).optional(),

  phone: z.string().trim().max(30).optional(),

  address: z.string().trim().max(300).optional(),

  notes: z.string().trim().max(500).optional()
})

type SupplierForm = z.infer<typeof supplierSchema>

export default function SuppliersPage() {
  const { data, isLoading } = useSuppliers()

  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const deleteSupplier = useDeleteSupplier()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [deleting, setDeleting] = useState<Supplier | null>(null)

  const suppliers = data?.suppliers ?? []

  const addForm = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '',
      address: '',
      notes: ''
    }
  })

  const editForm = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema)
  })

  const onAdd = async (data: SupplierForm) => {
    await createSupplier.mutateAsync({
      ...data,
      contactPerson: data.contactPerson || '',
      phone: data.phone || '',
      address: data.address || '',
      notes: data.notes || '',
      brands: []
    })

    addForm.reset()
    setIsAddOpen(false)
  }

  const onEditOpen = (supplier: Supplier) => {
    setEditing(supplier)

    editForm.reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      notes: supplier.notes || ''
    })
  }

  const onEdit = async (data: SupplierForm) => {
    if (!editing) return

    await updateSupplier.mutateAsync({
      id: editing._id,
      data
    })

    setEditing(null)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users className="page-title-icon" />
            Suppliers
          </h1>

          <p className="page-description">
            Manage suppliers and their contact details
          </p>
        </div>

        <Button
          onClick={() => {
            addForm.reset()
            setIsAddOpen(true)
          }}
          className="primary-btn"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="loading-spinner" />
            <span>Loading suppliers...</span>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="empty-state">
            <Users className="empty-icon" />

            <p className="empty-title">No suppliers yet</p>

            <p className="empty-description">
              Add your first supplier to get started.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Brands Supplied</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td className="supplier-name">{supplier.name}</td>

                  <td className="muted-text">
                    {supplier.contactPerson || '—'}
                  </td>

                  <td>
                    {supplier.phone ? (
                      <span className="phone-cell">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td>
                    <div className="brands-wrapper">
                      {supplier.brands.length > 0 ? (
                        supplier.brands.map((brand) => (
                          <span key={brand._id} className="brand-badge">
                            {brand.name}
                          </span>
                        ))
                      ) : (
                        <span className="empty-brand">—</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        supplier.isActive ? 'badge-in-stock' : 'badge-out-stock'
                      }
                    >
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    <div className="actions-wrapper">
                      <button
                        type="button"
                        title="Edit supplier"
                        aria-label="Edit supplier"
                        onClick={() => onEditOpen(supplier)}
                        className="icon-btn"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        title="Deactivate supplier"
                        aria-label="Deactivate supplier"
                        disabled={!supplier.isActive}
                        onClick={() => setDeleting(supplier)}
                        className="icon-btn delete-btn"
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
      </div>

      {/* ADD MODAL */}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>

          <form onSubmit={addForm.handleSubmit(onAdd)}>
            <div className="form-body">
              <div className="form-group">
                <Label>Supplier Name *</Label>

                <Input
                  placeholder="e.g. Ali Traders Lahore"
                  autoFocus
                  {...addForm.register('name')}
                />

                {addForm.formState.errors.name && (
                  <p className="error-text">
                    {addForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <Label>Contact Person</Label>

                  <Input
                    placeholder="e.g. Malik Akhtar"
                    {...addForm.register('contactPerson')}
                  />
                </div>

                <div className="form-group">
                  <Label>Phone</Label>

                  <Input
                    placeholder="+92-300-XXXXXXX"
                    {...addForm.register('phone')}
                  />
                </div>
              </div>

              <div className="form-group">
                <Label>Address</Label>

                <Input
                  placeholder="City, Area"
                  {...addForm.register('address')}
                />
              </div>

              <div className="form-group">
                <Label>Notes</Label>

                <Textarea
                  rows={2}
                  className="no-resize"
                  placeholder="Optional notes"
                  {...addForm.register('notes')}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={createSupplier.isPending}
                className="primary-btn"
              >
                {createSupplier.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Supplier'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEdit)}>
            <div className="form-body">
              <div className="form-group">
                <Label>Supplier Name *</Label>

                <Input {...editForm.register('name')} />

                {editForm.formState.errors.name && (
                  <p className="error-text">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <Label>Contact Person</Label>

                  <Input {...editForm.register('contactPerson')} />
                </div>

                <div className="form-group">
                  <Label>Phone</Label>

                  <Input {...editForm.register('phone')} />
                </div>
              </div>

              <div className="form-group">
                <Label>Address</Label>

                <Input {...editForm.register('address')} />
              </div>

              <div className="form-group">
                <Label>Notes</Label>

                <Textarea
                  rows={2}
                  className="no-resize"
                  {...editForm.register('notes')}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={updateSupplier.isPending}
                className="primary-btn"
              >
                {updateSupplier.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Supplier</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to deactivate{' '}
              <strong>{deleting?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="danger-btn"
              onClick={async () => {
                if (!deleting) return

                await deleteSupplier.mutateAsync(deleting._id)

                setDeleting(null)
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
