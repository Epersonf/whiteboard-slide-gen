export type ExportStage = 'preparing' | 'rendering' | 'encoding' | 'done';

export type ExportProgress = {
  stage: ExportStage;
  ratio: number; // 0..1
  message?: string;
};

export type ExportHandle = {
  result: Promise<Blob>;
  cancel: () => void;
};
