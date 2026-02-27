"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FormStatus } from "@/components/admin/form-status";
import { getRentalsAdmin, deleteRental } from "./actions";
import type { RentalItem } from "@/lib/types";

export default function RentalsListPage() {
  const [items, setItems] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RentalItem | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getRentalsAdmin();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteRental(deleteTarget.id);
    setDeleteTarget(null);
    if (result.success) {
      setStatus({ type: "success", message: `"${deleteTarget.name}" deleted` });
      load();
    } else {
      setStatus({ type: "error", message: result.error || "Delete failed" });
    }
  }

  if (loading) return <LoadingSpinner message="Loading rentals..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-foreground">Rentals</h1>
          <p className="mt-1 text-sm text-muted">{items.length} items</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/rentals/settings"
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-light transition-colors hover:bg-surface-light"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Link
            href="/admin/rentals/new"
            className="flex items-center gap-2 rounded-md bg-laser-cyan px-4 py-2 text-sm font-semibold text-background transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Link>
        </div>
      </div>

      {status && <FormStatus type={status.type} message={status.message} />}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const hasImage = item.imageUrl && !item.imageUrl.includes("pub-XXXX");
              return (
                <tr key={item.id} className="border-b border-border transition-colors hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-border">
                        {hasImage ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-surface text-xs text-muted">--</div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{item.name}</span>
                        <p className="text-xs text-muted">{item.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-light capitalize">{item.category}</td>
                  <td className="px-4 py-3 text-muted-light">
                    {item.dailyRate ? `$${item.dailyRate}/day` : "On request"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${item.available ? "text-emerald-400" : "text-amber-400"}`}>
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/rentals/${item.id}`} className="rounded p-1.5 text-muted-light transition-colors hover:bg-surface-light hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => setDeleteTarget(item)} className="rounded p-1.5 text-muted-light transition-colors hover:bg-red-500/10 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Rental Item"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
