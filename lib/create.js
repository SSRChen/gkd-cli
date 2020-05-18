const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const path = require('path');
const ncp = promisify(require('ncp'));
const ora = require('ora');
const downloadGit = promisify(require('download-git-repo'));
const { downloadDirectory } = require('./util/constants');

async function create(name, options) {
    const dest = `${downloadDirectory}/my-vue-template`;
    const project = 'SSRChen/my-vue-template';
    const spinner = ora().start();
    try {
        spinner.text = '正在下载模板项目';
        await downloadGit(project, dest);
        const resolvePath = path.join(path.resolve(), name);
        await ncp(dest, resolvePath);
        spinner.text = '执行 npm install';
        await exec('npm install', { cwd: resolvePath });
        await exec('git init', { cwd: resolvePath });
        spinner.succeed('创建成功');
    } catch (error) {     
        console.log('\n');
        console.log(error);
        spinner.fail('创建失败');
    }
}

module.exports = (...arg) => {
    return create(...arg);
};