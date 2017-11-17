'use strict';

var path = require( 'path' );
var fs = require( 'fs' );
var cp = require( 'child_process' );

//判断根目录路径
var root;
if ( process.platform === 'win32' ) {
    root = process.env.USERPROFILE || process.env.APPDATA || process.env.TMP || process.env.TEMP;
} else {
    root = process.env.HOME || process.env.TMPDIR || '/tmp';
}

var prefix = null;
try {
    prefix = cp.execSync( 'npm config get prefix' ).toString().trim();
} catch ( err ) {
    // ignore it
    debug( 'npm config cli error: %s', err );
}

module.exports = {
    znpmHost: 'http://npm.zuzuche.net/',
    znpmRegistry: 'http://npm.zuzuche.net/',
    cnpmRegistry: 'https://registry.npm.taobao.org',//check命令调用cnpm的接口
    disturl: 'https://npm.taobao.org/mirrors/node', // download dist tarball for node-gyp
    iojsDisturl: 'https://npm.taobao.org/mirrors/iojs',
    npmRegistry: 'https://registry.npmjs.org',
    cache: path.join( root, '.znpm' ),  //cache folder name
    userconfig: path.join( root, '.znpmrc' ),
    proxy: '',
    prefix: prefix,
};
