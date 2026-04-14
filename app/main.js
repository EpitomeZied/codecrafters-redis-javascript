const net = require("net");

const server = net.createServer();
const port = 6379;
const host = "127.0.0.1";

server.on("connection", (socket) => {
    socket.on("data", (data) => {
        const command = data.toString().split("\r\n");
        if (command[2].toLowerCase() === "ping") {
            socket.write("+PONG\r\n");
        } else if (command[2].toLowerCase() === "echo") {
            socket.write('$' + command[4].length + '\r\n' + command[4] + '\r\n');
        }
    })


    socket.on("end", () => {
        console.log("Client disconnect")
    })
    socket.on("error", (err) => {
        console.error("Socket error:", err.message);
    })
})

server.listen(port, host, () => {
    console.log(`server running at ${host}:${port}`)
})