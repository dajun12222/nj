// 一个英文字符占 1bit 内存控件。1024个英文字符占 1kb 大小。
// 默认最大缓存是5MB

function GoodStorage() {}

/**
 * expire 缓存时长，单位是天。
 */
GoodStorage.prototype.setItem = function (key, value) {
  // 浏览器缓存使用量已经超过95%
  if (this.getUsed() > 95) {
    window.localStorage.clear();
  }
  window.localStorage.setItem(key, value);
};

GoodStorage.prototype.getItem = function (key) {
  return window.localStorage.getItem(key);
};

GoodStorage.prototype.getUsed = function () {
  let usedSize = JSON.stringify(window.localStorage).length; // 已经存储的容量大小
  usedSize = usedSize / (1024 * 1024); // MB 为单位
  return (usedSize / 5) * 100;
};

if (!window.GoodStorage) {
  window.GoodStorage = new GoodStorage();
}
export default window.GoodStorage;
