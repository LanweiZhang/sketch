export enum RoutePath {
  home = '/',
  createQuote = '/createquote',
  suggestion = '/suggestion',
  library = '/library',

  // forum
  forum = '/thread_index',
  book = '/book/:id',
  chapter = '/book/:bid/chapter/:cid',

  // user
  user = '/user',
  login = '/login',
  register = '/register',
  reset_password = '/reset_password',

  // collection
  collection = '/collection',

  // status
  status = '/status/all',
  statusCollection = '/status/collection',

  // messages
  personalMessages = '/messages/pm/all',
  dialogue = '/messages/pm/dialogue/:uid',
  publicNotice = '/messages/publicnotice',
  messages = '/messages/activity',
  votes = '/messages/vote',
  rewards = '/messages/reward',

  // my
  FAQMenu = '/my/faq/all',
  FAQContent = '/my/faq/:key',

  // other
  tags = '/tags',
  search = '/search',
}