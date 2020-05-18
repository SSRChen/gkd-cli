const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function generate(type, name, option) {
    try {
        const data = await getTemplateData(type, option.template);
        const replaceOption = {
            name: getName(name),
            lowercaseName: getLowercaseName(name),
            title: option.title || ''
        };
        const nData = replacer(data, replaceOption);
        const writePath = getWritePath(type, name);
        await writeFile(writePath, nData);
        await writeConfig(type, name, option);
        console.log('生成成功');
    } catch (error) {
        console.error(error);
    }
}

function replacer(text, option) {
    for (const key in option) {
        const reg = new RegExp(`<%= ${key} %>`, 'g');
        text = text.replace(reg, option[key]);
    }
    return text;
}

function getName(name) {
    return name.slice(0, 1).toUpperCase() + name.slice(1);
}

function getLowercaseName(name) {
    return name.slice(0, 1).toLowerCase() + name.slice(1);
}

function getTemplateData(type, template = 'default') {
    const templatePath = path.join('template', type, `${template}.template`);
    return readFile(templatePath, 'utf-8').catch(() => {
        return new Error('模板文件不存在');
    });
}

function getWritePath(type, name) {
    const basePath = {
        page: 'views',
        service: 'services',
        component: 'components'
    };
    const fileName = getFileName(name, type);
    return path.join('src', basePath[type], fileName);
}

function getFileName(name, type) {
    switch (type) {
        case 'page':
        case 'component':
            return `${getName(name)}.vue`;
        case 'service':
            return `${getLowercaseName(name)}.service.ts`;
    }
}

function writeConfig(type, name, option) {
    if (type === 'page') {
        return writePageConfig(name, option);
    } else if (type === 'service') {
        return writeServiceConfig(name);
    }
}

function writePageConfig(name, option) {
    const indexPath = path.join('src', 'router', 'index.ts');
    const lowercaseName = getLowercaseName(name);
    name = getName(name);
    let meta = `{`;
    const keys = ['root', 'keepAlive', 'title', 'icon', 'auth'];
    for (const key of keys) {
        if (!option[key]) {
            continue;
        }
        let value = option[key];
        if (typeof value === 'string') {
            value = `'${value}'`;
        }
        if (meta !== '{') {
            meta += `, `;
        }
        meta += `${key}: ${value}`
    }
    meta += ` }`;
    let config = `\n{
        path: '${option.root ? lowercaseName : '/' + lowercaseName}',
        name: '${name}',
        component: () => import(/* webpackChunkName: "${lowercaseName}" */ '../views/${name}.vue')`;
    if (meta !== '{ }') {
        config += ',\n';
        config += `meta: ${meta}\n`;
    }
    config += '}';
    const at = option.root ? '/* placeholder:root */' : '/* placeholder:common */';
    return writeAt(indexPath, at, config, ',');
}

async function writeAt(path, at, snippet, start) {
    let data = await readFile(path, 'utf-8');
    let dataList = data.split(at);
    let data1 = dataList[0];
    let data2 = dataList[1] || '';
    while (data1.endsWith('\s') || data1.endsWith('\n') || data1.endsWith('\r') || data1.endsWith(' ')) {
        data1 = data1.replace(/(\s$)|(\n$)|(\r$)|(\t$)/g, '');
    }
    if (!data1.endsWith(start) && start) {
        data1 += start;
    }
    snippet += '\n';
    snippet += at;
    data = data1 + snippet + data2;
    await writeFile(path, data);
}

async function writeServiceConfig(name) {
    const indexPath = path.join('src', 'services', 'index.ts');
    const exportPath = `export * from './${getLowercaseName(name)}.service';`;
    let data = await readFile(indexPath, 'utf-8');
    data += '\n';
    data += exportPath;
    await writeFile(indexPath, data);
}

module.exports = (...args) => {
    return generate(...args);
}