// frontend/src/components/pos/Cart.tsx
// Cart panel — right 40% of the POS screen.
// Shows all items, empty state, and scrollable item list.
// Renders CartItemRow for each item.

'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { CartItemRow } from './CartItem'

export function Cart() {
  const { items } = useCartStore()

  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full py-12 px-4"
        style={{ color: '#CBD5E1' }}
      >
        <ShoppingCart className="h-14 w-14 mb-4" style={{ color: '#E2E8F0' }} />
        <p
          className="text-sm font-medium text-center"
          style={{ color: '#94A3B8' }}
        >
          Cart is empty
        </p>
        <p className="text-xs text-center mt-1" style={{ color: '#CBD5E1' }}>
          Search for a product and click Add
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4">
      {items.map((item) => (
        <CartItemRow key={item.productId} item={item} />
      ))}
    </div>
  )
}
