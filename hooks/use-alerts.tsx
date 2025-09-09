"use client";

import { toast } from "sonner";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export const useAlerts = () => {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
    });
  };

  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
    });
  };

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
    });
  };

  const confirm = async (
    message: string,
    options: ConfirmOptions = {}
  ): Promise<boolean> => {
    const {
      title = "Confirmation",
      description = message,
      confirmText = "Confirmer",
      cancelText = "Annuler",
    } = options;

    return new Promise((resolve) => {
      toast(title, {
        description: (
          <span className="text-muted-foreground text-sm">{description}</span>
        ),
        action: {
          label: confirmText,
          onClick: () => resolve(true),
        },
        cancel: {
          label: cancelText,
          onClick: () => resolve(false),
        },
        duration: Infinity, // Le toast reste affiché jusqu'à ce que l'utilisateur fasse un choix
      });
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    confirm,
  };
};
