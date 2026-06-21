import Fastify from "fastify";

const app = Fastify();

app.get("/", async () => {
  return {
    status: "ok",
  };
});

export default app;
