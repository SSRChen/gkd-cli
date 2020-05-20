#!/usr/bin/env node
const program = require('commander')

program
    .version(`gkd-cli ${require('../package').version}`)
    .usage('<command> [options]')

program
    .command('create <app-name>')
    .option('-u, --update', '是否下载最新模板，否则将优先使用本地缓存')
    .option('-p, --project <projectName>', 'git项目名')
    .description('通过模板项目创建新项目')
    .action((name, cmd) => {
        const option = cleanArgs(cmd)
        require('../lib/create')(name, option);
    })

program
    .command('generate <type> <name>')
    .description('通过模板创建组件 type: page | service | component')
    .option('-temp, --template <templateName>', '使用模板，默认使用default.template')
    .option('-t, --title <title>', '仅type为page有效，页面名称')
    .option('-a, --auth', '仅type为page有效，路由是否校验登录权限')
    .option('-r, --root', '仅type为page有效，是否为根页面')
    .option('-k, --keepAlive', '仅type为page有效，路由是否缓存')
    .option('-p, --path <routePath>', '仅type为page有效，路由的path(开头不加“/”)，默认由name生成')
    .option('-s, --service <serviceName>', '仅type为page有效，页面使用的service(无需加Service后缀)，默认由name生成')
    .option('-f, --fileName <fileName>', '生成的文件名，不带文件类型，默认由name生成')
    .action((type, name, cmd) => {
        const option = cleanArgs(cmd);
        require('../lib/generate')(type, name, option);
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