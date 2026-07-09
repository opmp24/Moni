import { useState } from "react"
import { format, parse } from "date-fns"
import { es } from "react-day-picker/locale"
import { DayPicker } from "react-day-picker"
import { CalendarBlank } from "@phosphor-icons/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import "react-day-picker/style.css"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 border-border bg-card px-2 text-xs text-card-foreground hover:bg-accent hover:text-accent-foreground",
            className,
          )}
        >
          <CalendarBlank className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" weight="bold" />
          {selected ? format(selected, "d MMM yyyy", { locale: es }) : "Seleccionar fecha"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-border bg-card p-0" align="start">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"))
            }
            setOpen(false)
          }}
          locale={es}
          weekStartsOn={1}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
