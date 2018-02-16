<span>
   <a href="#" data-toggle="modal" data-target="#TriggerAdminControlPost{{ $post->id }}" class="btn btn-sm btn-danger sosad-button admin-button"><span class="glyphicon glyphicon-user"></span>删除回帖</a>
</span>

<div class="modal fade" id="TriggerAdminControlPost{{ $post->id }}" role="dialog">
    <div class="modal-dialog">
      <div class="modal-content">
         <form action="{{ route('admin.postmanagement',$post->id)}}" method="POST">
            {{ csrf_field() }}
            <div class="admin-symbol">
               <h4>管理员权限专区</h4>
            </div>
            <div class="checkbox">
               <p class="lead admin-symbol pull-right"><label><input type="checkbox" name="delete" {{ $post->deleted_at ? 'checked' : '' }} >{{ $thread->deleted_at ? '恢复删除' : '删除帖子' }}</label></p>
            </div>
            <div class="form-group">
               <label for="reason"></label>
               <textarea name="reason"  rows="3" class="form-control" placeholder="请输入处理理由"></textarea>
            </div>
            <div class="">
               <button type="submit" class="btn btn-danger sosad-button btn-md admin-button">确定管理</button>
            </div>
         </form>
      </div>
   </div>
</div>
