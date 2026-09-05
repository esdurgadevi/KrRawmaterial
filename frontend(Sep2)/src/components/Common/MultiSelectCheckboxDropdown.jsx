import React, { useState, useRef, useEffect } from "react";

/**
 * MultiSelectCheckboxDropdown
 * Reusable Multi-Select Checkbox Dropdown component for report filtering.
 * Features: None selected by default, "Select All" & "Clear All" buttons, search filter.
 */
const MultiSelectCheckboxDropdown = ({
  label,
  options = [],
  selectedValues = [],
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Normalize selectedValues into an Array of string values
  const currentSelected = Array.isArray(selectedValues)
    ? selectedValues.map(String)
    : typeof selectedValues === "string" && selectedValues.trim() !== ""
    ? selectedValues.split(",").map((s) => s.trim())
    : [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    (opt.label || String(opt.value))
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const isAllSelected =
    options.length > 0 && currentSelected.length === options.length;

  const handleSelectAll = () => {
    onChange(options.map((opt) => String(opt.value)));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleToggleItem = (val) => {
    const strVal = String(val);
    if (currentSelected.includes(strVal)) {
      onChange(currentSelected.filter((item) => item !== strVal));
    } else {
      onChange([...currentSelected, strVal]);
    }
  };

  // Determine button trigger text
  let triggerText = placeholder || `Select ${label || "Item"}s...`;
  if (currentSelected.length > 0) {
    if (currentSelected.length === options.length && options.length > 0) {
      triggerText = `All ${label || "Item"}s Selected`;
    } else if (currentSelected.length === 1) {
      const match = options.find(
        (opt) => String(opt.value) === currentSelected[0]
      );
      triggerText = match ? match.label : currentSelected[0];
    } else {
      triggerText = `${currentSelected.length} ${label || "Item"}s Selected`;
    }
  }

  return (
    <div className="relative w-full space-y-1" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-slate-800">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {options.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                Select All
              </button>
              <span className="text-slate-300 text-xs">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-red-600 hover:text-red-800 transition"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full cursor-pointer items-center justify-between rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm hover:border-blue-500 focus:outline-none bg-white ${
          currentSelected.length > 0
            ? "border-blue-500 text-blue-900"
            : "border-slate-300 text-slate-500"
        }`}
      >
        <span className="truncate">{triggerText}</span>
        <span className="ml-2 text-xs text-slate-400">
          {isOpen ? "▲" : "▼"}
        </span>
      </div>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-40 mt-1 flex max-h-64 w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {/* Header Action Bar & Search Bar */}
          <div className="border-b border-slate-100 bg-slate-50 p-2 space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {currentSelected.length} of {options.length} Selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${label || ""}...`}
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Checkboxes List */}
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const strVal = String(opt.value);
                const checked = currentSelected.includes(strVal);

                return (
                  <label
                    key={strVal}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition ${
                      checked
                        ? "bg-blue-50 text-blue-900 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleItem(strVal)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="truncate">{opt.label || opt.value}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectCheckboxDropdown;
