const net = require("node:net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((connection) => {
    connection.on("data", (data) => {
        const commend = data.toString().split("\r\n");
        if (commend[2] === "ping"){
            connection.write(`+PONG\r\n`);
        }else if(commend[2] === "echo"){
            connection.write(`+${commend[3]}\r\n`);
        }

    });
});

server.listen(6379, "127.0.0.1", (err) => {});