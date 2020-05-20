const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const path = require('path');
const ncp = promisify(require('ncp'));
const ora = require('ora');
const downloadGit = promisify(require('download-git-repo'));
const { downloadDirectory } = require('./util/constants');
const fs = require('fs');
const exists = promisify(fs.exists);
const delDir = require('./util/delDir');

async function create(name, option) {
    const project = option.project || 'SSRChen/my-vue-template';
    const projectName = project.split('/')[1];
    const dest = `${downloadDirectory}/${projectName}`;
    const spinner = ora().start();
    try {
        const resolvePath = path.join(path.resolve(), name);
        if(await exists(resolvePath)){
            throw new Error('项目已存在');
        }
        if (!await exists(dest) || option.update) {
            await delDir(dest);
            spinner.text = '正在下载模板项目';
            await downloadGit(project, dest);
        }
        await ncp(dest, resolvePath);
        spinner.text = '执行 npm install';
        await exec('npm install', { cwd: resolvePath });
        await exec('git init', { cwd: resolvePath });
        await exec('git add .', { cwd: resolvePath });
        await exec('git commit -m init', { cwd: resolvePath });
        spinner.succeed(`创建成功!cd ${name} && npm run serve`);
    } catch (error) {
        console.log('\n');
        console.log(error);
        spinner.fail('创建失败');
    }
}

module.exports = (...arg) => {
    return create(...arg);
};