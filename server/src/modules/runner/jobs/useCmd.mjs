import { spawnSync, spawn } from 'child_process';

export async function useCmd(config, logger){
    logger.log(`Running job useCmd with config: `, config)

    var result = await Promise.resolve(new Promise((resolve, reject) => {
        var command = config.command

        const child = spawn(command, [], { shell: true });

        child.stdout.on('data', (data) => {
            logger.log(data.toString());
        });

        child.stderr.on('data', (data) => {
            logger.log(data.toString());
        });

        child.on('close', (code) => {
            logger.log(`useCmd child process exited with code ${code}`);
            code == 0 ? resolve(true) : reject(false)
        });
    }))

    logger.log(result)
    return result
}