import http from "http";
import { dbConnect } from "./config/db.js";
import app from "./app.js";
import { initSocket } from "./socket/index.js";

const PORT = process.env.PORT;

const server = http.createServer(app);

dbConnect();

export const io = initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
