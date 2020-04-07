import { Timestamp } from '../config/db-type';

export function parseDate (date?:Timestamp) {
  if (!date) { return ''; }
  // fixme:
  return '11天前';
}

export function isNewThread (date?:Timestamp) {
  if (!date) { return false; }
  return (new Date(date)).getTime() - (Date.now()) <= 1000 * 3600 * 24;
}