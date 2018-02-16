<h3>
   <span type="button" class="{{$user->admin? 'admin-symbol' : '' }}"><span class="glyphicon glyphicon-user"></span></span>
   {{ $user->name }}
</h3>
<div class="row h5 text-center stat">
      <span><a href="{{route('users.followings', $user->id)}}">关注：{{ $user->followings()->count() }}</a></span>
      @include('users._follow_button')
      @include('users._message_button')
      <span><a href="{{route('users.followers', $user->id)}}">粉丝：{{ $user->followers()->count() }}</a></span>
</div>

<div class="stats">
      <span>等级：{{ $user->user_level }}</span>
      <span>积分：{{ $user->jifen }}</span>
      <span>剩饭：{{ $user->shengfan }}</span>
      <span>咸鱼：{{ $user->xianyu }}</span>
      <span>丧点：{{ $user->sangdian }}</span>
      <span>连续签到：{{ $user->continued_qiandao }}天</span>
</div>
<br>
<div class = "main-text">
   {!! Markdown::convertToHtml($user->introduction) !!}
</div>
