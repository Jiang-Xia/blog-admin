import * as article from './article';
import * as tag from './tag';
import * as category from './category';
import * as user from './user';

const api = {
  ...article,
  ...tag,
  ...category,
  ...user,
};
export default api;
