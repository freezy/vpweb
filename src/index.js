import './index.sass';
import { Loader } from './loader';
import { FileCache } from './file-cache';

const cache = new FileCache();
cache.init();
window.loader = new Loader(cache);



