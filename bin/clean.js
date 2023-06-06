const path = require('path');
const rimraf = require('rimraf');
const modulesPath = path.resolve('../', '**/node_modules');
const modulesCachePath = path.resolve('../', '**/node_modules/.cache');
const lockYarn = path.resolve('../', '**/yarn.lock');
const lockNpm = path.resolve('../', '**/package-lock.json');
// console.log(modulesPath, 'modulesPath');
// console.log(lockYarn, 'lockYarn');
// console.log(lockNpm, 'lockNpm');
// rimraf('node_modules/.cache');
rimraf(modulesCachePath, function (err) {
    if (err) {
        console.log(err, '删除失败');
    } else {
        console.log('删除.cache完成');
    }
});
rimraf(lockYarn, function (err) {
    if (err) {
        console.log(err, '删除失败');
    } else {
        console.log('删除yarn.lock完成');
    }
});
rimraf(lockNpm, function (err) {
    if (err) {
        console.log(err, '删除失败');
    } else {
        console.log('删除package-lock.json完成');
    }
});
rimraf(modulesPath, function (err) {
    if (err) {
        console.log(err, '删除失败');
    } else {
        console.log('删除node_modules完成');
    }
});
