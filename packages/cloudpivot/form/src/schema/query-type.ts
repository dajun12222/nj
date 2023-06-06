export const QueryDateTypeList = [
  {
    text: 'FixedValue',
    type: 0,
  },
  {
    text: 'LastWeek',
    type: 1,
  },
  {
    text: 'LastMonth',
    type: 2,
  },
  {
    text: 'LastQuarter',
    type: 3,
  },
  {
    text: 'LastYear',
    type: 4,
  },
  {
    text: 'ThisMoment',
    type: 9,
  },
  {
    text: 'ThisWeek',
    type: 5,
  },
  {
    text: 'ThisMonth',
    type: 6,
  },
  {
    text: 'ThisQuarter',
    type: 7,
  },
  {
    text: 'ThisYear',
    type: 8,
  },
];

export enum QueryOptionType {
  eq = 'eq',
  NotEq = 'NotEq',
  IS_NULL = 'IS_NULL',
  IS_NOT_NULL = 'IS_NOT_NULL',
  IS_Contains = 'IS_Contains',
  IS_NOT_Contains = 'IS_NOT_Contains',
  Greater_Than = 'Greater_Than',
  Less_Than = 'Less_Than',
  Greater_Than_Or_Equal_To = 'Greater_Than_Or_Equal_To',
  Less_Than_Or_Equal_To = 'Less_Than_Or_Equal_To',
  Between = 'Between',
  Not_Between = 'Not_Between',
}

// Eq          (1,"等于", "="),
// NotEq       (2,"不等于", "!="),
// Gt          (3,"大于", ">"),
// Lt          (4,"小于", "<"),
// Gte         (5,"大于等于", ">="),
// Lte         (6,"小于等于", "<="),
// Like        (7,"包含", "contains"),
// NotLike     (8,"不包含", "not contains"),
// IsNull      (9,"为空","null"),
// IsNotNull   (10,"不为空","not null"),
// In          (15,"位于","in"),
// NotIn       (16,"不位于","not in"),
// Between     (17,"介于","not in"),
// NotBetween  (18,"不介于","not in");

export const QueryOptionTypeList = [
  {
    text: '等于',
    op: 'eq',
    type: 1,
    queryType: 'Eq',
  },
  {
    text: '不等于',
    op: 'NotEq',
    type: 2,
    queryType: 'NotEq',
  },
  {
    text: '为空',
    op: 'IS_NULL',
    type: 9,
    queryType: 'IsNull',
  },
  {
    text: '不为空',
    op: 'IS_NOT_NULL',
    type: 10,
    queryType: 'IsNotNull',
  },
  {
    text: '包含',
    op: 'IS_Contains',
    type: 7,
    queryType: 'Like',
  },
  {
    text: '不包含',
    op: 'IS_NOT_Contains',
    type: 8,
    queryType: 'NotLike',
  },
  {
    text: '大于',
    op: 'Greater_Than',
    type: 3,
    queryType: 'Gt',
  },
  {
    text: '小于',
    op: 'Less_Than',
    type: 4,
    queryType: 'Lt',
  },
  {
    text: '大于等于',
    op: 'Greater_Than_Or_Equal_To',
    type: 5,
    queryType: 'Gte',
  },
  {
    text: '小于等于',
    op: 'Less_Than_Or_Equal_To',
    type: 6,
    queryType: 'Lte',
  },
  {
    text: '介于',
    op: 'Between',
    type: 17,
    queryType: 'Between',
  },
  {
    text: '不介于',
    op: 'Not_Between',
    type: 18,
    queryType: 'NotBetween',
  },
];
