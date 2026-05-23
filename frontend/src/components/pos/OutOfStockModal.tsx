// frontend/src/components/pos/OutOfStockModal.tsx

'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import './out-of-stock-modal.css'

interface OutOfStockModalProps {
  open: boolean
  onClose: () => void
}

export function OutOfStockModal({ open, onClose }: OutOfStockModalProps) {
  const { items, updateQuantity, removeItem } = useCartStore()

  // Items where cart quantity exceeds available stock
  const problematicItems = items.filter((item) => item.quantity > item.stockQty)

  const handleSetToMax = (productId: string, stockQty: number) => {
    if (stockQty === 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, stockQty)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md out-of-stock-dialog">
        <DialogHeader>
          <DialogTitle className="stock-dialog-title">
            <div className="warning-icon-wrapper">
              <AlertTriangle className="warning-icon" />
            </div>

            <span className="dialog-title-text">
              Stock Issue — Cannot Generate Bill
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-body">
          <p className="dialog-description">
            The following items in your cart exceed the available stock. Please
            fix them before generating the bill:
          </p>

          <div className="problematic-items">
            {problematicItems.map((item) => (
              <div key={item.productId} className="problematic-item-card">
                <div className="problematic-item-header">
                  <div className="problematic-item-info">
                    <p className="product-name">{item.productName}</p>

                    <p className="product-sku">{item.sku}</p>

                    <div className="stock-info-row">
                      <span className="cart-qty">
                        In cart: <strong>{item.quantity}</strong>
                      </span>

                      <span className="available-qty">
                        Available: <strong>{item.stockQty}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="action-buttons">
                    {item.stockQty > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleSetToMax(item.productId, item.stockQty)
                        }
                        className="fix-button"
                      >
                        Set to {item.stockQty}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="remove-button"
                      >
                        Remove Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {problematicItems.length > 1 && (
            <button
              type="button"
              onClick={() => {
                problematicItems.forEach((item) => {
                  handleSetToMax(item.productId, item.stockQty)
                })
              }}
              className="fix-all-button"
            >
              Fix All — Set Each to Maximum Available
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="close-button"
          aria-label="Close modal"
        >
          <X className="close-icon" />
        </button>
      </DialogContent>
    </Dialog>
  )
}
