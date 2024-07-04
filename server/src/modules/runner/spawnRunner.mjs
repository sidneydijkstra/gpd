import { spawn } from 'child_process';

export function spawnRunner(transactionGuid, repoGuid, pipelineGuid){
    console.log(`Running pipeline: `, transactionGuid)

    var command = `node ./src/modules/runner/soloJobRunner.mjs ${transactionGuid} ${repoGuid} "${pipelineGuid}"`
    console.log(command)

    const child = spawn(command, [], { shell: true, cwd: process.cwd()})

    child.stdout.on('data', (data) => {
        console.log(`child stdout: ${data}`);
    });
    
    child.stderr.on('data', (data) => {
        console.error(`child stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    }); 
}