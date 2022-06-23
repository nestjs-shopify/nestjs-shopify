import { addLeadingSlash } from './add-leading-slash.util';
import { stripEndSlash } from './strip-end-slash.util';

export const joinUrl = (...paths: string[]) =>
  paths
    .filter(Boolean)
    .map((path) => addLeadingSlash(path || '/'))
    .map((path) => (path !== '/' ? stripEndSlash(path) : path))
    .join('');
