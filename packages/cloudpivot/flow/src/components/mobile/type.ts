export const imageExt =
  /^(bmp|cur|dds|exr|gif|ico|jp(e)?g|pcx|pbm|pfm|pgm|ppm|png|psd|svg|tga|tif|tiff|webp)$/;
export const audioExt =
  /^(aac|aif|ape|flac|oga|opus|m3u|m4a|mid|midi|mp3|ra|wav|wma|weba)$/;
export const videoExt =
  /^(3gp|3g2|asf|avi|f4f|f4i|f4m|f4v|flv|h264|m4v|mkv|mov|mp4|mpg|ogg|ogv|qt|rm|rmvb|ts|vob|webm|wmv)$/;
export const documentExt =
  /^(c|cfg|cpp|cs|css|csv|dat|h|hpp|ini|js|log|m|ps|py|rtf|sh|tex|torrent|txt|doc(x)?|xls(x)?|ppt(x)?|pdf)$/;
export const wordExt = /^(doc(x)?)$/;
export const excelExt = /^(csv|xls(x)?)$/;
export const pptExt = /^(ppt(x)?)$/;
export const pdfExt = /^(pdf)$/;
export const archiveExt =
  /^(7z|bin|cbr|cue|deb|dmg|(tar\.)?gz|iso|mdf|pkg|rar|rpm|sitx|vcd|zip)$/;
export const exeExt = /^(apk|app|bat|cgi|com|dll|exe|gadget|jar|msi|pif|sys)$/;

export const TYPE_IMAGE = 'image';
export const TYPE_VIDEO = 'video';
export const TYPE_AUDIO = 'audio';
export const TYPE_DOCUMENT = 'document';
export const TYPE_WORD = 'word';
export const TYPE_EXCEL = 'excel';
export const TYPE_PPT = 'ppt';
export const TYPE_PDF = 'pdf';
export const TYPE_ARCHIVE = 'archive';
export const TYPE_EXE = 'exe';
export const TYPE_UNKNOWN = 'unknown';

export const icons = {
  [TYPE_IMAGE]: 'h-icon-all-picture',
  [TYPE_VIDEO]: 'h-icon-all-video',
  [TYPE_AUDIO]: 'h-icon-all-music',
  [TYPE_DOCUMENT]: 'h-icon-all-t',
  [TYPE_WORD]: 'h-icon-all-word',
  [TYPE_EXCEL]: 'h-icon-all-excel',
  [TYPE_PPT]: 'h-icon-all-ppt',
  [TYPE_PDF]: 'h-icon-all-pdf',
  [TYPE_ARCHIVE]: 'h-icon-all-zip',
  [TYPE_EXE]: 'h-icon-all-unkonw',
  [TYPE_UNKNOWN]: 'h-icon-all-unkonw',
};

const types = [
  {
    type: TYPE_IMAGE,
    regexp: imageExt,
  },
  {
    type: TYPE_VIDEO,
    regexp: videoExt,
  },
  {
    type: TYPE_AUDIO,
    regexp: audioExt,
  },
  {
    type: TYPE_DOCUMENT,
    regexp: documentExt,
    children: [
      {
        type: TYPE_WORD,
        regexp: wordExt,
      },
      {
        type: TYPE_EXCEL,
        regexp: excelExt,
      },
      {
        type: TYPE_PPT,
        regexp: pptExt,
      },
      {
        type: TYPE_PDF,
        regexp: pdfExt,
      },
    ],
  },
  {
    type: TYPE_ARCHIVE,
    regexp: archiveExt,
  },
  {
    type: TYPE_EXE,
    regexp: exeExt,
  },
];

function getType(ext, _types, def = TYPE_UNKNOWN) {
  for (const item of _types) {
    if (ext.match(item.regexp)) {
      return item.children ? getType(ext, item.children, item.type) : item.type;
    }
  }
  return def;
}

export function getFileType(fileName) {
  if (!fileName || !fileName.includes('.')) {
    return TYPE_UNKNOWN;
  }
  const ext = fileName.split('.').pop().toLocaleLowerCase();
  return !ext ? TYPE_UNKNOWN : getType(ext, types);
}

export function getIconCode(fileName) {
  return icons[getFileType(fileName)];
}
