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
            connection.write(`$${message.length}\r\n${message}\r\n`); // Bulk String
        } else if (command[2] === "SET") {
            const key = command[4] , value = {value : command[6] , expiresAt: Date.now() + command[10]};
            map.set(key , value);
            connection.write(`+OK\r\n`);
        } else if (command[2] === "GET") {
            const message = map.get(command[4]);
            if (message === undefined || message.expiresAt < Date.now()) {
                connection.write(`$-1\r\n`); // Null Bulk String
            } else {
                connection.write(`$${message.value.length}\r\n${message.value}\r\n`); // Bulk String
            }
        }
    });
});

server.listen(6379, "127.0.0.1", (err) => {
});
