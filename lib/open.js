var exec = require('child_process').exec,
    path = require('path');


/**
 * open a file or uri using the default application for the file type.
 *
 * @return {ChildProcess} - the child process object.
 * @param {string} target - 需要打开的url.
 * @param {string} appName - 选中要使用的浏览器 (for example, "chrome", "firefox")
 * @param {function(Error)} callback - 回调.
 */

module.exports = open;

function open(target, appName, callback) {
  var opener;

  //不穿appName重新定义callback
  if (typeof(appName) === 'function') {
    callback = appName;
    appName = null;
  }

  //判断使用平台
  switch (process.platform) {
  case 'darwin':
    if (appName) {
      opener = 'open -a "' + escape(appName) + '"';
    } else {
      opener = 'open';
    }
    break;
  case 'win32':
    // if the first parameter to start is quoted, it uses that as the title
    // so we pass a blank title so we can quote the file we are opening
    if (appName) {
      opener = 'start "" "' + escape(appName) + '"';
    } else {
      opener = 'start ""';
    }
    break;
  default:
    if (appName) {
      opener = escape(appName);
    } else {
      // use Portlands xdg-open everywhere else
      opener = path.join(__dirname, '../vendor/xdg-open');
    }
    break;
  }

  if (process.env.SUDO_USER) {
    opener = 'sudo -u ' + process.env.SUDO_USER + ' ' + opener;
  }
  return exec(opener + ' "' + escape(target) + '"', callback);
}

//转义" ~ \"
function escape(s) {
  return s.replace(/"/g, '\\\"');
}
