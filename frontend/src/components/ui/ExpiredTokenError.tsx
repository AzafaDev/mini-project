import { Link } from "react-router-dom";

interface ExpiredTokenErrorProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const ExpiredTokenError = ({
  title = "Link sudah kadaluarsa",
  message = "Link ini hanya berlaku sementara. Silakan minta link baru.",
  actionText = "Kirim ulang permintaan",
  actionLink = "/",
  onActionClick,
}: ExpiredTokenErrorProps) => {
  const content = (
    <div className="p-6 bg-warning/10 border border-warning/30 rounded-xl text-center space-y-4">
      <span className="material-symbols-outlined text-4xl text-warning">timer_off</span>
      <h3 className="text-lg font-bold text-warning">{title}</h3>
      <p className="text-text-muted text-sm">{message}</p>
      <button
        onClick={onActionClick}
        className="inline-block px-6 py-2 bg-primary text-primary-dark rounded-lg font-bold text-sm hover:opacity-90 transition-all"
      >
        {actionText}
      </button>
    </div>
  );

  if (actionLink && !onActionClick) {
    return <Link to={actionLink}>{content}</Link>;
  }
  return content;
};
