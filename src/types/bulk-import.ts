export type BulkImportRowStatus =
  | "pending"
  | "processing"
  | "imported"
  | "already_exists"
  | "failed";

export type BulkImportRow = {
  url: string;
  status: BulkImportRowStatus;
  error?: string;
  toolId?: string;
  toolName?: string;
};

export type BulkImportUrlResult =
  | {
      status: "imported";
      toolId: string;
      toolName: string;
    }
  | {
      status: "already_exists";
      toolId: string;
      toolName: string;
    }
  | {
      status: "failed";
      error: string;
    };
