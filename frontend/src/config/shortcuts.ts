export const Shortcuts = {
  tools: {
    polygon: 'q',
    rectangle: 'r',
    move: 'm',
    edit: 'e',
  },
  annotation: {
    cancel: 'Escape',
    closePolygon: 'c',
  },
  navigation: {
    previousImage: 'a',
    nextImage: 'd',
    panUp: 'w',
    panDown: 's',
    panLeft: 'a',
    panRight: 'd',
  },
  file: {
    save: 'ctrl+s',
  }
} as const;

// 帮助提示文本
export const ShortcutHints = {
  tools: {
    polygon: '多边形标注 (Q)',
    rectangle: '矩形标注 (R)',
    move: '移动工具 (M)',
    edit: '编辑工具 (E)',
  },
  annotation: {
    cancel: '取消标注 (ESC)',
    closePolygon: '闭合多边形 (C)',
  },
  navigation: {
    image: '切换图片 (A/D)',
    pan: '平移画布 (W/S/A/D)',
  },
  file: {
    save: '保存标注 (Ctrl+S)',
  }
} as const;
