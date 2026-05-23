// frontend/src/components/pos/CartItem.tsx

'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus } from 'lucide-react'

import type { CartItem as CartItemType } from '@/store/cartStore'

import { useCartStore } from '@/store/cartStore'
import { formatPKR } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const [isEditingQty, setIsEditingQty] = useState(false)

  const [editValue, setEditValue] = useState(String(item.quantity))

  const handleQtyBlur = () => {
    setIsEditingQty(false)

    const parsed = parseInt(editValue, 10)

    if (!isNaN(parsed) && parsed > 0) {
      updateQuantity(item.productId, Math.min(parsed, item.stockQty))
    } else {
      setEditValue(String(item.quantity))
    }
  }

  const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }

    if (e.key === 'Escape') {
      setEditValue(String(item.quantity))
      setIsEditingQty(false)
    }

    if (e.key === 'Tab') {
      e.currentTarget.blur()
    }
  }

  const increment = () => {
    if (item.quantity < item.stockQty) {
      updateQuantity(item.productId, item.quantity + 1)

      setEditValue(String(item.quantity + 1))
    }
  }

  const decrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1)

      setEditValue(String(item.quantity - 1))
    } else {
      removeItem(item.productId)
    }
  }

  const isAtStockLimit = item.quantity >= item.stockQty

  return (
    <div className="cart-item-row py-3 border-b last:border-b-0">
      {/* Product Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="cart-product-name truncate">{item.productName}</p>

          <p className="cart-product-sku">{item.sku}</p>
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={() => removeItem(item.productId)}
          className="cart-remove-btn p-1 rounded flex-shrink-0 transition-colors"
          aria-label={`Remove ${item.productName}`}
          title={`Remove ${item.productName}`}
          tabIndex={-1}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Qty + Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Minus */}
          <button
            type="button"
            onClick={decrement}
            className="qty-btn"
            tabIndex={-1}
            aria-label="Decrease quantity"
            title="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>

          {/* Editable Qty */}
          {isEditingQty ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleQtyBlur}
              onKeyDown={handleQtyKeyDown}
              min={1}
              max={item.stockQty}
              placeholder="Qty"
              title="Enter quantity"
              aria-label={`Quantity for ${item.productName}`}
              className="qty-input"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditingQty(true)

                setEditValue(String(item.quantity))
              }}
              className="qty-display-btn"
              title="Click to edit quantity"
              aria-label={`Edit quantity for ${item.productName}`}
            >
              {item.quantity}
            </button>
          )}

          {/* Plus */}
          <button
            type="button"
            onClick={increment}
            disabled={isAtStockLimit}
            className={`
              qty-btn
              ${isAtStockLimit ? 'qty-btn-disabled' : ''}
            `}
            tabIndex={-1}
            aria-label="Increase quantity"
            title="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>

          <span className="unit-price">× {formatPKR(item.unitPrice)}</span>
        </div>

        {/* Subtotal */}
        <p className="item-subtotal font-numeric">{formatPKR(item.subtotal)}</p>
      </div>

      {/* Warning */}
      {isAtStockLimit && (
        <p className="stock-warning">
          ⚠ Maximum available stock reached ({item.stockQty} units)
        </p>
      )}
    </div>
  )
}
