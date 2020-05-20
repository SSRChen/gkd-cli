# gkd-cli
自己开发用的脚手架，名字随便取，就叫搞快点好了

### create
.command('create &lt;app-name&gt;')  
.description('通过模板项目创建新项目')  
.option('-u, --update', '是否下载最新模板，否则将优先使用本地缓存')  
.option('-p, --project &lt;projectName&gt;', 'git项目名')  
   
 ### generate    
.command('generate &lt;type&gt; &lt;name&gt;')  
.description('通过模板创建组件 type: page | service | component')  
.option('-temp, --template &lt;templateName&gt;', '使用模板，默认使用default.template')  
.option('-t, --title &lt;title&gt;', '仅type为page有效，页面名称')  
.option('-a, --auth', '仅type为page有效，路由是否校验登录权限')  
.option('-r, --root', '仅type为page有效，是否为根页面')  
.option('-k, --keepAlive', '仅type为page有效，路由是否缓存')  
.option('-p, --path &lt;routePath&gt;', '仅type为page有效，路由的path(开头不加“/”)，默认由name生成')  
.option('-s, --service &lt;serviceName&gt;', '仅type为page有效，页面使用的service(无需加Service后缀)，默认由name生成')  
.option('-f, --fileName &lt;fileName&gt;', '生成的文件名，不带文件类型，默认由name生成')  
