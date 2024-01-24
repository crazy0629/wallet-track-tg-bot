// import WebSocket from "ws";

// export const connectWebSocket = () => {
//   const ws = new WebSocket("wss://ws.blockchain.info/inv");
//   const btcAddress = "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo"; // Replace with the BTC address you want to monitor

//   ws.on("open", function open() {
//     console.log("Connected to WebSocket");

//     // Subscribe to unconfirmed transactions for a specific BTC address
//     ws.send(JSON.stringify({ op: "addr_sub", addr: btcAddress }));
//   });

//   ws.on("message", function incoming(data) {
//     const response = JSON.parse(data);
//     console.log("1111", response);

//     if (response.op === "utx") {
//       const tx = response.x;

//       // Check each output to see if it was sent to our address
//       tx.out.forEach((output) => {
//         if (output.addr === btcAddress) {
//           console.log(
//             `Received transaction for ${output.value / 100000000} BTC`
//           );
//         }
//       });
//       tx.inputs.forEach((input) => {
//         if (input.prev_out.addr === btcAddress) {
//           console.log(
//             `sent transaction for ${input.prev_out.value / 100000000} BTC`
//           );
//         }
//       });
//     }
//   });

//   ws.on("error", (error) => {
//     console.error("WebSocket error:", error);
//   });

//   ws.on("close", () => {
//     console.log("WebSocket connection closed");
//     setTimeout(connectWebSocket, 3000);
//   });
// };
