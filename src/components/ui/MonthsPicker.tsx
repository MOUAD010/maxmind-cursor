"use client";

import React, { useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface MonthsRangePickerProps {
  onRangeChange: (range: DateRange) => void;
}

export default function MonthsRangePicker({
  onRangeChange,
}: MonthsRangePickerProps) {
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectingEnd, setSelectingEnd] = useState<boolean>(false);

  const months: string[] = [
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
    const selectedDate = new Date(currentYear, month, 1);
    if (!selectingEnd) {
      setStartDate(selectedDate);
      setSelectingEnd(true);
    } else {
      setEndDate(selectedDate);
      setSelectingEnd(false);
      if (startDate) {
        const formattedStartDate = `${startDate.getFullYear()}-${String(
          startDate.getMonth() + 1
        ).padStart(2, "0")}-01`;
        const formattedEndDate = `${selectedDate.getFullYear()}-${String(
          selectedDate.getMonth() + 1
        ).padStart(2, "0")}-${new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0
        ).getDate()}`;
        onRangeChange({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });
      }
    }
  };

  const handleYearChange = (change: number) => {
    setCurrentYear((prev) => prev + change);
  };

  const isInRange = (month: number): boolean => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentYear, month, 1);
    return date >= startDate && date <= endDate;
  };

  const isSelectable = (month: number): boolean => {
    if (!selectingEnd) return true;
    if (!startDate) return true;
    const date = new Date(currentYear, month, 1);
    return date > startDate;
  };

  const formatDateRange = (): string => {
    if (!startDate) return "Select start month";
    if (!endDate)
      return `${startDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      })} - Select end month`;
    return `${startDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    })} - ${endDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    })}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            "border-input bg-background hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleYearChange(-1)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{currentYear}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleYearChange(1)}
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
                  isInRange(index) && "bg-primary/50 text-primary-foreground",
                  startDate &&
                    startDate.getMonth() === index &&
                    startDate.getFullYear() === currentYear &&
                    "bg-primary text-primary-foreground",
                  endDate &&
                    endDate.getMonth() === index &&
                    endDate.getFullYear() === currentYear &&
                    "bg-primary text-primary-foreground",
                  !isSelectable(index) && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isSelectable(index) && handleMonthSelect(index)}
                disabled={!isSelectable(index)}
              >
                {month}
              </Button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {selectingEnd ? "Select end month" : "Select start month"}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
