"use client";

import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";

interface ArrayEditorProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function ArrayEditor({
  label,
  value,
  onChange,
  placeholder = "Enter value...",
}: ArrayEditorProps) {
  function add() {
    onChange([...value, ""]);
  }

  function update(index: number, text: string) {
    const next = [...value];
    next[index] = text;
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...value];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === value.length - 1) return;
    const next = [...value];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  const inputClass =
    "flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-light">{label}</label>
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => moveUp(i)}
            disabled={i === 0}
            className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => moveDown(i)}
            disabled={i === value.length - 1}
            className="rounded p-1 text-muted hover:text-foreground disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => remove(i)}
            className="rounded p-1 text-muted hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-laser-cyan"
      >
        <Plus className="h-3.5 w-3.5" />
        Add item
      </button>
    </div>
  );
}
