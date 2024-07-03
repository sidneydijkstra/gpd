import { spawnSync } from 'child_process';

export function useCmd(config, logger){
    logger.log(`Running job useCmd with config: `, config)

    var command = config.command

    const child = spawnSync(command, [], { shell: true });

    logger.log(`useCmd result: `, child.stdout.toString(), child.stderr.toString());
}