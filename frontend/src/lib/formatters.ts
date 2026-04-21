export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount).replace("Rp", "IDR ");
};

export const formatDate = (
  dateString: string | undefined | null,
  type: "short" | "long" | "full" | "time" | "numeric" = "long"
): string => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  switch (type) {
    case "short":
      return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`;
    case "long":
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    case "full":
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    case "time":
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    case "numeric":
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    default:
      return date.toLocaleDateString();
  }
};

export const formatDateRelative = (dateString: string | undefined | null): string => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(dateString, "short");
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("id-ID").format(num);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
