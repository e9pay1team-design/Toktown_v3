import { TokkenCoin } from '../../assets/misc';
import { useToastStore } from '../../store/useToastStore';

const KIND_ICON: Record<string, string> = {
  info: '💬',
  success: '✅',
  error: '🚫',
};

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[900] flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in flex items-center gap-2 rounded-full border border-town-line bg-town-ink/90 px-4 py-2.5 text-[13px] font-bold text-town-paper shadow-card"
        >
          {t.kind === 'tokken' ? <TokkenCoin size={18} /> : <span>{KIND_ICON[t.kind]}</span>}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
