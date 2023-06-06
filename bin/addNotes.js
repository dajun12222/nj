var fs = require("fs");

const note = `禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。`

const notes = {
  ts: `/*
${note}
*/`,
  vue: `<!--
${note}
-->`,
  less: `/*
${note}
*/`,
  css: `/*
${note}
*/`
}

// 不需要添加注释的文件夹
const unwantedAddFolder = [
  'node_modules', 
  'extends',
  'builtin',
  'cloudpivot',
  'cloudpivot-designer',
  'cloudpivot-form-extend',
  'cloudpivot-forms',
  'plugin'
];

// 需要添加注释的文件类型
const wantedAddFile = ['.vue', '.css', '.less', '.ts'];

addNotes("./../packages");

function addNotes(filePath) {
  //遍历test文件夹
  fs.readdir(filePath + "", function (err, files) {
    if (err) {
      return err;
    }
    if (files.length !== 0) {
      files.forEach((item) => {
        const path = filePath + "/" + item;
        //判断文件的状态，用于区分文件名/文件夹
        fs.stat(path, function (err, status) {
          if (err) {
            return err;
          }
          const isFile = status.isFile(); //是文件
          const isDir = status.isDirectory(); //是文件夹
          
          // 文件类型 && 需要添加注释
          if (isFile && wantedAddFile.some(el => new RegExp(`\.${el}$`).test(item))) {
            replaceFile(path);
          }

          // 文件夹类型 && 需要递归
          if (isDir && !unwantedAddFolder.includes(item)) {
            addNotes(path)
          }
        });
      });
    }
  });
}

// 添加注释
function replaceFile(filePath) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      return err;
    }
    let str = data.toString();
    const type = filePath.match(/(?<=\.)(\w+)$/)[0];
    if(!~str.indexOf(note)){
      str = `${notes[type]}
${str}`

      fs.writeFileSync(filePath, str, function (err) {
        if (err) {
          return err;
        }
      });
      console.log("添加注释成功==>>:" + filePath);
    }
    
  });
};