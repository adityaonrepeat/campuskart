"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground"
        )}
      >
        {selected ? selected.name : isLoading ? "Loading…" : "Select your college…"}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-80 p-0">
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
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === college.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{college.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
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
