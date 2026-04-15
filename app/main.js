const net = require("node:net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const map = new Map();

const server = net.createServer((connection) => {
    connection.on("data", (data) => {
        const command = data.toString().split("\r\n");
        if (command[2] === "PING") {
            connection.write("+PONG\r\n");
        } else if (command[2] === "ECHO") {
            const message = command[4];
            connection.write(`$${message.length}\r\n${message}\r\n`);
        } else if (command[2] === "SET") {
            map.set(command[4], command[6]);
            connection.write(`+OK\r\n`);
        } else if (command[2] === "GET") {
            const message = map.get(command[4]);
            if (!message) {
                connection.write(`$-1\r\n`); // Null Bulk String
            } else {
                connection.write(`$${message.length}\r\n${message}\r\n`);
            }
        }
    });
});

server.listen(6379, "127.0.0.1", (err) => {
});