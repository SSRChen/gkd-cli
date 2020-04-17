#!/usr/bin/env node
const program = require('commander')

program
    .version(`gkd-cli ${require('../package').version}`)
    .usage('<command> [options]')


program
    .command('create <app-name>')
    .description('通过模板创建新项目')
    .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
    .action((name, cmd) => {
        const option = cleanArgs(cmd)
        require('../lib/create')(name, option);
    })

program
    .command('generate <type> <name>')
    .action((type, name, cmd) => {
        console.log(type, name)
    })

program.parse(process.argv)


function camelize(str) {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
    const args = {}
    cmd.options.forEach(o => {
        const key = camelize(o.long.replace(/^--/, ''))
        // if an option is not present and Command has a method with the same name
        // it should not be copied
        if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
            args[key] = cmd[key]
        }
    })
    return args
}