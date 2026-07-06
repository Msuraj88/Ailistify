"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { BulkImportDialog } from "@/components/admin/tools/bulk-import-dialog";
import { Button } from "@/components/ui/button";

export function AdminToolsActions() {
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
          <Layers className="h-4 w-4" />
          Bulk Import
        </Button>
        <Button asChild>
          <Link href="/admin/tools/new">
            <Plus className="h-4 w-4" />
            Add tool
          </Link>
        </Button>
      </div>

      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
      />
    </>
  );
}
