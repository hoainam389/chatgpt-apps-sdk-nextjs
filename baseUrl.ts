const getBaseURL = () => {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL;

  if (host) {
    return host.startsWith("http") ? host : `https://${host}`;
  }

  return "http://localhost:3000";
};

export const baseURL = getBaseURL();
