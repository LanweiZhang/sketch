import { Database } from './database';

export type Timestamp = string;
export type Token = string;
export type UInt = number;
export type Increments = number;

export namespace ResData {
  export interface Quote {
    type:'quote';
    id:number;
    attributes:{
      body:string;
      user_id?:Increments;
      is_anonymous?:boolean;
      majia?:string;
      not_sad?:boolean;
      is_approved?:boolean;
      reviewer_id?:Increments;
      xianyu?:number;
      created_at?:Timestamp;
    };
    author:User;
  }

  export function allocQuote () {
    return {
      type: 'quote',
      id: 0,
      attributes: {
        body: '',
      },
      author: allocUser(),
    };
  }

  export interface User {
    type:'user';
    id:number;
    attributes:Database.UserDefault;
    followInfo?:{
      keep_updated:boolean;
      is_updated:boolean;
    };
  }

  export function allocUser () : User {
    return {
      type: 'user',
      id: 0,
      attributes: {
        name: '',
      },
    };
  }

  export interface Channel {
    type:'channel';
    id:number;
    attributes:Database.Channel;
  }

  export interface Reward {
    type:'reward';
    id:number;
    attributes:{
      rewardable_type:ReqData.Reward.rewardableType;
      rewardable_id:number;
      reward_type:ReqData.Reward.rewardType;
      reward_value:number;
      created_at:Timestamp;
      deleted_at:Timestamp;
    };
    author?:User;   //available at reward_received
    receiver?:User; //available at reward_sent
  }

  export function allocReward () : Reward {
    return {
      id: 0,
      type: 'reward',
      attributes: {
        rewardable_type: ReqData.Reward.rewardableType.post,
        rewardable_id: 0,
        reward_value: 0,
        reward_type: ReqData.Reward.rewardType.fish,
        created_at: '',
        deleted_at: '',
      },
      author: allocUser(),
    };
  }

  export interface Tongren {
    id:number;
    type:'tongren';
    attributes:{
      thread_id:number;
      tongren_yuanzhu:string;
      tongren_CP:string;
    };
  }

  export function allocTongren () : Tongren {
    return {
      id: 0,
      type: 'tongren',
      attributes: {
        thread_id: 0,
        tongren_yuanzhu: '',
        tongren_CP: '',
      },
    };
  }

  export interface Thread {
    type:'thread';
    id:number;
    attributes:Database.Thread;
    author:User;
    tags:Tag[];
    last_component?:Post;
    last_post?:Post;
    component_index_brief:Post[];
    recent_rewards:Reward[];
    random_review:Post[];
    tongren:Tongren[];
  }

  export function allocThread () : Thread {
    return {
      type: 'thread',
      id: 0,
      attributes: {
        title: '',
        channel_id: 0,
      },
      author: allocUser(),
      component_index_brief: [],
      recent_rewards: [],
      random_review: [],
      tongren: [],
      tags: [],
    };
  }

  export interface Status {
    type:'status';
    id:number;
    attributes:Database.Status;
    author:User;
  }

  export interface Tag {
    type:'tag';
    id:number;
    attributes:Database.Tag;
  }

  export interface ThreadPaginate {
    total:number;
    count:number;
    per_page:number;
    current_page:number;
    total_pages:number;
  }

  export function allocThreadPaginate () : ThreadPaginate {
    return {
      total: 1,
      count: 1,
      per_page: 1,
      current_page: 1,
      total_pages: 1,
    };
  }

  export interface PostInfo {
    type:'post_info';
    id:number;
    attributes:Database.PostInfo;
    reviewee:Thread;
  }

  export function allocPostInfo () : PostInfo {
    return {
      type: 'post_info',
      id: 0,
      attributes: {
        order_by: 0,
        abstract: '',
        previous_id: 0,
        next_id: 0,
        reviewee_id: 0,
        reviewee_type: 'thread',
        rating: 0,
        redirect_count: 0,
        author_attitude: 0,
        summary: '',
        annotation: null,
        warning: '',
      },
      reviewee: allocThread(),
    };
  }

  export interface Post {
    type:'post';
    id:number;
    attributes:Database.Post;
    author:User;
    info:PostInfo;
    parent:Post[];
    last_reply:null|Post;
    recent_rewards:Reward[];
    recent_upvotes:Post[];
    new_replies:Post[];
    thread?:Thread;
  }

  export function allocPost () : Post {
    return {
      type: 'post',
      id: 0,
      attributes: {
        body: '',
      },
      info: allocPostInfo(),
      parent: [],
      author: allocUser(),
      last_reply: null,
      recent_upvotes: [],
      recent_rewards: [],
      new_replies: [],
    };
  }

  export interface Review {
    type:'review';
    id:number;
    attributes:{};
    reviewee:Database.Thread;
  }

  export function allocReview () {
    return {
      type: 'review',
      id: 0,
      attributes: {},
      reviewee: allocThread(),
    };
  }

  export interface Recommendation {
    type:'recommendation';
    id:number;
    attributes:{
      brief:string;
      body:string;
      type:'long'|'shot';
      created_at:Database.Timestamp;
    };
    authors:User[];
  }

  export interface Chapter {
    type:'chapter';
    id:number;
    attributes:Database.Chapter;
  }

  export function allocChapter () : Chapter {
    return {
      type: 'chapter',
      id: 0,
      attributes: {

      },
    };
  }

  export interface Volumn {
    type:'volumn';
    id:number;
    attributes:Database.Volume;
  }

  export interface Date {
    date:Timestamp;
    timezone_type:number;
    timezone:string;
  }

  export interface Activity {
    type:'activity';
    id:number;
    attributes:{
      kind:number;
      seen:boolean;
      item_id:number;
      item_type:string;
      user_id:number;
    };
    item:Post | Status | Quote | Thread;
    author?:User;
  }

  export interface Message {
    type:'message';
    id:number;
    attributes:{
      poster_id:number;
      receiver_id:number;
      body_id:number;
      created_at:Timestamp;
      seen:boolean;
    };
    poster?:User;
    message_body?:MessageBody;
    receiver?:User;
  }

  export interface MessageBody {
    type:'message_body';
    id:number;
    attributes:{
      body:string;
      bulk:boolean;
    };
  }

  export function allocMessage () : Message {
    return {
      type: 'message',
      id: 0,
      attributes: {
        poster_id: 0,
        receiver_id: 0,
        body_id: 0,
        created_at: '',
        seen: false,
      },
      poster: allocUser(),
      receiver: allocUser(),
      message_body: allocMessageBody(),
    };
  }

  export function allocMessageBody () : MessageBody {
    return {
      type: 'message_body',
      id: 0,
      attributes: {
          body: '',
          bulk: false,
      },
    };
  }
  export interface PublicNotice {
    type:'public_notice';
    id:number;
    attributes:{
      user_id:number;
      title:string;
      body:string;
      created_at:Timestamp;
      edited_at:Timestamp;
    };
    author?:User;
  }
  export function allocPublicNotice () : PublicNotice {
    return {
      type: 'public_notice',
      id: 0,
      attributes: {
        user_id: 0,
        title: '',
        body: '',
        created_at: '',
        edited_at: '',
      },
      author: allocUser(),
    };
  }

  export interface Title {
    type:'title';
    id:number;
    attributes:{
      name:string;
      description:string;
      user_count:number;
      style_id:number;
      type:string;
      level:number;
      style_type:string;
    };
  }
  export function allocTitle () : Title {
    return {
      type: 'title',
      id: 0,
      attributes: {
        name: '',
        description: '',
        user_count: 0,
        style_id:0,
        type:'',
        level:0,
        style_type:'',
      },
    };
  }
  export interface Vote {
    type:'vote';
    id:number;
    attributes:{
      votable_type:ReqData.Vote.type;
      votable_id:number;
      attitude:ReqData.Vote.attitude;
      created_at:Timestamp;
    };
    author?:User;
    receiver?:User;
    votable?:null | ResData.Thread | ResData.Post | ResData.Status | ResData.Quote;
  }

  export interface Reward {
    type:'reward';
    id:number;
    attributes:{
      rewardable_type:ReqData.Reward.rewardableType;
      rewardable_id:number;
      reward_type:ReqData.Reward.rewardType;
      reward_value:number;
      created_at:Timestamp;
      deleted_at:Timestamp;
    };
    author?:User;   //available at reward_received
    receiver?:User; //available at reward_sent
    rewardable?:null | ResData.Thread | ResData.Post | ResData.Status | ResData.Quote;
  }

  export interface Collection {
    type:'collection';
    id:number;
    attributes:{
      user_id:number;
      thread_id:number;
      keep_updated:boolean;
      updated:boolean;
      group_id:number;
      last_read_post_id:number;
    };
  }
  export interface CollectionGroup {
    type:'collection_group';
    id:number;
    attributes:{
      user_id:number;
      name:string;
      update_count:number;
      order_by:number;
    };
  }

  export interface BriefHomework {
    type:'homework';
    id:number;
    attributes:{
      title:string;
      topic:string;
      level:number;
      is_active:boolean;
      purchase_count:number;
      worker_count:number;
      critic_count:number;
    };
  }

  export interface FAQ {
    type:'faq';
    id:number;
    attributes:{
      key:string;
      question:string;
      answer:string;
    };
  }

  // registration
  export interface QuizQuestion {
    type:'quiz';
    id:number;
    attributes:{
      body:string;
      hint:string;
      options:QuizQuestionOption[];
    };
  }
  export interface QuizQuestionOption {
    type:'quiz_option';
    id:number;
    attributes:{
      body:string;
    };
  }
  export interface Essay {
    type:'essay';
    id:number;
    attributes:{
      body:string,
      hint:string,
    };
  }
  export function allocEssay() : Essay {
    return {
      type:'essay',
      id:0,
      attributes:{
        body:'',
        hint:'',
      },
    };
  }
  export interface RegistrationApplication {
    type:'registration_application';
    id:number;
    attributes:{
      email:string,
      has_quizzed:boolean,
      email_verified_at:Timestamp,
      submitted_at:Timestamp,
      is_passed:boolean,
      last_invited_at:Timestamp,
      is_in_cooldown:boolean,
    };
  }
  export function allocRegistrationApplication () : RegistrationApplication {
    return {
      type: 'registration_application',
      id: 0,
      attributes: {
        email:'',
        has_quizzed:false,
        email_verified_at:'',
        submitted_at:'',
        is_passed:false,
        last_invited_at:'',
        is_in_cooldown:false,
      },
    };
  }
}

export namespace ReqData {
  export namespace Thread {
    export enum ordered {
      default = 'default', //最后回复
      latest_added_component = 'latest_added_component', //按最新更新时间排序
      jifen = 'jifen',  //按总积分排序
      weighted_jifen = 'weighted_jifen', //按平衡积分排序
      latest_created = 'latest_created', //按创建时间排序
      collection_count = 'collection_count', //按收藏总数排序
      total_char = 'total_char', //按总字数排序
      random = 'random',
    }
    // （是否仅返回边缘/非边缘内容）
    export enum withBianyuan {
      bianyuan_only = 'bianyuan_only',
      none_bianyuan_only = 'none_bianyuan_only',
    }

    export enum Type {
      thread = 'thread',
      book = 'book',
      list = 'list', //收藏单
      column = 'column',
      request = 'request',
      homework = 'homework',
    }
  }

  export namespace Message {
    export enum style {
      sendbox = 'sendbox',
      receiveBox = 'receivebox',
      dialogue = 'dialogue',
    }

    export enum ordered {
      oldest,
      latest,
    }

    export enum read {
      read_only,
      unread_only,
    }
  }

  export namespace Collection {
    export enum type {
      thread = 'thread',
      book = 'book',
      list = 'list',
      request = 'request',
      homework = 'homework',
    }
  }

  export namespace Title {
    export enum status {
      hide = 'hide',
      public = 'public',
      wear = 'wear',
    }
  }

  export namespace Vote {
    export enum type {
      post = 'Post',
      quote = 'Quote',
      status = 'Status',
      thread = 'Thread',
    }
    export enum attitude {
      upvote = 'upvote',
      downvote = 'downvote',
      funnyvote = 'funnyvote',
      foldvote = 'foldvote',
    }
  }

  export namespace Reward {
    export enum rewardableType {
      post = 'post',
      quote = 'quote',
      status = 'status',
      thread = 'thread',
    }
    export enum rewardType {
      salt = 'salt',
      fish = 'fish',
      ham = 'ham',
    }
  }

  export namespace Post {
    export enum Type {
      post = 'post',
      comment = 'comment',
      chapter = 'chatper',
      review = 'review',
    }
    export enum withComponent {
      component_only = 'component_only',
      none_component_only = 'none_component_only',
    }
    export enum ordered {
      latest_created = 'latest_created',
      most_replied = 'most_replied',
      most_upvoted = 'most_upvoted',
      latest_responded = 'latest_responded',
      random = 'random',
    }
  }

  export namespace Registration {
    export enum invitationType {
      token = 'token',
      email = 'email',
    }
  }
}
