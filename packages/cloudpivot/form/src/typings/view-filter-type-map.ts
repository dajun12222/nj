import { DataItemType } from './../schema';
const rules = [
  {
    name: '等于',
    value: 'Eq',
    acceptTypes: [
      DataItemType.ShortText,
      DataItemType.Radio,
      DataItemType.Checkbox,
      DataItemType.Dropdown,
      DataItemType.DropdownMulti,
      DataItemType.Number,
      DataItemType.Date,
      DataItemType.StaffSingle,
      DataItemType.StaffMulti,
      DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix,
      DataItemType.RelevanceForm,
      DataItemType.RelevanceFormEx,
      DataItemType.Logic,
      DataItemType.Address,
    ],
  },
  {
    name: '不等于',
    value: 'NotEq',
    acceptTypes: [
      DataItemType.ShortText,
      DataItemType.Radio,
      DataItemType.Checkbox,
      DataItemType.Dropdown,
      DataItemType.DropdownMulti,
      DataItemType.Number,
      DataItemType.Date,
      DataItemType.StaffSingle,
      DataItemType.StaffMulti,
      DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix,
      DataItemType.RelevanceForm,
      DataItemType.RelevanceFormEx,
      DataItemType.Address,
    ],
  },

  {
    name: '大于',
    value: 'Gt',
    acceptTypes: [DataItemType.Number, DataItemType.Date],
  },
  {
    name: '小于',
    value: 'Lt',
    acceptTypes: [DataItemType.Number, DataItemType.Date],
  },

  {
    name: '大于等于',
    value: 'Gte',
    acceptTypes: [DataItemType.Number, DataItemType.Date],
  },
  {
    name: '小于等于',
    value: 'Lte',
    acceptTypes: [DataItemType.Number, DataItemType.Date],
  },

  {
    name: '包含',
    value: 'Like',
    acceptTypes: [
      DataItemType.ShortText,
      DataItemType.Radio,
      DataItemType.Checkbox,
      DataItemType.Dropdown,
      DataItemType.DropdownMulti,
      // DataItemType.StaffSingle,
      DataItemType.StaffMulti,
      // DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix,
      DataItemType.RelevanceForm,
      DataItemType.RelevanceFormEx,
      DataItemType.Address,
    ],
  },
  {
    name: '不包含',
    value: 'NotLike',
    acceptTypes: [
      DataItemType.ShortText,
      DataItemType.Radio,
      DataItemType.Checkbox,
      DataItemType.Dropdown,
      DataItemType.DropdownMulti,
      // DataItemType.StaffSingle,
      DataItemType.StaffMulti,
      // DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix,
      DataItemType.RelevanceForm,
      DataItemType.RelevanceFormEx,
      DataItemType.Address,
    ],
  },

  {
    name: '为空',
    value: 'IsNull',
    acceptTypes: [
      DataItemType.ShortText,
      DataItemType.Radio,
      DataItemType.Checkbox,
      DataItemType.Dropdown,
      DataItemType.DropdownMulti,
      DataItemType.StaffSingle,
      DataItemType.StaffMulti,
      DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix,
      DataItemType.RelevanceForm,
      DataItemType.RelevanceFormEx,
      DataItemType.Address,
    ],
  },
  {
    name: '不为空',
    value: 'IsNotNull',
    acceptTypes: [
      DataItemType.ShortText,
      DataItemType.Radio,
      DataItemType.Checkbox,
      DataItemType.Dropdown,
      DataItemType.DropdownMulti,
      DataItemType.StaffSingle,
      DataItemType.StaffMulti,
      DataItemType.DeptSingle,
      DataItemType.DeptMulti,
      DataItemType.StaffDeptMix,
      DataItemType.RelevanceForm,
      DataItemType.RelevanceFormEx,
      DataItemType.Address,
    ],
  },

  {
    name: '介于',
    value: 'Between',
    acceptTypes: [DataItemType.Number, DataItemType.Date],
  },
  {
    name: '不介于',
    value: 'NotBetween',
    acceptTypes: [DataItemType.Number, DataItemType.Date],
  },
];

export default rules;

export function getRulesList(propertyType, code) {
  if (code === 'sequenceStatus') {
    // 单据状态
    return [{ name: '包含', value: 'Like', acceptTypes: [] }];
  }

  let res = rules.filter((el) => el.acceptTypes.includes(propertyType));

  if (['createdDeptId', 'ownerDeptId'].includes(code)) {
    const OF = [
      { name: '属于', value: 'Of', acceptTypes: [] },
      { name: '不属于', value: 'NotOf', acceptTypes: [] },
    ];
    res = [...res, ...OF];
  }

  return res;
}

export function getRulesLisForRelevance(propertyType, code) {
  let res = rules.filter((el) => el.acceptTypes.includes(propertyType));

  if (code === 'sequenceStatus') {
    // 单据状态
    res = res.filter((el) => !['IsNull', 'IsNotNull'].includes(el.value));
  }
  if (['createdDeptId', 'ownerDeptId'].includes(code)) {
    const OF = [
      { name: '属于', value: 'Of', acceptTypes: [] },
      { name: '不属于', value: 'NotOf', acceptTypes: [] },
    ];
    res = [...res, ...OF];
  }

  if ([DataItemType.Number, DataItemType.Date].includes(propertyType)) {
    res = [
      ...res,
      ...[
        { name: '为空', value: 'IsNull', acceptTypes: [] },
        { name: '不为空', value: 'IsNotNull', acceptTypes: [] },
      ],
    ];
  } else if ([DataItemType.Address].includes(propertyType)) {
    // res = res.filter((el) => !['Like', 'NotLike'].includes(el.value));
  } else {
    //Else Empty block statement
  }

  return res;
}
