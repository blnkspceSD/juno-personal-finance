/**
 * Category Color Picker
 * Simple color picker for category customization
 */

'use client'

import { Check } from 'lucide-react'

interface CategoryColorPickerProps {
  selectedColor: string
  onColorSelect: (color: string) => void
}

const PRESET_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#64748b', // slate-500
  '#6b7280', // gray-500
  '#374151', // gray-700
]

export function CategoryColorPicker({
  selectedColor,
  onColorSelect
}: CategoryColorPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onColorSelect(color)}
          className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ backgroundColor: color }}
          title={`Select color ${color}`}
        >
          {selectedColor === color && (
            <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
          )}
        </button>
      ))}
    </div>
  )
}