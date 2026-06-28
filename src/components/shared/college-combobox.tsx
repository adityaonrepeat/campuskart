"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface CollegeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CollegeCombobox({ value, onChange, disabled }: CollegeComboboxProps) {
  const [open, setOpen] = useState(false);

  const { data: colleges = [], isLoading } = useQuery<College[]>({
    queryKey: ["colleges"],
    queryFn: () => fetch("/api/colleges").then((r) => r.json()),
    staleTime: Infinity,
  });

  const selected = colleges.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        disabled={disabled || isLoading}
        className={cn(
          "input-field flex w-full items-center justify-between text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">{selected ? selected.name : isLoading ? "Loading…" : "Select your college…"}</span>
        <svg className="ml-2 h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="p-0 ring-0 border border-border shadow-xl"
        style={{ width: "var(--radix-popover-trigger-width)", minWidth: "18rem" }}
      >
        <Command>
          <CommandInput placeholder="Search colleges…" />
          <CommandList>
            <CommandEmpty>No college found.</CommandEmpty>
            <CommandGroup>
              {colleges.map((college) => (
                <CommandItem
                  key={college.id}
                  value={college.name}
                  onSelect={() => {
                    onChange(college.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg data-selected:bg-accent data-selected:text-white"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 group-data-[selected=true]/command-item:text-white",
                      value === college.id ? "opacity-100 text-accent" : "opacity-0"
                    )}
                  />
                  <span className="flex-1 truncate text-sm">{college.name}</span>
                  <span className="shrink-0 text-xs">
                    {college.city}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
