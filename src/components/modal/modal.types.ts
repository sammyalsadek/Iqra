export interface ModalProps {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  danger?: boolean;
  /** If true, show only the confirm button (no cancel). */
  singleButton?: boolean;
}
