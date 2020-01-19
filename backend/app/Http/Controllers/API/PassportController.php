<?php

namespace App\Http\Controllers\API;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Validator;
use Hash;
use Carbon\Carbon;
use ConstantObjects;
use DB;
use App\Models\User;
use App\Models\UserInfo;
use App\Http\Controllers\Auth\ResetPasswordController;
use Illuminate\Foundation\Auth\ResetsPasswords;
class PassportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api')->only('logout');
    }

    /**
    * Get a validator for an incoming registration request.
    *
    * @param  array  $data
    * @return \Illuminate\Contracts\Validation\Validator
    */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => 'required|string|alpha_dash|unique:users|display_length:2,8',
            'email' => 'required|string|email|max:255|unique:users|confirmed',
            'password' => 'required|string|min:10|max:32|confirmed|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{6,}$/',
        ]);
        //password_confirmation must be included in this string
    }

    /**
    * Create a new user instance after a valid registration.
    *
    * @param  array  $data
    * @return \App\Models\User
    */

    protected function create(array $data)
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
        $info = UserInfo::create([
            'user_id' => $user->id,
        ]);
        return $user;
    }

    protected function create_by_invitation_token(array $data, $invitation_token, $application)
    {
        $new_user_base = array_key_exists($invitation_token->token_level, config('constants.new_user_base')) ? config('constants.new_user_base')[$invitation_token->token_level]:'';

        return DB::transaction( function() use($data, $invitation_token, $new_user_base, $application){
            $user = User::create([
                'email' => $data['email'],
                'name' => $data['name'],
                'password' => bcrypt($data['password']),
                'activated' => false,
                'level' => $new_user_base? $new_user_base['level']:0,
            ]);
            $info = UserInfo::create([
                'user_id' => $user->id,
                'invitation_token' => $invitation_token->token,
                'activation_token' => str_random(45),
                'invitor_id' => $invitation_token->is_public?0:$invitation_token->user_id,
                'salt' => $new_user_base? $new_user_base['salt']:0,
                'fish' => $new_user_base? $new_user_base['fish']:0,
                'ham' => $new_user_base? $new_user_base['ham']:0,
                'creation_ip' => request()->ip(),
            ]);

            if($application){
                $application->update(['user_id'=>$user->id]);
            }

            $invitation_token->inactive_once();
            return $user;
        });
    }

    protected function create_by_invitation_email(array $data, $application)
    {
        return DB::transaction( function() use($data, $application){
            $user = User::firstOrCreate([
                'email' => $data['email']
            ],[
                'name' => $data['name'],
                'password' => bcrypt($data['password']),
                'activated' => true,
                'level' => 0,
            ]);
            $info = UserInfo::firstOrCreate([
                'user_id' => $user->id
            ],[
                'email_verified_at' => Carbon::now(),
                'creation_ip' => request()->ip(),
            ]);

            $application->update(['user_id'=>$user->id]);
            return $user;
        });
    }

    public function register(Request $request)
    {
        $validator = $this->validator($request->all());
        if ($validator->fails()) {
            return response()->error($validator->errors(), 422);
        }
        $user = $this->create($request->all());
        $success['token'] =  $user->createToken('MyApp')->accessToken;
        $success['name'] =  $user->name;
        $success['id'] = $user->id;
        return response()->success($success);
    }

    public function register_by_invitation(Request $request)
    {
        $user = [];

        if(ConstantObjects::black_list_emails()->where('email',request('email'))->first()){
            abort(499);
        }

        if($requset->invitation_type==='token'){

            $invitation_token = App\Models\InvitationToken::where('token', request('invitation_token'))->first();

            $application = App\Models\RegistrationApplication::where('email', request('email'))->first();

            if(!$invitation_token){abort(404);}

            if(($invitation_token->invitation_times < 1)||($invitation_token->invite_until <  Carbon::now())){abort(444);}

            $this->validator($request->all())->validate();

            $user = $this->create_by_invitation_token($request->all(), $invitation_token, $application);

        }
        if($requset->invitation_type==='email'){

            $application = RegistrationApplication::where('email',request('email'))->where('token',request('token'))->first();

            if(!$application){abort(404);}

            if($application->user_id>0){abort(409);}

            if(!$application->is_passed){abort(444);}

            $this->validator($request->all())->validate();

            $user = $this->create_by_invitation_email($request->all(), $application);
        }

        if(!$user||!$request->invitation_type){abort(422);}

        $success['token'] =  $user->createToken('MyApp')->accessToken;
        $success['name'] =  $user->name;
        $success['id'] = $user->id;
        return response()->success($success);
    }

    protected function reset(array $data) // TODO:这里需要修改
    {
        // TODO: 这里需要使用forcefill，否则password不会改变。见Eloquent fillable说明。
        // TODO：不应该使用updateorcreate，修改密码的这种情况下如果找不到就创建user，这不符合逻辑...需要从上一步传递User和UserInfo模型，如果不能找到，进行报错。
        // TODO: email verified field 转移到UserInfo里，需要找到并修改。
        // TODO: 如果是未激活的用户，通过邮箱重置密码则自动激活
        // TODO: 为防盗号卖号，注册第一天的用户不允许重置密码
        // TODO: 为了便于未来核查账户安全，完成重置密码之后，需要在HistoricalPasswordReset模型里留下对应的记录，记录中需包括旧密码的值
        $user = User::updateOrCreate(
            ['email'=>$data['email']],
            ['password' => bcrypt($data['password']), 'email_verified_at' => Carbon::now(),'remember_token' => str_random(60)]);
        return $user;

        // TODO 下面这部分代码是从当前上线的程序搬过来的，还需要根据目前的需求改写，供参考
        // \App\Models\HistoricalPasswordReset::create([
        //     'user_id' => $user->id,
        //     'ip_address' => request()->ip(),
        //     'old_password' => $user->password,
        // ]);
        // $user->forceFill([
        //     'password' => bcrypt($password),
        //     'remember_token' => str_random(60),
        //     'activated' => true,
        // ])->save();
        // $info = $user->info;
        // $info->activation_token=null;
        // $info->email_verified_at = Carbon::now();
        // $info->save;
        //
        // $this->guard()->login($user);
    }

    public function login(){
        if(Auth::attempt(['email' => request('email'), 'password' => request('password')])){
            $user = Auth::user();
            $success['token'] =  $user->createToken('MyApp')->accessToken;
            $success['name'] =  $user->name;
            $success['id'] = $user->id;
            return response()->success($success);
        }
        else{
            return response()->error(config('error.401'), 401);
        }
    }

    public function logout(){
        // TODO: deactivate current token
    }

    public function reset_via_email(Request $request)
    {

        $password = $request->password;
        $data = $request->all();
        $this->validate($request, [
            'password' => 'required|string|min:10|max:32|confirmed|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{6,}$/',
        ]);
        $token=hash::make($request->token);
        $token_check = DB::table('password_resets')->where('email',$request->email)->first();
        if(!hash::check($request->token,$token_check->token))
            abort(404,$token);
            //token不存在
        if ($token_check&&$token_check->created_at<Carbon::now()->subMinutes(30)){
            abort(444);
          //  token过期
        }
        $user=$this->reset($data);

        Auth::guard()->login($user);
        return response()->success('200');
        // TODO：在更新密码之后，安全上需要取消和登出这个账户名下所有往期的token（方法参考NoLogControl里的内容），然后采取新token登入，在这里返回新token

    }
    public function reset_via_password(Request $request)
    {

        // TODO 在登陆情况下，用户可以凭借旧密码验证自己的身份，将旧密码更换成新密码
        // TODO 更新密码之后，在HistoricalPasswordReset留下记录
        // TODO 更新密码后，原先的token全失活
        // TODO 更新密码后，向邮箱发送密码已修改的提醒邮件
        // TODO 如果新旧密码重复，提醒用户conflict contents
    }
}
