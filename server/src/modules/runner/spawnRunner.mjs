import { spawn } from 'child_process';

export function spawnRunner(transactionGuid, repoGuid, pipelineGuid){
    console.log(`Running pipeline: `, transactionGuid)

    var command = `node ./src/modules/runner/soloJobRunner.mjs ${transactionGuid} ${repoGuid} "${pipelineGuid}"`
    console.log(command)

    const child = spawn(command, [], { shell: true, cwd: process.cwd()})

    child.stdout.on('data', (data) => {
        console.log(`[spawnRunner] stdout: ${data}`);
    });
    
    child.stderr.on('data', (data) => {
        console.error(`[spawnRunner] stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`[spawnRunner] Process exited with code ${code}`);
    }); 
}