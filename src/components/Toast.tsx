interface ToastItem { id: string; text: string; }
interface Props { toasts: ToastItem[]; }

export function ToastZone({ toasts }: Props) {
  return (
    <div className="toast-zone">
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.text}</div>
      ))}
    </div>
  );
}
