const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.gkdTemplate`;

module.exports = {
    downloadDirectory
};