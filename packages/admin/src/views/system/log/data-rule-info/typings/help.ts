/*
禁止修改!此文件是产品代码的一部分，后续可能变更或者不再开放。
若有问题，请参考前端相关二开文档。
*/
const getLatelyWeeK = () => {
  const day = new Date();
  day.setTime(day.getTime() - 7 * 24 * 60 * 60 * 1000);
  return day.getFullYear() + '-' + (day.getMonth() + 1) + '-' + day.getDate();
};

const getToday = () => {
  const day = new Date();
  day.setTime(day.getTime());
  return day.getFullYear() + '-' + (day.getMonth() + 1) + '-' + day.getDate();
};

const getNearWork = () => {
  return [getLatelyWeeK(), getToday()];
};

export { getNearWork };
