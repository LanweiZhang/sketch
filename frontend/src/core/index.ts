import { DB } from './db';
import { User } from './user';
import { History, UnregisterCallback, createBrowserHistory } from 'history';
import { EventBus } from '../utils/events';
import * as _ from 'lodash/core';
import { TagFilter, ChannelFilter, BianyuanFilter } from './filter-handler';
import { Route } from './route';
import { saveStorage, FontType } from '../utils/storage';
import { Themes } from '../view/theme/theme';
import { updateNoticeTheme } from '../view/components/common/notice';
import { ResData } from '../config/api';
import { FAQCache, ChannelsCache } from './cache-handler';
const debounce = require('lodash/debounce');

export type Filters = {
  tag:TagFilter,
  channel:ChannelFilter,
  bianyuan:BianyuanFilter,
};
export type Cache = {
  FAQ:FAQCache,
  channels:ChannelsCache,
};

interface State {
  chapterIndex:{
    threadId:number;
    chapters:ResData.Post[];
  };
}

export class Core {
  public db:DB;
  public user:User;
  public history:History;
  public unlistenHistory:UnregisterCallback;
  public windowResizeEvent:EventBus<void>;
  public route:Route;
  public filter:Filters;
  public cache:Cache;

  // data used cross components
  public state:State = {
    chapterIndex: {
      threadId: 0,
      chapters: [],
    },
  };

  constructor () {
    this.history = createBrowserHistory();
    this.unlistenHistory = this.history.listen((location, action) => {
    });

    this.user = new User(this.history);
    this.db = new DB(this.user, this.history);
    this.filter = {
      tag: new TagFilter(this.db),
      channel: new ChannelFilter(this.db),
      bianyuan: new BianyuanFilter(this.db),
    };
    this.cache = {
      FAQ: new FAQCache(this.db),
      channels: new ChannelsCache(this.db),
    };
    this.route = new Route(this.history);
    this.windowResizeEvent = new EventBus();
    window.addEventListener('resize', debounce(() => {
      this.windowResizeEvent.notify(undefined);
    }));
  }

  public async init () {
    await this.filter.tag.init();
    await this.filter.channel.init();
    await this.filter.bianyuan.init();
  }

  public switchTheme (theme:Themes) {
    updateNoticeTheme(theme);
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.setAttribute('class', `theme-${theme}`);
      appElement.setAttribute('data-theme', theme);
      saveStorage('theme', theme);
    }
  }
}