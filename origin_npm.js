'use strict';

const match = require('auto-correct');
const spawn = require('cross-spawn');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const parseArgv = require('./parse_argv');

//获取整理后的参数
const program = parseArgv();
//只需要参数数组的第三位开始的数据
const rawArgs = program.rawArgs.slice(2);
//最终需要的参数
const args = [];

let isInstall = false;
let installer = 'npminstall';

//判断是否install
for (let i = 0; i < rawArgs.length; i++) {
  let arg = rawArgs[i];

  //判断是否指定的命令
  if (arg[0] !== '-') {
    arg = correct(arg);
  }

  //第一位为install,则改变isInstall == true
  if (i === 0 && (arg === 'i' || arg === 'install')) {
    isInstall = true;
    continue;
  }

  // support `$ cnpm i --by=npm`
  if (arg.indexOf('--by=') === 0) {
    installer = arg.split('=', 2)[1];
    continue;
  }

  args.push(arg);
}

//npm命令所需要的系统参数
const env = Object.assign({}, process.env);
const CWD = process.cwd();

//插入源
args.unshift('--registry=' + program.registry);

//暂无需要
// if (program.disturl) {
//   args.unshift('--disturl=' + program.disturl);
// }

//插入配置
if (program.userconfig) {
  args.unshift('--userconfig=' + program.userconfig);
}

//插入代理
if (program.proxy) {
  args.unshift('--proxy=' + program.proxy);
}

//开始进行命令
let npmBin;
let execMethod = spawn;
const stdio = [
  process.stdin,
  process.stdout,
  process.stderr,
];

//暂时不使用cnpm的面板
// if (isInstall) {
//   npmBin = path.join(__dirname, 'node_modules', '.bin', installer);
//   if (installer === 'npminstall') {
//     // use fork to spawn can fix install cnpm itself fail on Windows
//     execMethod = cp.fork;
//     stdio.push('ipc');
//     npmBin = require.resolve('npminstall/bin/install.js');
//     args.unshift('--china');
//   } else {
//     // other installer, like npm
//     args.unshift('install');
//   }
//   // maybe outside installer, just use installer as binary name
//   if (!fs.existsSync(npmBin)) {
//     npmBin = installer;
//   }
// } else {
//   npmBin = path.join(__dirname, 'node_modules', '.bin', 'npm');
// }

//传入命令式是install,在最前面加上install命令
if(isInstall){
  args.unshift('install');
}
//运行命令位置
npmBin = path.join(__dirname, 'node_modules', '.bin', 'npm');
//运行命令
const child = execMethod(npmBin, args, {
  env: env,
  cwd: CWD,
  stdio: stdio,
});

child.on('exit', (code, signal) => {
  process.exit(code);
});

function correct(command) {
  const cmds = [
    'install',
    'publish',
    'adduser',
    'author',
    'config',
    'unpublish',
  ];
  for (const cmd of cmds) {
    if (match(command, cmd)) {
      return cmd;
    }
  }
  return command;
}
