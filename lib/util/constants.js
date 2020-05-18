const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.gkd-template`;

module.exports = {
    downloadDirectory
};