import * as article from './article';
import * as tag from './tag';
import * as category from './category';
import * as user from './user';
import * as dept from './dept';
import * as role from './role';
import * as privilege from './privilege';

const api = {
  ...article,
  ...tag,
  ...category,
  ...user,
  ...dept,
  ...role,
  ...privilege,
};
export default api;
