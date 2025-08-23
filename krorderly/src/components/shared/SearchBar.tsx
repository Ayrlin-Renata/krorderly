import type { JSX } from 'preact';

interface SearchBarProps {
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onInput, placeholder = "Search..." }: SearchBarProps) {
  const handleInput = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    onInput(event.currentTarget.value);
  };
  
  const handleClick = (event: JSX.TargetedEvent<HTMLInputElement, MouseEvent>) => {
    event.currentTarget.select();
  };
  return (
    <input
      type="text"
      value={value}
      onInput={handleInput}
      onClick={handleClick} 
      placeholder={placeholder}
      class="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
    />
  );
}
