const REQUIRED_ENV_VARS = [
  "JWT_SECRET",
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "DATABASE_URL",
  "RESEND_API_KEY",
] as const;

const validateFormat = (key: string, value: string): string | null => {
  switch (key) {
    case "DATABASE_URL":
      try {
        new URL(value);
      } catch {
        return "must be a valid URL (e.g., postgresql://user:pass@host:port/db)";
      }
      break;
    case "JWT_SECRET":
      if (value.length < 32) {
        return "must be at least 32 characters long";
      }
      break;
    case "CLOUDINARY_API_KEY":
      if (!/^\d+$/.test(value.trim())) {
        return "must be a numeric value";
      }
      break;
  }
  return null;
};

export const validateEnv = (): void => {
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
      continue;
    }
    const formatError = validateFormat(key, value);
    if (formatError) {
      invalid.push(`${key} ${formatError}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Server cannot start.`
    );
  }

  if (invalid.length > 0) {
    throw new Error(
      `Invalid environment variables: ${invalid.join("; ")}. Server cannot start.`
    );
  }
};
