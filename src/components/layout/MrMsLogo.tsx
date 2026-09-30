import { Atom } from 'lucide-react';

export function MrMsLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-indigo-600 rounded-xl ${className}`}>
      <Atom className="w-5 h-5 text-white" />
    </div>
  );
}
