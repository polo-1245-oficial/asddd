let result = 0;
let username = "rpinews";
let wallet_id = Math.floor(Math.random() * 2811);
let rigid = `AmogOS-${wallet_id}`;

function getTime() {
    let date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();

    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;

    return h + ":" + m + ":" + s;
}



function connect() {
    socket = new WebSocket("wss://magi.duinocoin.com:14808");

    socket.onmessage = (msg) => {
        serverMessage = msg.data.replace("\n", "");

        if (serverMessage.includes("2.")) {
            postMessage(`${getTime()} | ` + "CPU" + workerVer + ": Connected to node. Server is on version " + serverMessage);
            socket.send("JOB," + username + ",LOW");
        } else if (serverMessage.includes("GOOD")) {
            postMessage(`${getTime()} | ` + "CPU" + workerVer + ": Share accepted:" + result);
            postMessage("GoodShare");
            socket.send("JOB," + username + ",LOW");
        } else if (serverMessage.includes("BAD")) {
            postMessage(`${getTime()} | ` + "CPU" + workerVer + ": Share rejected: " + result);
            postMessage("BadShare");
            socket.send("JOB," + username + ",LOW");
        } else if (serverMessage.includes("This user doesn't exist")) {
            postMessage(`${getTime()} | ` + "CPU" + workerVer + ": User not found!");
            postMessage("Error");
        } else if (serverMessage.includes("Too many workers")) {
            postMessage(`${getTime()} | ` + "CPU" + workerVer + ": Too many workers");
            postMessage("Error");
        } else if (serverMessage.length > 40) {
            postMessage(`${getTime()} | ` + "CPU" + workerVer + ": Job received: " + serverMessage);
            job = serverMessage.split(",");
            difficulty = job[2];
            postMessage("UpdateDiff," + difficulty + "," + workerVer);

            startingTime = performance.now();
            for (result = 0; result < 100 * difficulty + 1; result++) {
                let ducos1 = new Hashes.SHA1().hex(job[0] + result);
                if (job[1] === ducos1) {
                    endingTime = performance.now();
                    timeDifference = (endingTime - startingTime) / 1000;
                    hashrate = (result / timeDifference).toFixed(2);

                    postMessage("UpdateLog," + `${getTime()} | ` + "CPU" + workerVer + ": Nonce found: " + result + " Time: " + Math.round(timeDifference) + "s Hashrate: " + Math.round(hashrate / 1000) + " kH/s<br>");
                    postMessage(`${getTime()} | ` + "CPU" + workerVer + ": Nonce found: " + result + " Time: " + timeDifference + " Hashrate: " + hashrate + "H/s");
                    postMessage("UpdateHashrate," + timeDifference + "," + hashrate + "," + workerVer);

                    socket.send(result + "," + hashrate + ",AmogOS Web Miner," + rigid + ",," + wallet_id);
                }
            }    
        }
   }
};

connect();