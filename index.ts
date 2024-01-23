import http from "http";
import app from "./app";
import "./database";
import { startBot } from "./service/bobot";

const server = http.createServer(app);

const port = app.get("port") || 8000; // Ensure 'port' is set in 'app'

server.listen(port, () => {
  console.log(`>> Server is running on port ${port}`);
  startBot();
});
