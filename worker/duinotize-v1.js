!function(){var r;function v(r,n){var t=(65535&r)+(65535&n);return(r>>16)+(n>>16)+(t>>16)<<16|65535&t}function p(r,n){return r<<n|r>>>32-n}r={SHA1:function(r){var n=!(!r||"boolean"!=typeof r.uppercase)&&r.uppercase,t=!r||"boolean"!=typeof r.utf8||r.utf8;this.hex=function(r){return function(r,n){for(var t,e=n?"0123456789ABCDEF":"0123456789abcdef",o="",f=0,u=r.length;f<u;f+=1)t=r.charCodeAt(f),o+=e.charAt(t>>>4&15)+e.charAt(15&t);return o}((r=r,function(r){for(var n=32*r.length,t="",e=0;e<n;e+=8)t+=String.fromCharCode(r[e>>5]>>>24-e%32&255);return t}(function(r,n){var t,e,o,f,u,a,h,i,c=Array(80),C=1732584193,g=-271733879,d=-1732584194,l=271733878,A=-1009589776;for(r[n>>5]|=128<<24-n%32,r[15+(n+64>>9<<4)]=n,t=0;t<r.length;t+=16){for(f=C,u=g,a=d,h=l,i=A,e=0;e<80;e+=1)c[e]=e<16?r[t+e]:p(c[e-3]^c[e-8]^c[e-14]^c[e-16],1),o=v(v(p(C,5),function(r,n,t,e){if(r<20)return n&t|~n&e;if(r<40)return n^t^e;if(r<60)return n&t|n&e|t&e;return n^t^e}(e,g,d,l)),v(v(A,c[e]),function(r){return r<20?1518500249:r<40?1859775393:r<60?-1894007588:-899497514}(e))),A=l,l=d,d=p(g,30),g=C,C=o;C=v(C,f),g=v(g,u),d=v(d,a),l=v(l,h),A=v(A,i)}return Array(C,g,d,l,A)}(function(r){for(var n=8*r.length,t=Array(r.length>>2),e=t.length,o=0;o<e;o+=1)t[o]=0;for(o=0;o<n;o+=8)t[o>>5]|=(255&r.charCodeAt(o/8))<<24-o%32;return t}(r=t?function(r){var n,t,e,o="",f=-1;if(r&&r.length)for(e=r.length;(f+=1)<e;)n=r.charCodeAt(f),t=f+1<e?r.charCodeAt(f+1):0,55296<=n&&n<=56319&&56320<=t&&t<=57343&&(n=65536+((1023&n)<<10)+(1023&t),f+=1),n<=127?o+=String.fromCharCode(n):n<=2047?o+=String.fromCharCode(192|n>>>6&31,128|63&n):n<=65535?o+=String.fromCharCode(224|n>>>12&15,128|n>>>6&63,128|63&n):n<=2097151&&(o+=String.fromCharCode(240|n>>>18&7,128|n>>>12&63,128|n>>>6&63,128|63&n));return o}(r):r),8*r.length))),n)}}},Hashes=r}();

function getTime() {
    let date = new Date();
    let h = date.getHours();
    var AmOrPm = h >= 12 ? 'PM' : 'AM';
    h = (h % 12) || 12;
    let m = date.getMinutes();
    let s = date.getSeconds();

    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;

    return `${h}:${m}:${s}${AmOrPm}`;
}

function formatHash(bytes, decimals = 2) {
    if (bytes === 0) return 'No hashrate';

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

onmessage = function(event) {
    if (event.data.startsWith("Start")) {
        let getData = event.data.split(",");
        let result = 0;
        let username = getData[1];
        let rigid = getData[2];
        let workerVer = getData[3];
        let wallet_id = getData[4];
        let difficulty = getData[5];

        function connect() {
            var socket = new WebSocket("wss://magi.duinocoin.com:14808");

            socket.onmessage = function(event) {
                var serverMessage = event.data;
                if (serverMessage.includes("3.")) {
                    console.log(`${getTime()} | ` + "CPU" + workerVer + ": Connected to DUCO server as " + rigid + ". Server is on version " + serverMessage);
                    socket.send("JOB," + username + "," + difficulty);
                } else if (serverMessage.includes("GOOD")) {
                    console.log(`${getTime()} | ` + "CPU" + workerVer + ": Share accepted: " + result);
                    postMessage("GoodShare");
                    socket.send("JOB," + username + "," + difficulty);
                } else if (serverMessage.includes("BAD")) {
                    console.log(`${getTime()} | ` + "CPU" + workerVer + ": Share rejected: " + result);
                    postMessage("BadShare");
                    socket.send("JOB," + username + "," + difficulty);
                } else if (serverMessage.includes("This user doesn't exist")) {
                    console.log(`${getTime()} | ` + "CPU" + workerVer + ": User not found!");
                    postMessage("Error");
                } else if (serverMessage.includes("Too many workers")) {
                    console.log(`${getTime()} | ` + "CPU" + workerVer + ": Too many workers");
                    postMessage("Error");
                } else if (serverMessage.length > 40) {
                    console.log(`${getTime()} | ` + "CPU" + workerVer + ": Job received: " + serverMessage);
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
                            console.log(`${getTime()} | ` + "CPU" + workerVer + ": Nonce found: " + result + " Time: " + Math.round(timeDifference) + "s Hashrate: " + formatHash(hashrate));
                            postMessage("UpdateHashrate," + timeDifference + "," + hashrate + "," + workerVer);

                            socket.send(result + "," + hashrate + ",Duinotize," + rigid + ",," + wallet_id);
							onsole.log("------------------------------------------------------");
                        }
                    }
                } else {
                    console.log(`${getTime()} | ` + "CPU" + workerVer + ": " + serverMessage);
                    postMessage("Error");
					onsole.log("------------------------------------------------------");
                }
            }

            socket.onerror = function(event) {
                console.error("CPU" + workerVer + "WebSocket error observed, trying to reconnect: ", event);
                socket.close(1000, "Reason: Error occured in WebWorker.");
				onsole.log("------------------------------------------------------");
            }

            socket.onclose = function(event) {
                console.error("CPU" + workerVer + ": WebSocket close observed, trying to reconnect: ", event);
                setTimeout(function() {
					onsole.log("------------------------------------------------------");
                    connect();
                }, 15000);
            }
        }
        connect();
    }
}