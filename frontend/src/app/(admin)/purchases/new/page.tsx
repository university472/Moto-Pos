'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Plus, Trash2, Loader2, Truck, ArrowLeft, Package } from 'lucide-react'

import { useSuppliers } from '@/hooks/useSuppliers'
import { useCreatePurchase } from '@/hooks/usePurchases'
import { useProductSearch } from '@/hooks/useProductSearch'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { formatPKR } from '@/lib/utils'

import './purchase-new.css'

const purchaseSchema = z.object({
  supplier: z.string().min(1, 'Select a supplier'),

  purchaseDate: z.string().optional(),

  notes: z.string().max(500).optional()
})

type PurchaseForm = z.infer<typeof purchaseSchema>

interface PurchaseLineItem {
  productId: string
  productName: string
  productSku: string
  quantityReceived: number
  purchasePricePerUnit: number
  updateProductPrice: boolean
}

export default function NewPurchasePage() {
  const router = useRouter()

  const { data: suppliersData } = useSuppliers()

  const createPurchase = useCreatePurchase()

  const {
    query,
    setQuery,
    results,
    isLoading: isSearching
  } = useProductSearch(300)

  const [lineItems, setLineItems] = useState<PurchaseLineItem[]>([])

  const [showSearch, setShowSearch] = useState(false)

  const form = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),

    defaultValues: {
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: ''
    }
  })

  const suppliers = suppliersData?.suppliers ?? []

  const addProduct = (product: {
    _id: string
    name: string
    sku: string
    purchasePrice: number
  }) => {
    const exists = lineItems.find((item) => item.productId === product._id)

    if (exists) return

    setLineItems((prev) => [
      ...prev,
      {
        productId: product._id,
        productName: product.name,
        productSku: product.sku,
        quantityReceived: 1,
        purchasePricePerUnit: product.purchasePrice,
        updateProductPrice: false
      }
    ])

    setQuery('')
    setShowSearch(false)
  }

  const updateItem = (
    idx: number,
    field: keyof PurchaseLineItem,
    value: number | boolean
  ) => {
    setLineItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    )
  }

  const removeItem = (idx: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.quantityReceived * item.purchasePricePerUnit,
    0
  )

  const onSubmit = async (formData: PurchaseForm) => {
    if (lineItems.length === 0) return

    await createPurchase.mutateAsync({
      supplier: formData.supplier,

      items: lineItems.map((item) => ({
        product: item.productId,
        quantityReceived: item.quantityReceived,
        purchasePricePerUnit: item.purchasePricePerUnit,
        updateProductPrice: item.updateProductPrice
      })),

      purchaseDate: formData.purchaseDate,

      notes: formData.notes
    })

    router.push('/purchases')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/purchases" className="back-link">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Purchases
          </Link>

          <h1 className="page-title">
            <Truck className="page-title-icon" />
            New Purchase Entry
          </h1>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="purchase-grid">
          {/* LEFT */}

          <div className="left-panel">
            <div className="card">
              <h3 className="section-title">Purchase Details</h3>

              <div className="form-stack">
                <div className="form-group">
                  <Label htmlFor="supplier">Supplier *</Label>

                  <select
                    id="supplier"
                    title="Select supplier"
                    aria-label="Select supplier"
                    {...form.register('supplier')}
                    className="custom-select"
                  >
                    <option value="">Select supplier...</option>

                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>

                  {form.formState.errors.supplier && (
                    <p className="error-text">
                      {form.formState.errors.supplier.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>

                  <Input
                    id="purchaseDate"
                    type="date"
                    title="Purchase date"
                    aria-label="Purchase date"
                    {...form.register('purchaseDate')}
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="notes">Notes / Supplier Invoice No.</Label>

                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Supplier invoice number, delivery notes..."
                    title="Purchase notes"
                    aria-label="Purchase notes"
                    className="no-resize"
                    {...form.register('notes')}
                  />
                </div>
              </div>
            </div>

            {/* TOTAL CARD */}

            <div className="total-card">
              <p className="total-label">Total Purchase Amount</p>

              <p className="total-amount">{formatPKR(totalAmount)}</p>

              <p className="total-products">
                {lineItems.length} product
                {lineItems.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Button
              type="submit"
              disabled={lineItems.length === 0 || createPurchase.isPending}
              className="submit-btn"
            >
              {createPurchase.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Recording...
                </>
              ) : (
                'Record Purchase & Update Stock'
              )}
            </Button>
          </div>

          {/* RIGHT */}

          <div className="right-panel">
            <div className="card">
              <div className="products-header">
                <h3 className="section-title">Products Received</h3>

                <Button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  className="primary-btn"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>

              {showSearch && (
                <div className="search-panel">
                  <Input
                    placeholder="Search product by name or SKU..."
                    title="Search products"
                    aria-label="Search products"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />

                  {isSearching && (
                    <p className="searching-text">Searching...</p>
                  )}

                  {results.length > 0 && (
                    <div className="search-results">
                      {results.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          title={`Add ${product.name}`}
                          aria-label={`Add ${product.name}`}
                          onClick={() => addProduct(product)}
                          className="search-item"
                        >
                          <div>
                            <p className="search-item-title">{product.name}</p>

                            <p className="search-item-sku">{product.sku}</p>
                          </div>

                          <div className="search-item-right">
                            <p>Cost: {formatPKR(product.purchasePrice)}</p>

                            <p>Stock: {product.stockQty}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    title="Cancel search"
                    aria-label="Cancel search"
                    onClick={() => {
                      setShowSearch(false)
                      setQuery('')
                    }}
                    className="cancel-search-btn"
                  >
                    Cancel search
                  </button>
                </div>
              )}

              {lineItems.length === 0 ? (
                <div className="empty-state">
                  <Package className="empty-icon" />

                  <p className="empty-text">
                    Add products received in this purchase
                  </p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>

                      <th className="text-center w-28">Qty</th>

                      <th className="text-right w-36">Cost/Unit</th>

                      <th className="text-right w-28">Subtotal</th>

                      <th className="text-center w-28">Update</th>

                      <th className="w-12"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={item.productId}>
                        <td>
                          <p className="product-name">{item.productName}</p>

                          <p className="product-sku">{item.productSku}</p>
                        </td>

                        <td>
                          <input
                            type="number"
                            min={1}
                            title="Quantity received"
                            aria-label="Quantity received"
                            value={item.quantityReceived}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                'quantityReceived',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="table-input"
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min={0}
                            title="Purchase price per unit"
                            aria-label="Purchase price per unit"
                            value={item.purchasePricePerUnit}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                'purchasePricePerUnit',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="table-input text-right"
                          />
                        </td>

                        <td className="subtotal-cell">
                          {formatPKR(
                            item.quantityReceived * item.purchasePricePerUnit
                          )}
                        </td>

                        <td className="text-center">
                          <input
                            type="checkbox"
                            title="Update stored product cost"
                            aria-label="Update stored product cost"
                            checked={item.updateProductPrice}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                'updateProductPrice',
                                e.target.checked
                              )
                            }
                            className="checkbox-input"
                          />
                        </td>

                        <td>
                          <button
                            type="button"
                            title="Remove product"
                            aria-label="Remove product"
                            onClick={() => removeItem(idx)}
                            className="delete-btn"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
