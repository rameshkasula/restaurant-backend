/* eslint-disable prettier/prettier */
import { Types } from 'mongoose';

/**
 * Recursively converts a Mongoose document or plain object/array
 * so that all MongoDB ObjectId instances are converted to strings,
 * and Mongoose document internals are stripped.
 */
export function toPlainObject<T = any>(doc: any): T {
  if (!doc) return doc;

  // If it's a Mongoose document instance, convert to plain object
  if (typeof doc.toObject === 'function') {
    doc = doc.toObject({ virtuals: true });
  } else if (typeof doc.toJSON === 'function') {
    doc = doc.toJSON();
  }

  // Handle Arrays
  if (Array.isArray(doc)) {
    return doc.map((item) => toPlainObject(item)) as any;
  }

  // Handle Objects
  if (typeof doc === 'object' && doc !== null) {
    // If it's an ObjectId itself, return its string representation
    if (doc instanceof Types.ObjectId) {
      return doc.toString() as any;
    }
    
    // Check if it's a Date, return as-is or serialized
    if (doc instanceof Date) {
      return doc as any;
    }

    const clone: any = {};
    for (const key of Object.keys(doc)) {
      const val = doc[key];
      if (val instanceof Types.ObjectId) {
        clone[key] = val.toString();
      } else if (val && typeof val === 'object') {
        clone[key] = toPlainObject(val);
      } else {
        clone[key] = val;
      }
    }
    return clone as T;
  }

  return doc;
}
