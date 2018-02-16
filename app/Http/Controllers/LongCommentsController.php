<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

use App\LongComment;
use App\Post;
use Auth;

class LongCommentsController extends Controller
{
   public function __construct()
   {
    $this->middleware('auth')->except('index', 'show');
   }
   public function index()
   {
      $group = Auth::check() ? Auth::user()->group : 10;
      $posts = DB::table('posts')
      ->join('users','users.id','=','posts.user_id')
      ->join('threads','threads.id','=','posts.thread_id')
      ->join('channels', 'threads.channel_id','=','channels.id')
      ->where([['posts.long_comment','=',1],['posts.deleted_at','=',null],['channels.channel_state','<',$group]])
      ->select('posts.*','threads.title as thread_title', 'users.name')
      ->orderBy('posts.created_at', 'desc')
      ->simplePaginate(Config::get('constants.index_per_page'));
      return view('long_comments.index', compact('posts'));
   }
}
