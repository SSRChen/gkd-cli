const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);

async function generate(type, name, option) {
    try {
        const template = await getTemplateData(type, option.template);
        option = margeOption(type, name, template.option, option);
        const data = replacer(template.data, option);
        await write(type, option, data);
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

function margeOption(type, name, option1, option2) {
    name = getName(name);
    const lowercaseName = getLowercaseName(name);
    const nOption = {
        name: name,
        lowercaseName: lowercaseName,
        service: lowercaseName,
        path: lowercaseName,
        fileName: getFileName(name, type),
        ...option1,
        ...option2
    };
    const keys = Object.keys(nOption);
    keys.forEach(key => {
        keys.forEach(key2 => {
            if (typeof nOption[key] === 'string') {
                nOption[key] = nOption[key].replace('${' + key2 + '}', nOption[key2]);
            }
        });
    });
    return nOption;
}

async function write(type, option, data) {
    const path = getWritePath(type, option);
    if (await exists(path)) {
        throw new Error('文件已存在');
    }
    await writeFile(path, data);
}

function getName(name) {
    return name.slice(0, 1).toUpperCase() + name.slice(1);
}

function getLowercaseName(name) {
    return name.slice(0, 1).toLowerCase() + name.slice(1);
}

async function getTemplateData(type, template = 'default') {
    try {
        const collectionPath = path.join('template', 'config.json');
        const collection = JSON.parse(await readFile(collectionPath, 'utf-8'));
        const option = collection[type][template] || {};
        const templatePath = path.join('template', type, `${template}.template`);
        const data = await readFile(templatePath, 'utf-8');
        return {
            option,
            data
        };
    } catch (error) {
        throw new Error('模板文件不存在');
    }
}

function getWritePath(type, option) {
    const basePath = {
        page: 'views',
        service: 'services',
        component: 'components'
    };
    return path.join('src', basePath[type], option.fileName);
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
            meta += `,`;
        }
        meta += ` ${key}: ${value}`
    }
    meta += ` }`;
    let config = `\n{
        path: '${option.root ? '' : '/'}${option.path}',
        name: '${name}',
        component: () => import(/* webpackChunkName: "${lowercaseName}" */ '../views/${option.fileName}')`;
    if (meta !== '{ }') {
        config += ',\n';
        config += `meta: ${meta}`;
    }
    config += '\n}';
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