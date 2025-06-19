import React from 'react';
import { create } from 'zustand';
import { Dialog } from './ui/dialog';
interface DialogButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface DialogOptions {
  title: string;
  message: string;
  buttons: DialogButton[];
}

interface DialogState extends DialogOptions {
  visible: boolean;
  show: (options: DialogOptions) => void;
  hide: () => void;
}

const useDialogStore = create<DialogState>((set) => ({
  visible: false,
  title: '',
  message: '',
  buttons: [],
  show: (options) => set({ visible: true, ...options }),
  hide: () => set({ visible: false }),
}));

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { visible, title, message, buttons, hide } = useDialogStore();

  return (
    <>
      {children}
      <Dialog
        visible={visible}
        title={title}
        message={message}
        buttons={buttons}
        onDismiss={hide}
      />
    </>
  );
};

export const dialogService = {
  confirm: (options: DialogOptions) => {
    useDialogStore.getState().show(options);
  },

  // Common confirmation dialogs
  confirmRemove: (onConfirm: () => void) => {
    dialogService.confirm({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from your cart?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onConfirm },
      ],
    });
  },

  confirmClearCart: (onConfirm: () => void) => {
    dialogService.confirm({
      title: 'Clear Cart',
      message: 'Are you sure you want to remove all items from your cart?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: onConfirm },
      ],
    });
  },

  confirmEmptyCart: () => {
    dialogService.confirm({
      title: 'Empty Cart',
      message: 'Please add items to your cart before checkout',
      buttons: [{ text: 'OK' }],
    });
  },
}; 