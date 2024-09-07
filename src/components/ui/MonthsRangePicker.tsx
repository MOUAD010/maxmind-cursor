"use client";

import { useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthPickerProps {
  selectedDate: { startDate: string; endDate: string } | null;
  onRangeChange: (dates: { startDate: string; endDate: string } | null) => void;
}

export default function MonthPicker({
  selectedDate,
  onRangeChange,
}: MonthPickerProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(
    selectedDate ? new Date(selectedDate.startDate) : null
  );

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const handleMonthSelect = (month: number) => {
    const selected = new Date(currentYear, month, 1);
    setInternalSelectedDate(selected);

    const startDate = `${currentYear}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${currentYear}-${String(month + 1).padStart(
      2,
      "0"
    )}-${new Date(currentYear, month + 1, 0).getDate()}`;

    onRangeChange({ startDate, endDate });
  };

  const handleYearChange = (change: number) => {
    setCurrentYear((prev) => prev + change);
  };

  const formatSelectedDate = () => {
    if (!internalSelectedDate) return "Select a month";
    return internalSelectedDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date-range-picker"
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            "border-input bg-background hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatSelectedDate()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleYearChange(-1)}
              aria-label="Previous year"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{currentYear}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleYearChange(1)}
              aria-label="Next year"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                variant="outline"
                className={cn(
                  "h-9",
                  internalSelectedDate &&
                    internalSelectedDate.getMonth() === index &&
                    internalSelectedDate.getFullYear() === currentYear &&
                    "bg-primary text-primary-foreground"
                )}
                onClick={() => handleMonthSelect(index)}
              >
                {month}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
