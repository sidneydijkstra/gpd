import { spawn } from 'child_process';

export function isDockerInstalled() {
    return execute('docker ps')
}

export function pullImage(image) {
    return execute(`docker pull ${image}`)
}

export function runContainer(image, name, port) {
    return execute(`docker run -d --name ${name} -p ${port} ${image}`)
}

function execute(command) {
    return new Promise((resolve, reject) => {

        const child = spawn(command, [], { shell: true });

        child.stdout.on('data', (data) => {
            console.log(`[Docker] stdout: ${data.toString()}`);
        });

        child.stderr.on('data', (data) => {
            console.log(`[Docker] stderr: ${data.toString()}`);
        });

        child.on('close', (code) => {
            console.log(`[Docker] completed with code: ${code}`);
            code == 0 ? resolve(true) : reject(false)
        });
    })
}