export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { config } = await import("dotenv");
    config(); // loads .env from process.cwd() by default
    if (!process.env.DATABASE_URL) {
      console.warn(
        "[DrugFlow] DATABASE_URL not set. Add a .env file (see .env.example). Skipping default admin creation."
      );
      return;
    }
    try {
      const { ensureDefaultAdmin } = await import("./lib/ensure-default-admin");
      await ensureDefaultAdmin();
    } catch (e) {
      console.warn("[DrugFlow] Could not ensure default admin:", (e as Error).message);
    }
  }
}
