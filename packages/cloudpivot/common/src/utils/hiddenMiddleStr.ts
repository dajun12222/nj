/**
 * 计算字符串长度，中文长度2其余1
 * @param str
 * @returns
 */
const calcStrLength = (str) => {
  let realLength = 0;
  const len = str.length;
  let charCode = -1;
  for (let i = 0; i < len; i++) {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      realLength += 1;
    } else {
      realLength += 2;
    }
  }
  return realLength;
};

/**
 * 不使用css文本过长隐藏尾部多余字符串，
 * 使用js在字符串中间隐藏多出的字符，
 * 主要策略是将中间某一部分字符替换为...
 * @param str 带隐藏字符串
 * @param startLength 从中间何处开始隐藏(计算后的长度)
 * @param maxLength 可显示最大长度（中文2，其余1）
 * @returns 已经替换后的字符串
 */
const hiddenStrMiddle = (str, startLength, maxLength) => {
  const realLength = calcStrLength(str);
  const strArr = [...str];
  if (realLength < maxLength) {
    return str;
  } else {
    const startIndex = calcDeleteStartIndex(strArr, startLength);
    const endIndex = calcDeleteEndIndex(
      strArr,
      startIndex,
      realLength - maxLength + 3,
    );
    strArr.splice(startIndex, endIndex - startIndex, '...');
    return strArr.join('');
  }
};

/**
 * 计算隐藏部分字符串的起始索引
 * @param strArr 转换后的字符数组
 * @param startLength 从中间何处开始隐藏(计算后的长度)
 * @returns 隐藏部分起始索引
 */
const calcDeleteStartIndex = (strArr, startLength) => {
  let count = 0;
  let curLength = 0;
  let charCode = -1;
  while (curLength < startLength) {
    charCode = strArr[count++].charCodeAt(0);
    if (charCode >= 0 && charCode <= 128) {
      curLength += 1;
    } else {
      curLength += 2;
    }
  }
  return count;
};

/**
 * 计算隐藏部分字符串的终止索引
 * @param strArr 转换后的字符数组
 * @param startIndex 从中间何处开始隐藏(计算后的长度)
 * @param hideLength 需要隐藏的字符串长度
 * @returns 隐藏部分终止索引
 */
const calcDeleteEndIndex = (strArr, startIndex, hideLength) => {
  let count = startIndex;
  let realLength = 0;
  let charCode = -1;
  while (realLength < hideLength) {
    charCode = strArr[count++].charCodeAt(0);
    if (charCode >= 0 && charCode <= 128) {
      realLength += 1;
    } else {
      realLength += 2;
    }
  }
  return count + 1;
};

export default hiddenStrMiddle;
