const { promisify } = require('util');
const downloadGit = promisify(require('download-git-repo'));
const { downloadDirectory } = require('./util/constants');

async function create(name, options) {
    const dest = `${downloadDirectory}/my-vue-template`;
    const project = 'SSRChen/my-vue-template';
    try {
        await downloadGit(project, dest);
    } catch (error) {
        console.log('---下载模板失败---');
        console.log(error);
    }
}

module.exports = (...arg) => {
    return create(...arg);
};