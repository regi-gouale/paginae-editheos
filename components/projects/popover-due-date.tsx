"use client";

import { fr } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateProject } from "@/lib/actions/kanban";
import { formatDate, formatDateLong } from "@/lib/utils";

interface DeadlineSelectorPopoverProps {
  projectId: string;
  dueDate?: Date | null;
  isDetailView?: boolean;
  // onDueDateChange?: (date: Date | null) => void;
}

export function DeadlineSelectorPopover({
  projectId,
  dueDate,
  isDetailView = false,
}: // onDueDateChange,
DeadlineSelectorPopoverProps) {
  // Conversion du type pour compatibilité avec CalendarComponent
  const handleSelect = async (date: Date | undefined) => {
    if (date) {
      // onDueDateChange(date ?? null);

      await updateProject(projectId, { dueDate: date });
    }
  };

  function PopoverDueDateLabel() {
    if (dueDate instanceof Date) {
      if (isDetailView) {
        return formatDateLong(dueDate);
      }
      return formatDate(dueDate);
    }
    return "Sélectionner une date";
  }

  return (
    <div className="space-y-2">
      <Label>Date d&apos;échéance</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="w-full justify-start rounded-xl"
          >
            <Calendar className="mr-2 size-4" />
            {PopoverDueDateLabel()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={dueDate ?? undefined}
            onSelect={handleSelect}
            required={false}
            autoFocus
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
