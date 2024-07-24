import process from "process";

const callbacks = []

export function onExit(callback){
    callbacks.push(callback)
}
  
// just in case some user like using "kill"
process.on("SIGTERM", (signal) => {
    console.log(`Process ${process.pid} received a SIGTERM signal`);
    callbacks.forEach(callback => callback())
    process.exit(0);
});

// catch ctrl-c, so that event 'exit' always works
process.on("SIGINT", (signal) => {
    console.log(`Process ${process.pid} has been interrupted`);
    callbacks.forEach(callback => callback())
    process.exit(0);
});

// what about errors
// try remove/comment this handler, 'exit' event still works
process.on("uncaughtException", (err) => {
    console.log(`Uncaught Exception: ${err.message}`);
    callbacks.forEach(callback => callback())
    process.exit(1);
});