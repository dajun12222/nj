/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
/*
 * @Descripttion:
 * @version: v1.0
 * @Author: baidongsheng
 * @Date: 2021-12-01 10:41:25
 * @LastEditors: baidongsheng
 * @LastEditTime: 2021-12-08 11:27:59
 */
/**
 * post方式下载文件
 * @param fileStream 二进制文件流
 * @param fileType 需要下载什么格式的文件  excel: 'application/vnd.ms-excel'
 * @param fileName 下载的文件名称
 */
const downloadByPost = (
  fileStream: any,
  fileType: string,
  fileName: string,
) => {
  const blob = new Blob([fileStream], { type: fileType });
  console.log(blob);

  if ((window as any).navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, fileName);
  } else {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.download = fileName;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }
};

export default {
  downloadByPost,
};
