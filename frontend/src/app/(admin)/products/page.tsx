// frontend/src/app/(admin)/products/page.tsx
// Product list with search + brand/category filter + pagination.

'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react'

import { useProductList, useDeleteProduct } from '@/hooks/useProducts'

import { useBrands } from '@/hooks/useBrands'
import { useCategories } from '@/hooks/useCategories'

import { formatPKR } from '@/lib/utils'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/shared/TableSkeleton'

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

import { PopulatedProduct } from '@/types/product'

export default function ProductsPage() {
  const router = useRouter()

  const [page, setPage] = useState(1)

  const [search, setSearch] = useState('')

  const [brandFilter, setBrandFilter] = useState('')

  const [categoryFilter, setCategoryFilter] = useState('')

  const [deletingProduct, setDeletingProduct] =
    useState<PopulatedProduct | null>(null)

  const { data, isLoading } = useProductList({
    page,
    limit: 20,
    q: search,
    brand: brandFilter,
    category: categoryFilter
  })

  const { data: brandsData } = useBrands()

  const { data: categoriesData } = useCategories()

  const deleteProduct = useDeleteProduct()

  const products = data?.products ?? []

  const pagination = data?.pagination

  const brands = brandsData?.brands ?? []

  const categories = categoriesData?.categories ?? []

  const handleSearch = useCallback((val: string) => {
    setSearch(val)
    setPage(1)
  }, [])

  const handleDelete = async () => {
    if (!deletingProduct) return

    await deleteProduct.mutateAsync(deletingProduct._id)

    setDeletingProduct(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <Package
              className="h-6 w-6"
              style={{
                color: '#0F5469'
              }}
            />
            Products
          </h1>

          <p
            className="text-sm mt-0.5"
            style={{
              color: '#64748B'
            }}
          >
            {pagination?.totalItems ?? 0} products in catalogue
          </p>
        </div>

        <Link href="/products/new">
          <Button
            className="flex items-center gap-2 text-white font-semibold"
            style={{
              backgroundColor: '#0F5469'
            }}
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
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-3 mb-4 p-4 bg-white rounded-lg border"
        style={{
          borderColor: '#E2E8F0'
        }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{
              color: '#94A3B8'
            }}
          />

          <Input
            title="Search products"
            aria-label="Search products"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 text-sm"
            style={{
              borderColor: '#E2E8F0'
            }}
          />
        </div>

        {/* Brand Filter */}
        <select
          title="Filter by brand"
          aria-label="Filter by brand"
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value)

            setPage(1)
          }}
          className="text-sm px-3 py-2 rounded-lg border outline-none"
          style={{
            borderColor: '#E2E8F0',
            color: '#1E293B'
          }}
        >
          <option value="">All Brands</option>

          {brands.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          title="Filter by category"
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)

            setPage(1)
          }}
          className="text-sm px-3 py-2 rounded-lg border outline-none"
          style={{
            borderColor: '#E2E8F0',
            color: '#1E293B'
          }}
        >
          <option value="">All Categories</option>

          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {(search || brandFilter || categoryFilter) && (
          <button
            title="Clear filters"
            aria-label="Clear filters"
            onClick={() => {
              setSearch('')
              setBrandFilter('')
              setCategoryFilter('')
              setPage(1)
            }}
            className="text-xs px-3 py-2 rounded-lg font-medium"
            style={{
              backgroundColor: '#F8FAFC',
              color: '#64748B',
              border: '1px solid #E2E8F0'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-lg border overflow-hidden"
        style={{
          borderColor: '#E2E8F0'
        }}
      >
        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package
              className="h-10 w-10 mx-auto mb-3"
              style={{
                color: '#E2E8F0'
              }}
            />

            <p
              className="text-sm font-medium"
              style={{
                color: '#1E293B'
              }}
            >
              {search || brandFilter || categoryFilter
                ? 'No products match your filters'
                : 'No products yet'}
            </p>

            <p
              className="text-sm mt-1"
              style={{
                color: '#64748B'
              }}
            >
              {!(search || brandFilter || categoryFilter) &&
                'Add your first product to get started.'}
            </p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>

                  <th>SKU</th>

                  <th>Brand</th>

                  <th>Category</th>

                  <th className="text-right">Sale Price</th>

                  <th className="text-center">Stock</th>

                  <th className="text-center">Status</th>

                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const isLow =
                    product.stockQty <= product.lowStockThreshold &&
                    product.stockQty > 0

                  const isOut = product.stockQty === 0

                  return (
                    <tr key={product._id}>
                      <td>
                        <p
                          className="font-medium text-sm"
                          style={{
                            color: '#1E293B'
                          }}
                        >
                          {product.name}
                        </p>

                        {product.description && (
                          <p
                            className="text-xs truncate max-w-xs"
                            style={{
                              color: '#94A3B8'
                            }}
                          >
                            {product.description}
                          </p>
                        )}
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
                          {product.sku}
                        </span>
                      </td>

                      <td
                        className="text-sm"
                        style={{
                          color: '#64748B'
                        }}
                      >
                        {typeof product.brand === 'object'
                          ? product.brand.name
                          : '—'}
                      </td>

                      <td
                        className="text-sm"
                        style={{
                          color: '#64748B'
                        }}
                      >
                        {typeof product.category === 'object'
                          ? product.category.name
                          : '—'}
                      </td>

                      <td
                        className="text-right font-numeric font-semibold text-sm"
                        style={{
                          color: '#1E293B'
                        }}
                      >
                        {formatPKR(product.salePrice)}
                      </td>

                      <td className="text-center">
                        <span
                          className="font-numeric font-bold text-sm"
                          style={{
                            color: isOut
                              ? '#DC2626'
                              : isLow
                                ? '#F59E0B'
                                : '#16A34A'
                          }}
                        >
                          {product.stockQty}
                        </span>
                      </td>

                      <td className="text-center">
                        {isOut ? (
                          <span className="badge-out-stock">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge-low-stock">Low Stock</span>
                        ) : (
                          <span className="badge-in-stock">In Stock</span>
                        )}
                      </td>

                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Edit product"
                            aria-label="Edit product"
                            onClick={() =>
                              router.push(`/products/${product._id}/edit`)
                            }
                            className="p-1.5 rounded-md transition-colors"
                            style={{
                              color: '#64748B'
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            title="Deactivate product"
                            aria-label="Deactivate product"
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{
                              color: '#64748B'
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Delete Confirm */}
      <AlertDialog
        open={deletingProduct !== null}
        onOpenChange={(o) => {
          if (!o) setDeletingProduct(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Product</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to deactivate{' '}
              <strong>{deletingProduct?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="text-white"
              style={{
                backgroundColor: '#DC2626'
              }}
            >
              {deleteProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Deactivate'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
