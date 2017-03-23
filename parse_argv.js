'use strict';

const os = require('os');
const fs = require('fs');
const program = require('commander');
const config = require('./config');
const pkg = require('./package.json');
const help = require('./help');

let argv = null;

module.exports = cmd => {
    //设置提示
    if (!argv) {
        argv = program
            .option('-v, --version', '显示当前版本')
            .option('-r, --registry [registry]', '源路径, 默认是: ' + config.cnpmRegistry)
            .option('-w, --registryweb [registryweb]', 'web url, default is ' + config.cnpmHost)
            .option('--disturl [disturl]', 'dist url for node-gyp, default is ' + config.disturl)
            .option('-c, --cache [cache]', 'cache folder, default is ' + config.cache)
            .option('-u, --userconfig [userconfig]', '个人配置, 默认是: ' + config.userconfig)
            .option('-y, --yes', 'yes all confirm')
            .option('--proxy [proxy]', '设置代理, 默认空');
    }

    //设置cache信息
    var cacheInfo;
    argv.on('cache', function (cache) {
        if (typeof cache === 'string') {
            cacheInfo = cache;
            return;
        }
        argv.args = ['cache'].concat(cache || []);
    });

    //版本
    argv.on('version', function () {
        console.log('znpm@%s (%s)%snpm@%s (%s)%snode@%s (%s)%sprefix=%s %s%s %s %s %sregistry=%s',
            pkg.version,
            __filename,
            os.EOL,
            require('npm/package.json').version,
            require.resolve('npm'),
            os.EOL,
            process.version.substring(1),
            process.execPath,
            os.EOL,
            config.prefix,
            os.EOL,
            os.platform(),
            os.arch(),
            os.release(),
            os.EOL,
            config.znpmRegistry
        );
        process.exit(0);
    });

    //帮助
    argv.on('--help', function () {
        if (!argv.registry) {
            argv.userconfig = argv.userconfig || config.userconfig;
            argv.registry = getDefaultRegistry(argv.userconfig);
        }
        help(argv);
    });

    //解析参数
    argv.parse(process.argv.slice());

    //如果有自己传进来,就用自己传的,否则使用config里面默认的
    //自定义配置路径
    argv.userconfig = argv.userconfig || config.userconfig;

    //源
    if (!argv.registry) {
        // try to use registry in uerconfig
        argv.registry = getDefaultRegistry(argv.userconfig);
    }

    //disturl
    if (!argv.disturl) {
        var isIOJS = process.execPath.indexOf('iojs') >= 0;
        argv.disturl = isIOJS ? config.iojsDisturl : config.disturl;
    }

    //代理
    if (!argv.proxy) {
        argv.proxy = config.proxy;
    }

    //删除没有信息的键值
    if (argv.disturl === 'none') {
        delete argv.disturl;
    }
    if (argv.userconfig === 'none') {
        delete argv.userconfig;
    }
    argv.registryweb = argv.registryweb || config.znpmHost;
    argv.cache = cacheInfo || config.cache;

    //参数为空去help
    if (!argv.args.length) {
        help(argv);
    }

    //设置参数数组
    //去除所有传入的userconfig、disturl、registryweb、registry
    //返回其他需要的参数
    var rawArgs = argv.rawArgs;
    var needs = [];
    for (var i = 0; i < rawArgs.length; i++) {
        var arg = rawArgs[i];
        if (arg.indexOf('--userconfig=') === 0 || arg.indexOf('-u=') === 0) {
            continue;
        }
        if (arg.indexOf('--disturl=') === 0) {
            continue;
        }
        if (arg.indexOf('--registryweb=') === 0 || arg.indexOf('-w=') === 0) {
            continue;
        }
        if (arg.indexOf('--registry=') === 0 || arg.indexOf('-r=') === 0) {
            continue;
        }
        needs.push(arg);
    }
    argv.rawArgs = needs;

    return argv;
};

//获取源路径
function getDefaultRegistry(userconfig) {
    if (argv.userconfig !== 'none' && fs.existsSync(argv.userconfig)) {
        var content = fs.readFileSync(argv.userconfig, 'utf8');
        // registry = {registry-url}
        var m = /^registry\s*=\s*(.+)$/m.exec(content);
        if (m) {
            return m[1];
        }
    }
    return config.znpmRegistry;
}
