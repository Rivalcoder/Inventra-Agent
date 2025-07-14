"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sale } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/lib/context/currency-context";

interface ViewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale;
}

export function ViewSaleDialog({
  open,
  onOpenChange,
  sale,
}: ViewSaleDialogProps) {
  const { currency } = useCurrency();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
          <DialogDescription>
            Complete information about this sale.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sale ID
              </p>
              <p className="text-sm">{sale.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date
              </p>
              <p className="text-sm">{formatDate(sale.date)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Product
            </p>
            <p className="text-sm font-medium">{sale.productName}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Price
              </p>
              <p className="text-sm">{formatCurrency(sale.price, currency)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Quantity
              </p>
              <p className="text-sm">{sale.quantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total
              </p>
              <p className="text-sm font-bold">{formatCurrency(sale.total, currency)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Customer
            </p>
            <p className="text-sm">{sale.customer || "Anonymous"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}