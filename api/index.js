export default async (req, res) => {
  const { createApp } = await import("../dist/app.js");
  const app = createApp();
  return app(req, res);
};
