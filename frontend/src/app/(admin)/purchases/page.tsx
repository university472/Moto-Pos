// frontend/src/app/(admin)/purchases/page.tsx
"use client";

import Link from "next/link";
import { Plus, Loader2, Truck, Package } from "lucide-react";
import { usePurchases } from "@/hooks/usePurchases";
import { formatPKR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function PurchasesPage() {
  const { data, isLoading } = usePurchases();
  const purchases = data?.purchases ?? [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <Truck className="h-6 w-6" style={{ color: "#0F5469" }} /> Purchases
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
            Stock purchase history — each entry increases product stock
          </p>
        </div>
        <Link href="/purchases/new">
          <Button className="flex items-center gap-2 text-white font-semibold"
            style={{ backgroundColor: "#0F5469" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1A7A96")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0F5469")}>
            <Plus className="h-4 w-4" /> New Purchase Entry
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#0F5469" }} />
            <span className="ml-2 text-sm" style={{ color: "#64748B" }}>Loading purchases...</span>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-10 w-10 mx-auto mb-3" style={{ color: "#E2E8F0" }} />
            <p className="text-sm font-medium" style={{ color: "#1E293B" }}>No purchases recorded</p>
            <p className="text-sm" style={{ color: "#64748B" }}>Add a purchase entry to update stock.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Purchase No.</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Date</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p._id}>
                  <td>
                    <span className="font-mono text-sm font-semibold" style={{ color: "#0F5469" }}>
                      {p.purchaseNumber}
                    </span>
                  </td>
                  <td className="font-medium" style={{ color: "#1E293B" }}>
                    {typeof p.supplier === "object" ? p.supplier.name : p.supplier}
                  </td>
                  <td style={{ color: "#64748B" }}>
                    {p.items.length} item{p.items.length !== 1 ? "s" : ""}
                  </td>
                  <td>
                    <span className="font-numeric font-semibold" style={{ color: "#1E293B" }}>
                      {formatPKR(p.totalAmount)}
                    </span>
                  </td>
                  <td style={{ color: "#64748B" }}>{formatDate(p.purchaseDate)}</td>
                  <td style={{ color: "#64748B" }}>
                    {typeof p.createdBy === "object" ? p.createdBy.name : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}