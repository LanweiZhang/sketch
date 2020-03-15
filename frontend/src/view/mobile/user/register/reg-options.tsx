import * as React from 'react';
import { Card } from '../../../components/common/card';
import { RegistrationOption } from './register';

export function RegOptions (props:{
  className?:string;
  regOption:RegistrationOption;
  changeRegOption:(o:RegistrationOption) => () => void;
}) {
  return (
    <Card className="reg">
      {/* TODO: use h2 here, after h2 is defined in common.scss */}
      <p className="title">请选择一种注册方式</p>
      {/* 邀请码 */}
      <div className="reg-option">
        <div className="sub-title">
          <input type="radio" value="code"
            checked={props.regOption == 'code'}
            onChange={props.changeRegOption('code')} />
          <span>通过邀请码注册</span>
        </div>
        <p>获得邀请码的渠道:</p>
        <div className="option-info">
          <p>
            <b>【公共邀请码】通过废文网微博、微信公众号等渠道，获得公共邀请码（数量有限）</b><br/>
            微博、微信公众号会不定期开放少量公共邀请码，数量有限，先到先得。
          </p>
          <p>
            <b>【私人邀请码】通过已经注册废文的好友，获得私人邀请码</b><br/>
            资深废文用户，可以在“个人中心-邀请好友”处创建私人邀请码，分享给好友。
          </p>
        </div>
      </div>

      {/* 邀请码 */}
      <div className="reg-option">
        <div className="sub-title">
          <input type="radio" value="mail"
            checked={props.regOption == 'mail'}
            onChange={props.changeRegOption('mail')} />
          通过含邀请链接的邮件注册及进度查询（测试中）
        </div>
        <p>获得邀请码的渠道:</p>
        <div className="option-info">
          <p>
            <b>【活动邀请】参加网站活动获取注册邀请链接</b><br/>
            通过废文网微博、微信公众号等渠道参与限时活动，将有机会直接获得专属注册链接。
          </p>
          <p>
            <b>【问卷邀请】通过填写问卷的方式获取注册邀请链接</b><br/>
            提交邮箱、完成问卷，排队审核通过后将获得专属注册链接。
          </p>
        </div>
      </div>
    </Card>);
}