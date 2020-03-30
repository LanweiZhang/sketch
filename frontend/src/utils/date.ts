import { Timestamp } from '../config/api';

// FIXME: 这里,后端返回一些time已经parse成了'xx天/小时前'的格式
// 只有部分是time string
export function parseDate (date?:Timestamp) {
  if (!date) { return ''; }
  // fixme:
  return '11天前';
}

export function isNewThread (date?:Timestamp) {
  if (!date) { return false; }
  return (new Date(date)).getTime() - (Date.now()) <= 1000 * 3600 * 24;
}