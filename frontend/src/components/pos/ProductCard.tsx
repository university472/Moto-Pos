// frontend/src/components/pos/ProductCard.tsx

'use client'

import { ShoppingCart, AlertTriangle } from 'lucide-react'
import type { ProductSearchResult } from '@/types/product'
import { useCartStore } from '@/store/cartStore'
import { formatPKR } from '@/lib/utils'

interface ProductCardProps {
  product: ProductSearchResult
  isSelected?: boolean
  onAdd?: () => void
}

export function ProductCard({
  product,
  isSelected = false,
  onAdd
}: ProductCardProps) {
  const { addItem, items } = useCartStore()

  // Check if product already exists in cart
  const cartItem = items.find((item) => item.productId === product._id)

  const currentQtyInCart = cartItem?.quantity ?? 0

  const remainingStock = product.stockQty - currentQtyInCart

  const isOutOfStock = product.stockQty <= 0

  const isAtStockLimit = remainingStock <= 0 && product.stockQty > 0

  const isLowStock =
    product.stockQty > 0 && product.stockQty <= 5 && !isAtStockLimit

  const isDisabled = isOutOfStock || isAtStockLimit

  const handleAdd = () => {
    if (isDisabled) {
      return
    }

    addItem(product)

    onAdd?.()
  }

  // Stock badge
  const getStockBadge = () => {
    if (isOutOfStock) {
      return {
        label: 'Out of Stock',
        className: 'badge-out-stock'
      }
    }

    if (isAtStockLimit) {
      return {
        label: `Max (${product.stockQty})`,
        className: 'badge-out-stock'
      }
    }

    if (isLowStock) {
      return {
        label: `Low: ${product.stockQty} left`,
        className: 'badge-low-stock'
      }
    }

    return {
      label: `Stock: ${product.stockQty}`,
      className: 'badge-in-stock'
    }
  }

  const stockBadge = getStockBadge()

  return (
    <div
      className={`
        product-card
        flex
        items-center
        gap-4
        group
        transition-all
        duration-150
        border
        rounded-xl
        p-4

        ${isSelected ? 'product-card-selected' : 'border-slate-200'}

        ${isDisabled ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={handleAdd}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !isDisabled) {
          handleAdd()
        }
      }}
      aria-label={`Add ${product.name} to cart`}
      data-disabled={isDisabled}
    >
      {/* Product Information */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="product-name truncate">{product.name}</p>

          {isLowStock && (
            <AlertTriangle className="low-stock-icon h-4 w-4 flex-shrink-0 mt-0.5" />
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* SKU */}
          <span className="sku-badge">{product.sku}</span>

          {/* Brand */}
          {typeof product.brand === 'object' && product.brand?.name && (
            <span className="brand-name">{product.brand.name}</span>
          )}

          {/* Stock Badge */}
          <span className={stockBadge.className}>{stockBadge.label}</span>

          {/* Already In Cart */}
          {currentQtyInCart > 0 && (
            <span className="cart-indicator">{currentQtyInCart} in cart</span>
          )}
        </div>
      </div>

      {/* Price + Add Button */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="product-price font-numeric">
            {formatPKR(product.salePrice)}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleAdd()
          }}
          disabled={isDisabled}
          className={`
            add-cart-btn
            flex
            items-center
            gap-1.5
            px-3
            py-2
            rounded-lg
            text-sm
            font-semibold
            text-white
            transition-all
            duration-150
            flex-shrink-0

            ${isDisabled ? 'add-cart-btn-disabled' : 'add-cart-btn-active'}
          `}
          tabIndex={-1}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="h-4 w-4" />

          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </div>
  )
}
