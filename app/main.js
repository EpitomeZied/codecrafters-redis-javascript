const net = require("node:net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
const redisStore = new Map();

const server = net.createServer((connection) => {
    connection.on("data", (data) => {
        const command = data.toString().split("\r\n");
        if (command[2] === "PING") {
            connection.write("+PONG\r\n");
        } else if (command[2] === "ECHO") {
            const message = command[4];
            connection.write(`$${message.length}\r\n${message}\r\n`); // Bulk String
        } else if (command[2] === "SET") {
            const key = command[4], value = {value: command[6], expiresAt: Date.now() + Number(command[10])};
            redisStore.set(key, value);
            connection.write(`+OK\r\n`);
        } else if (command[2] === "GET") {
            const message = redisStore.get(command[4]);
            if (message === undefined || message.expiresAt < Date.now()) {
                connection.write(`$-1\r\n`); // Null Bulk String
            } else {
                connection.write(`$${message.value.length}\r\n${message.value}\r\n`); // Bulk String
            }
        } else if (command[2] === "RPUSH") {
            const key = command[4];
            const values = [];
            for (let i = 6; i < command.length - 1; i += 2) { // 6 , 8, 10 , ...
                values.push(command[i]);
            }
            const list = redisStore.get(key) || [];
            list.push(...values);
            redisStore.set(key, list);
            connection.write(`:${list.length}\r\n`);
        } else if (command[2] === "LRANGE") {
            const key = command[4];
            let start = Number(command[6]), end = Number(command[8]);
            let message = [];
            const values = redisStore.get(key) || [];
            if (start < 0) start = Math.max(values.length + start , 0);
            if (end < 0) end =  Math.max(values.length + end , 0);

            for (let i = start; i < Math.min(end + 1, values.length); i++) {
                message.push(`$${values[i].length}\r\n${values[i]}\r\n`);
            }
            connection.write(`*${message.length}\r\n${message.join("")}`); // Array
        }else if(command[2] === "LPUSH") {
            const key = command[4];
            const newValues = [];
            for (let i = command.length - 2; i >= 6; i -= 2) { // 10 , 8, 6 , ...
                newValues.push(command[i]);
            }
            const list = redisStore.get(key) || [];
            newValues.push(...list);
            redisStore.set(key, newValues);
            connection.write(`:${newValues.length}\r\n`);
        }

    });
});
server.listen(6379, "127.0.0.1", (err) => {
});
