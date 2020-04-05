import { History } from 'history';
import { ReqData, Increments, ResData } from '../config/api';
import { parsePath, URLQuery } from '../utils/url';
import { saveStorage } from '../utils/storage';
import { ErrorMsg, ErrorCodeKeys } from '../config/error';
import { User } from './user';

type JSONType = {[name:string]:any}|string;
type FetchOptions = {
  query?:URLQuery,
  body?:JSONType,
  errorMsg?:{[code:string]:string},
  errorCodes?:ErrorCodeKeys[],
};

type RemovePromise<T extends Promise<any>> = T extends Promise<infer R> ? R : any;
type ArgumentTypes<F extends Function> = F extends (...args:infer A) => any ? A : never;
export type DBResponse<T extends keyof DB> = RemovePromise<ReturnType<DB[T]>>;
export type DBRequest<T extends keyof DB> = ArgumentTypes<DB[T]>;

export class DB {
  private user:User;
  private history:History;
  private host:string;
  private port:number;
  private protocol:string;
  private API_PREFIX = '/api';

  constructor (user:User, history:History) {
    this.user = user;
    this.history = history;
    this.protocol = 'http';
    // this.host = 'sosad.fun'; //fixme:
    this.host = '34.70.54.149';      // use db on dev server
    // this.host = '0.0.0.0';            // use your local db
    this.port = 8000; // for test
  }
  private _handleError (code:number|string, msg:string) {
    return new Error(JSON.stringify({
      code,
      msg,
    }));
  }
  private commonOption:RequestInit = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json, text/plain, */*',
    },
    mode: 'cors',
  };
  private async _fetch (path:string, reqInit:RequestInit, spec:FetchOptions = {}) {
    const headers = Object.assign({}, this.commonOption.headers, reqInit['headers'] || {});
    const options = Object.assign({}, this.commonOption, reqInit, {headers});
    const token = this.user.token;
    if (token) {
      options.headers!['Authorization'] = `Bearer ${token}`;
    }
    let _path = path;
    if (spec.query) {
      _path = parsePath(_path, spec.query);
    }
    if (spec.body) {
      try {
        options.body = JSON.stringify(spec.body);
      } catch (e) {
        throw this._handleError(0, ErrorMsg.JSONParseError);
      }
    }

    const url = `${this.protocol}://${this.host}:${this.port}${this.API_PREFIX}${_path}`;
    console.log(options.method, url, options.body);

    const errorMsgKeys = Object.keys(spec.errorMsg || {});

    const response = await fetch(url, options);
    const result = await response.json();
    if (!result.code || !result.data) {
      console.error('response:', result);
      throw this._handleError(500, ErrorMsg.JSONParseError);
    }
    if (result.code === 200) {
      return result.data;
    }
    // 特别错误提示
    if (spec.errorMsg && errorMsgKeys.indexOf('' + result.code) >= 0) {
      throw this._handleError(result.code, spec.errorMsg[result.code]);
    }
    // 通用错误提示
    if (spec.errorCodes && spec.errorCodes.indexOf(result.code) >= 0) {
      throw this._handleError(result.code, ErrorMsg[result.code]);
    }
    throw this._handleError(result.code, '未知错误');
  }
  private _get (path:string, ops:FetchOptions = {}) {
    return this._fetch(path, {method: 'GET'}, ops);
  }
  private _post (path:string, ops:FetchOptions = {}) {
    return this._fetch(path, {method: 'POST', headers:{'Content-Type': 'application/json'}}, ops);
  }
  private _patch (path:string, ops:FetchOptions = {}) {
    return this._fetch(path, {method: 'PATCH'}, ops);
  }
  private _delete (path:string, ops:FetchOptions = {}) {
    return this._fetch(path, {method: 'DELETE'}, ops);
  }

  // 主页
  public getPageHome () : Promise<{
    quotes:ResData.Quote[],
    recent_recommendations:ResData.Post[],
    homeworks:ResData.BriefHomework[],
    channel_threads:{channel_id:number, threads:ResData.Thread[]}[],
  }> {
    return this._get('/');
  }

  // 文库页
  public getBooks (spec:{
    channel:number[],
    page?:number;
    withBianyuan?:boolean;
    ordered?:ReqData.Thread.ordered;
    withTag?:number[][];
    excludeTag?:number[];
  }) : Promise<{
    threads:ResData.Thread[],
    paginate:ResData.ThreadPaginate,
    // request_data:{with_bianyuan:'include_bianyuan'},
  }> {
    const query = {};
    if (this.user.isLoggedIn()) {
      if (spec.page && spec.page > 1) {
        query['page'] = spec.page;
      }

      if (spec.channel
        && spec.channel.length === 1
        && spec.channel[0] <= 2
      ) {
        query['inChannel'] = spec.channel[0];
      }

      if (spec.withBianyuan) {
        query['withBianyuan'] = 'include_bianyuan';
      }

      if (spec.ordered && spec.ordered !== ReqData.Thread.ordered.default) {
        query['ordered'] = spec.ordered;
      }

      if (spec.excludeTag && spec.excludeTag.length > 0) {
        query['excludeTag'] = spec.excludeTag.join('-');
      }

      if (spec.withTag && spec.withTag.length > 0) {
        query['withTag'] = spec.withTag.map((tagsOr) => tagsOr.join('_')).join('-');
      }
    }

    return this._get('/book', { query });
  }

  // 论坛首页
  public getThreadHome () : Promise<{
    simple_threads:ResData.Thread[],
    threads:ResData.Thread[],
    pagination:ResData.ThreadPaginate,
  }> {
    return this._get('/thread_index');
  }

  // 频道页面
  public getChannelThreads (channelId:number) : Promise<{}> {
    return this._get(`/channel/${channelId}`);
  }

  // 关注用户
  public followUser (userId:number) : Promise<{
    user:ResData.User;
  }> {
    return this._post(`/user/${userId}/follow`, {
      errorCodes: [401],
      errorMsg: {
        403: '不能关注自己',
        404: '指定用户不存在',
        412: '已经关注，无需重复关注',
      },
    });
  }

  // 取关用户
  public unFollowUser (userId:number) : Promise<ResData.User> {
    return this._delete(`/user/${userId}/follow`, {
      errorCodes: [401],
      errorMsg: {
        403: '不能取关自己',
        404: '不能取关不存在用户',
        412: '已经未关注了，不能重复取关',
      },
    });
  }

  // 修改关注设置
  public updateFollowStatus (userId:number, keep_updated:boolean) : Promise<ResData.User> {
    return this._patch(`/user/${userId}/follow`, {
      body: {keep_updated},
      errorCodes: [401, 403, 404, 412],
    });
  }

  //显示关注列表
  public getFollowingIndex (userId:number) : Promise<{
    user:ResData.User,
    followings:ResData.User[],
    paginate:ResData.ThreadPaginate,
  }> {
    return this._get(`/user/${userId}/following`, {
      errorCodes: [401],
    });
  }

  //显示关注列表-含关注状态
  public getFollowingStatuses (userId:number) : Promise<{
    user:ResData.User,
    followingStatuses:ResData.User[],
    paginate:ResData.ThreadPaginate,
  }> {
    return this._get(`/user/${userId}/followingStatuses`, {
      errorCodes: [401],
    });
  }

  // 显示粉丝列表
  public getFollowers (userId:number) : Promise<{
    user:ResData.User,
    followers:ResData.User[],
    paginate:ResData.ThreadPaginate,
  }> {
    return this._get(`/user/${userId}/follower`, {
      errorCodes: [401],
    });
  }

  // 发送私信
  public sendMessage (toUserId:number, content:string) : Promise<{
    message:ResData.Message,
  }> {
    return this._post('/message', {
      body: {
        sendTo: toUserId,
        body: content,
      },
      errorCodes: [403],
    });
  }

  // 群发私信
  public sendGroupMessage (toUsers:number[], content:string) : Promise<{
    messages:ResData.Message[],
  }> {
    return this._post('/groupmessage', {
      body: {
        sendTos: toUsers,
        body: content,
      },
      errorCodes: [403],
      errorMsg: {
        404: '未能找到全部对应的收信人',
      },
    });
  }

  // 展示信箱
  public getMessages = (
    query:{
      withStyle:ReqData.Message.style;
      chatWith?:Increments;
      ordered?:ReqData.Message.ordered;
      read?:ReqData.Message.read;
    },
    id:number = this.user.id,
  ) => {
    return this._get(`/user/${id}/message`, {
      query,
    }) as Promise<{
      style:ReqData.Message.style,
      messages:ResData.Message[],
      paginate:ResData.ThreadPaginate,
    }>;
  }

  // 查看系统消息
  public getPublicNotice = () => {
    return this._get('/publicnotice', {
      errorCodes: [401],
    }) as Promise<{
      public_notices:ResData.PublicNotice[],
    }>;
  }

  // 发系统消息, 管理员
  public sendPublicNotice (content:string) : Promise<{public_notice:ResData.PublicNotice}> {
    return this._post('/publicnotice', {
      body: {
        body: content,
      },
      errorCodes: [403],
    });
  }

  // 查看个人消息/通知
  public getActivities = (userId:number = this.user.id) => {
    return this._get(`/user/${userId}/activity`, {
      errorCodes: [401, 403, 404],
    }) as Promise<{
      activities:ResData.Activity[],
      paginate:ResData.ThreadPaginate,
    }>;
  }

  // 请求全部头衔列表
  public getAllTitles () : Promise<{titles:ResData.Title[]}> {
    return this._get('/config/titles');
  }

  // 用户头衔列表
  public getUserTitles (userId:number) : Promise<{
    user:ResData.User,
    titles:ResData.Title[],
    paginate:ResData.ThreadPaginate,
  }> {
    return this._get(`/user/${userId}/title`, {
      errorCodes: [401],
    });
  }

  //reward system
  // get rewards received by a user
  public getUserRewardsReceived = (userId:number = this.user.id) :
    Promise<{
      rewards:ResData.Reward[],
      paginate:ResData.ThreadPaginate,
    }> => this._get(`/user/${userId}/reward_received`)

  // get rewards sent by a user
  public getUserRewardsSent = (userId:number = this.user.id) :
    Promise<{
      rewards:ResData.Reward[],
      paginate:ResData.ThreadPaginate,
    }> => this._get(`/user/${userId}/reward_sent`)

  public deleteReward = (rewardId:number) :
    Promise<string> => this._delete(`/reward/${rewardId}`)

  // Vote System
  public vote (type:ReqData.Vote.type, id:number, attitude:ReqData.Vote.attitude) : Promise<ResData.Vote> {
    return this._post('/vote', {
      body: {
        votable_type: type,
        votable_id: id,
        attitude,
      },
      errorCodes: [401],
      errorMsg: {
        404: '未找到该投票对象',
        409: '不能重复投票或请先踩赞冲突',
      },
    });
  }

  // 查看评票目录
  public getVotes (type:ReqData.Vote.type, id:number, attitude?:ReqData.Vote.attitude) : Promise<{
    votes:ResData.Vote[],
    paginate:ResData.ThreadPaginate,
  }> {
    return this._get('/vote', {
      query: {
        votable_type: type,
        votable_id: id,
        attitude,
      },
    });
  }

  // get votes received by a user
  public getUserVotesReceived = (userId:number = this.user.id) :
    Promise<{
      votes:ResData.Vote[],
      paginate:ResData.ThreadPaginate,
    }> => this._get(`/user/${userId}/vote_received`)

  public getUserVotesSent = (userId:number = this.user.id) :
    Promise<{
      votes:ResData.Vote[],
      paginate:ResData.ThreadPaginate,
    }> => this._get(`/user/${userId}/vote_sent`)

  // 删除评票
  public deleteVote (voteId:number) : Promise<string> {
    return this._delete(`/vote/${voteId}`);
  }

  // Thread筛选
  public getThreadList (query?:{
    channels?:number[],
    tags?:number[],
    excludeTag?:number[],
    withBianyuan?:ReqData.Thread.withBianyuan,
    ordered?:ReqData.Thread.ordered,
    withType?:ReqData.Thread.Type,
    page?:number;
  }) : Promise<{
    thread:ResData.Thread[],
    paginate:ResData.ThreadPaginate,
  }> {
    return this._get('/thread', {
      query,
    });
  }

  // 查看讨论帖
  public getThread (id:number, query?:{
    page?:number,
    ordered?:ReqData.Thread.ordered,
  }) : Promise<{
    thread:ResData.Thread,
    posts:ResData.Post[],
    paginate:ResData.ThreadPaginate,
  }> {
    return this._get(`/thread/${id}`, {
      query,
    });
  }

  // 获取回帖
  public getPost (threadId:number, postId:number) : Promise<{
    thread:ResData.Thread;
    post:ResData.Post;
  }> {
    return this._get(`/thread/${threadId}/post/${postId}`);
  }

  // 修改回帖类型
  public turnToPost (postId:number, convertTo:ReqData.Post.Type) : Promise<ResData.Post> {
    return this._patch(`/post/${postId}/turnToPost`, {
      body: {
        convert_to_type: convertTo,
      },
    });
  }

  // 查看书籍或讨论的封面
  public getThreadProfile (threadId:number, query:{
    page?:number;
    ordered?:ReqData.Post.ordered,
  }) : Promise<{
    thread:ResData.Thread,
    posts:ResData.Post[],
  }> {
    return this._get(`/thread/${threadId}/profile`, {
      query,
    });
  }

  // 新建讨论帖/书籍
  public publishThread (req:{
      title:string;
      brief:string;
      body:string;
      no_reply?:boolean;
      use_markdown?:boolean;
      use_indentation?:boolean;
      is_bianyuan?:boolean;
      is_not_public?:boolean;
  }) : Promise<ResData.Thread> {
      return this._post( '/thread', req);
  }

  // 新建回帖/章节/书评
  public addPostToThread (threadId:number, post:{
      body:string;
      type:ReqData.Post.Type,
      title?:string;
      brief?:string;
      is_anonymous?:boolean;
      majia?:string;
      reviewee_id?:number;
      reviewee_type?:string;
      reply_to_id?:number;
      reply_to_brief?:string;
      reply_to_position?:string;
      rating?:number;
      in_component_id?:number;
      summary?:'recommend',
      use_markdown?:boolean;
      use_indentation?:boolean;
  }) : Promise<ResData.Post> {
      return this._post(`/thread/${threadId}/post`, {
        body: post,
      });
  }

  public addReward (body:{
    rewardable_id:number;
    rewardable_type:'Post'|'Thread';
    value:number;
    attribute:'shengfan'|'xianyu'|'sangdian'|'jifen'|'fish'|'salt'|'ham';
  }) {
    return this._post(`/reward`, {
      body,
      errorMsg: {
        401: '未登录',
        404: '被打赏模型不存在',
        410: '今日已经打赏过，一日一内容只能打上一次',
        412: '余额不足，无法透支打赏超过自身具有虚拟物',
        422: '输入格式不符合要求',
      },
    });
  }

  // 收藏
  public collectThread (threadId:number, group_id?:number) : Promise<ResData.Collection> {
    return this._post(`/thread/${threadId}/collect`, {
      errorMsg: {
        404: '找不到这本图书',
        409: '已经收藏，不要重复收藏',
        410: '不能频繁收藏',
        413: '书籍申请删除中不能收藏',
      },
      errorCodes: [401],
      body: { group_id },
    });
  }

  // 展示用户收藏夹
  public getUserCollection () : Promise<{collection:ResData.Collection[]}> {
    return this._get(`/user/${this.user.id}/collection`, {
      errorMsg: {
        403: '非本人无权限查看收藏',
      },
    });
  }

  // 注册, 仅供测试
  public async register (name:string, password:string, email:string, backTo?:string) {
    const res = await this._post('/register', {
      query:{name, password, email},
      errorMsg: {
        422: '用户名/密码/邮箱格式错误',
      },
    });
    if (!res) { return false; }
    this.user.login(res.name, res.id, res.token);
    saveStorage('auth', {token: res.token, username: res.name, userId: res.id});
    backTo ? this.history.push(backTo) : this.history.push('/');
    return true;
  }

  public registerVerifyInvitationToken = (invitation_token:string) :
    Promise<string> => {
    return this._post('/register/by_invitation_token/submit_token', {
      body: {
        invitation_token,
      },
      errorMsg: {
        404: '邀请码不存在或已过期',
        429: '五分钟内只能尝试注册一次',
      },
    });
  }
  public registerByInvitationEmailSubmitEmail = (email:string) :
    Promise<{
      registration_application:ResData.RegistrationApplication;
      quizzes?:ResData.QuizQuestion[];
      essay?:ResData.Essay; }> => {
    return this._post('/register/by_invitation_email/submit_email', {
      body: {
        email,
      },
      errorMsg: {
        414: '用户已经登陆',
        422: '邮箱格式错误',
        499: '邮箱被拉黑',
        409: '这个邮箱已注册，请直接登陆',
        498: '访问过于频繁',
      },
    });
  }
  public registerByInvitationEmailSubmitQuiz =
    (email:string, quizzes:{id:number, answer:string}[]) :
    Promise<{
      registration_application:ResData.RegistrationApplication;
      essay?:ResData.Essay;
    }> => {
    return this._post('/register/by_invitation_email/submit_quiz', {
      body: {
        email,
        quizzes,
      },
      errorMsg: {
        404: '申请记录不存在',
        409: '已经成功回答题，不需要再答题',
        422: '请求数据格式有误',
        444: '回答的题目和数据库中应该回答的题不符合',
        498: '过于频繁访问',
        499: '邮箱已被拉黑',
      },
    });
  }
  public registerByInvitationConfirmToken =
    (email:string, token:string) :
    Promise<{ email:string; }> => {
    return this._post('/register/by_invitation_email/submit_email_confirmation_token', {
      body: {
        email,
        token,
      },
      errorMsg: {
        404: '申请记录不存在',
        409: '已经成功确认邮箱',
        411: '未完成前序步骤(未答题)',
        422: '邮箱格式错误/token验证错误',
        498: '过于频繁访问',
        499: '邮箱已被拉黑',
      },
    });
  }
  public registerByInvitationEmailResendEmailVerification =
    (email:string) :
    Promise<{ email:string }> => {
    return this._get('/register/by_invitation_email/resend_email_verification', {
      query: {
        email,
      },
      errorMsg: {
        404: '申请记录不存在',
        410: '已成功发信，暂时不能重复发信/已经验证过邮箱，不需要重复验证',
        411: '未完成其他需要的情况(如未答题，不能发验证邮件)',
        498: '过于频繁访问',
        499: '邮箱已被拉黑',
      },
    });
  }
  public registerByInvitationSubmitEssay =
    (email:string, essay_id:number, body:string) :
    Promise<{ registration_application:ResData.RegistrationApplication; }> => {
    return this._post('/register/by_invitation_email/submit_essay', {
      body: {
        email,
        essay_id,
        body,
      },
      errorMsg: {
        404: '申请记录不存在',
        409: '已经成功提交论文，等待审核中，不需要再提交论文',
        411: '未完成其他需要的情况（如未答题，未验证邮箱）',
        444: '回答的题目和数据库中应该回答的题不符合',
        498: '过于频繁访问',
        499: '邮箱已被拉黑',
      },
    });
  }
  public registerByInvitation =(
    invitation_type:ReqData.Registration.invitationType,
    invitation_token:string,
    name:string,
    email:string,
    password:string,
  ) : Promise<{
    token:string;
    name:string;
    id:number;
  }> => {
    const body = {
      name,
      email,
      password,
      invitation_token,
      invitation_type,
    };
    return this._post('/register_by_invitation', {
      body,
      errorMsg: {
        422: '缺少必要的信息，不能定位申请记录',
        499: '已进入黑名单',
        404: '不能找到邀请码/申请资料',
        409: '这个邮箱已经注册，请直接登陆',
        444: '邀请链接已失效',
      },
    });
  }
  public async login (email:string, password:string, backTo?:string) {
    const res = await this._post('/login', {
      query: {
        email,
        password,
      },
      errorMsg: {
        401: '用户名/密码错误',
      },
    });
    if (!res) { return false; }
    this.user.login(res.name, res.id, res.token);
    saveStorage('auth', {token: res.token, username: res.name, userId: res.id});
    backTo ? this.history.push(backTo) : this.history.push('/');
    return true;
  }

  // 发送重置密码邮件
  public async resetPassword (email:string) : Promise<boolean> {
    await this._post(`/password/email`, {
      errorMsg: {
        404: '该邮箱账户不存在',
        410: '该邮箱12小时内已发送过重置邮件。请不要重复发送邮件，避免被识别为垃圾邮件',
        498: '当前ip已于1小时内成功重置密码',
        412: '当日注册的用户不能重置密码',
        422: '邮箱格式不正确',
      },
    });
    return true;
  }

  // 全部tag
  public getAllTags () : Promise<{tags:ResData.Tag[]}> {
    return this._get('/config/allTags');
  }

  // 获取全部channel
  public async getAllChannels () : Promise<{[channelId:number]:ResData.Channel}> {
    const data =  await this._get('/config/allChannels');
    const result:{[channelId:number]:ResData.Channel} = {};
    for (let i = 0; i < data.channels.length; i ++) {
      const channel = data.channels[i];
      result[channel.id] = channel;
    }
    return result;
  }

  // help faq system
  public getFAQs = () : Promise<ResData.FAQ[]> => {
    return this._get('/helpfaq');
  }
  // others
  public addQuote (body:{
    body:string;
    is_anonymous?:boolean;
    majia?:string;
  }) {
    // fixme:
    return this._post('/quote', body);
  }
  public getNoTongrenTags () {
    // fixme:
    return new Promise<[]>((resolve) => resolve([]));
  }
}