import { recursionSearch } from 'cloudpivot/common/src/utils/utils';

import { UploadControl } from '../../../../../form/src/common/controls/upload-control';

import moment from 'moment';

import { schema } from '../../../../../form';

import { format } from '../../../../../form/utils/number-formatter';

export default {
  /**
   * 分析打印模板中需要的字段信息，方便后续取控件值
   */
  analizePrintTemplate(contentArr, formData, tempSheetInfo, logInfo) {
    contentArr.forEach((item: any) => {
      console.log(item.cells);
      if (!item.cells) {
        return;
      }
      Object.keys(item.cells).forEach((row: any) => {
        const rowContent = item.cells[row];
        Object.keys(rowContent).forEach((col: any) => {
          const colContent = rowContent[col];
          if (
            colContent &&
            colContent.content &&
            colContent.content.hasOwnProperty('fieldCode')
          ) {
            if (colContent.content.hasOwnProperty('parentFieldCode')) {
              const parentFieldCode = colContent.content['parentFieldCode'];
              if (!formData.hasOwnProperty(parentFieldCode)) {
                formData[parentFieldCode] = [];
                tempSheetInfo[parentFieldCode] = {};
              }
              tempSheetInfo[colContent.content['parentFieldCode']][
                colContent.content['fieldCode']
              ] = '';
            } else if (colContent.content['fieldCode'] === 'QRCode') {
              let qrCodeArr: any = formData[colContent.content['fieldCode']];
              const qrContent: any = colContent.content;
              // 二维码
              if (!Array.isArray(qrCodeArr)) {
                qrCodeArr = [];
              }
              qrCodeArr.push(JSON.stringify(qrContent));
              formData['QRCode'] = qrCodeArr;
            } else if (colContent.content['fieldCode'] === 'BarCode') {
              // 条形码
            } else if (colContent.content['fieldCode'] === 'RichText') {
              const fieldArr = this.getFieldcodeInRichText(
                colContent.content.text,
              );
              fieldArr.forEach((code) => {
                if (!formData.hasOwnProperty(code)) {
                  formData[code] = '';
                }
              });
            } else {
              formData[colContent.content['fieldCode']] = '';
            }
          }
        });
      });
      const workflowLogArray = recursionSearch(
        item.workflowLogRanges,
        'workflowLogArray',
      );
      if (Array.isArray(workflowLogArray)) {
        workflowLogArray.forEach((item: any) => {
          if (item.checked) {
            logInfo[item.fieldCode] = '';
          }
        });
      }
    });
  },

  /**
   * 富文本的字段编码放在html元素上
   * 提取比较复杂
   * 本函数专门提取富文本上的fieldcode属性
   */
  getFieldcodeInRichText(html) {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    const temp = [...template?.content?.children];
    return temp.map((ele) => {
      return ele.getAttribute('fieldcode');
    });
  },

  formatChuanyunData(value: any, type: number, extra: any, control: any) {
    switch (type) {
      case schema.FormControlType.Text:
      case schema.FormControlType.Textarea:
      case schema.FormControlType.Radio:
        return value;

      case schema.FormControlType.CreatedTime:
      case schema.FormControlType.ModifiedTime:
      case schema.FormControlType.Date:
        let _value = value;
        if(value){
          try {
            _value = new Date(value);
          } catch (error) {
            
          }
        }
        if (_value instanceof Date) {
          const dateFormat: any = control.options.format1
            ? control.options.format1
            : control.options.format;
          return moment(value).utcOffset(480).format(dateFormat);
        } else if (typeof value === 'string') {
          return value;
        } else {
          //Else Empty block statement
        }
        break;
      case schema.FormControlType.Number:
        const numFormat: any = control.options.format1
          ? control.options.format1
          : control.options.format;
        if (typeof value === 'number' && !Number.isNaN(value)) {
          if(numFormat.includes("ratio")) {
            return format(numFormat, (value * 100));
          } else {
            return format(numFormat, value);
          }
        } else {
          return '';
        }
      case schema.FormControlType.Checkbox:
      case schema.FormControlType.Dropdown:
      case schema.FormControlType.DropdownMulti:
        if (Array.isArray(value)) {
          return value.join(';');
        } else if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'object') {
          if (value) {
            return JSON.stringify(value);
          } else {
            return '';
          }
        } else {
          //Else Empty block statement
        }
        break;
      case schema.FormControlType.Logic:
        return String(value);
      case schema.FormControlType.Attachment:
        if (Array.isArray(value) && value.length > 0) {
          return value.map((item) => {
            if (
              item &&
              item.response &&
              item.response.data &&
              item.response.data.mimeType &&
              !item.response.data.mimeType.includes('image')
            ) {
              return '';
            } else if (item && item.url) {
              return item.url;
            } else if (item && item.refId) {
              return this.getDownloadUrlByRefId(item.refId);
            } else if (item && item.uid) {
              return this.getDownloadUrlByRefId(item.uid);
            } else if (item) {
              return item;
            } else {
              return '';
            }
          });
        }
        break;
      case schema.FormControlType.Image:
      case schema.FormControlType.Signature:
        if (Array.isArray(value) && value.length > 0) {
          return value.map((item) => {
            if (item && item.url) {
              return item.url;
            } else if (item && item.refId) {
              return this.getDownloadUrlByRefId(item.refId);
            } else if (item && item.uid) {
              return this.getDownloadUrlByRefId(item.uid);
            } else if (item) {
              return item;
            } else {
              return '';
            }
          });
        }
        break;
      case schema.FormControlType.Location:
      case schema.FormControlType.Address:
        if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'object' && value !== null) {
          return type === schema.FormControlType.Address
            ? this.generateAddressStr(value)
            : this.generatePositionStr(value);
        } else {
          //Else Empty block statement
        }
        break;
      case schema.FormControlType.DateRange:
      case schema.FormControlType.NumberRange:
      case schema.FormControlType.TimeRange:
        break;
      case schema.FormControlType.Tips:
        break;
      case schema.FormControlType.Time:
        if (typeof value === 'string') {
          return value;
        } else if (moment.isMoment(value)) {
          console.log('value', value);
          return moment(value).format('HH:mm:ss');
        } else {
          //Else Empty block statement
        }
        break;
      case schema.FormControlType.StaffSelector:
      case schema.FormControlType.StaffMultiSelector:
      case schema.FormControlType.DepartmentSelector:
      case schema.FormControlType.DepartmentMultiSelector:
      case schema.FormControlType.StaffDeptMixed:
        if (Array.isArray(value)) {
          return value.map((item) => item.name).join(';');
        } else if (typeof value === 'string') {
          return value;
        } else {
          //Else Empty block statement
        }
        break;
      case schema.FormControlType.ApprovalOpinion:
        break;
      case schema.FormControlType.RelevanceForm:
      case schema.FormControlType.RelevanceFormEx:
        if (typeof value === 'object') {
          if (value && value.hasOwnProperty('displayCode')) {
            if (!Array.isArray(value[value['displayCode']])) {
              return '' + value[value['displayCode']];
            } else {
              //选人控件
              return value[value['displayCode']]
                .map((item) => item.name)
                .join(';');
            }
          }
        }
        break;
      case schema.FormControlType.Sheet:
        const sheetVal: any[] = [];
        Object.keys(extra).forEach((key: string) => {
          const sheetColCtrl: any = control.columns.find((item: any) => {
            return item.key === key;
          });

          if (sheetColCtrl) {
            if (Array.isArray(value)) {
              value.forEach((row: any) => {
                row[key] = this.formatChuanyunData(
                  row[key],
                  sheetColCtrl.type,
                  null,
                  sheetColCtrl,
                );
              });
            }
          }
        });
        return value;
      case schema.FormControlType.ReverseRelevance:
        break;
      case schema.FormControlType.SequenceNo:
        return value ? value : '';
      case schema.FormControlType.CreateBy:
      case schema.FormControlType.ModifyBy:
      case schema.FormControlType.OwnerId:
      case schema.FormControlType.OwnerParentId:
      case schema.FormControlType.CreateByParentId:
        if (Array.isArray(value) && value.length === 1) {
          return value[0]['name'];
        } else {
          return '';
        }
      case schema.FormControlType.SystemOther:
      case schema.FormControlType.SequenceStatus:
      case schema.FormControlType.Group:
      case schema.FormControlType.Description:
      case schema.FormControlType.Title:
      case schema.FormControlType.Html:
        return '';
      default:
        break;
    }
  },

  formatSystemData(value: any, key: string) {
    switch (key) {
      case 'createdDeptId':
      case 'creater':
      case 'modifier':
      case 'owner':
      case 'ownerDeptId':
        if (Array.isArray(value) && value.length > 0) {
          return value.map((item) => item.name).join(',');
        } else {
          return '';
        }
      case 'createdTime':
      case 'modifiedTime':
      case 'sequenceNo':
      case 'sequenceStatus':
      case 'name':
        return value ? value : '';
      default:
        break;
    }
  },

  getDownloadUrlByRefId(refId: string) {
    return UploadControl.service.getDownloadUrlByRefId(refId);
  },

  /**
   * 拼接地址中的省市县和详细信息
   * @param location
   * @returns
   */
  generateAddressStr(location) {
    const city = location.valString
      ? location.valString.replaceAll('/', ' ')
      : '';
    const detail = location.address ? location.address : '';
    if (city && detail) {
      return city + ' ' + detail;
    } else {
      return city || detail || '';
    }
  },

  /**
   * 拼接地址定位中的省市县和详细信息
   * @param position
   */
  generatePositionStr(position) {
    let result = '';
    if (position.provinceName) {
      result += position.provinceName;
    }
    if (position.districtName) {
      result += position.districtName;
    }
    if (position.cityName) {
      result += position.cityName;
    }
    if (position.address) {
      result += position.address;
    }
    return result;
  },
};
