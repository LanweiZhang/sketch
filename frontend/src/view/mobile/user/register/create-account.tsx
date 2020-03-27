import * as React from 'react';
import { Card } from '../../../components/common/card';
import { Account } from './register';
import { Checkbox } from '../../../components/common/input/checkbox';

interface Props {
  email:string;
  changeAccount:(account:Account) => () => void;
}

interface State {
  username:string;
  password:string;
  passwordConfirm:string;
  declarationOfGoodFish:string; // XD
  check1:boolean;
  check2:boolean;
  check3:boolean;
}
type checkBoxes = 'check1' | 'check2' | 'check3';
const declaration = '我保证在废文好好做鱼看版规帮助不扒马不骂人不盗文';
export class CreateAccount extends React.Component<Props, State> {
  public state:State = {
    username:'',
    password:'',
    passwordConfirm:'',
    declarationOfGoodFish:'',
    check1:false,
    check2:false,
    check3:false,
  };

  private setStateAndCheckReady<Key extends keyof State> (key:keyof State, value:State[Key]) {
    this.setState({[key]:value} as any);
    // TODO: check ready
  }

  private renderCheckBox(key:checkBoxes, label:string) {
    return (
      <Checkbox
        className="checkbox"
        value={key}
        checked={this.state[key]}
        onChange={() => this.setStateAndCheckReady(key, !this.state[key])}
        label={label} />);
  }

  public headQuote = (
    <p>丧病之家，你的精神墓园<br/>
      比欲哭无泪更加down，不抑郁不要钱<br/>
      本站禁抄袭，禁人身攻击，禁人肉，禁恋童<br/>
      请不要发布侵犯他人版权的文字<br/>
      请确保你已年满十八岁<br/>
      祝你玩得愉快
    </p>
  );

  public render () {
    const { email } = this.props;
    const { password, username, passwordConfirm, declarationOfGoodFish, check1, check2, check3 } = this.state;
    return (
      <Card className="reg">
        { this.headQuote }

        <div className="creat-account-input">
          <p>用户名</p>
          <div className="input-text">
            <input type="text"
              minLength={2}
              maxLength={8}
              value={username}
              onChange={(e) => this.setStateAndCheckReady('username',   e.target.value) }
              placeholder="注册后暂时无法更改"></input>
          </div>
        </div>

        <div className="creat-account-input">
          <p>密码</p>
          <div className="input-text">
            <input type="text"
              minLength={10}
              maxLength={32}
              value={password}
              onChange={(e) => this.setStateAndCheckReady('password',   e.target.value) }
              placeholder="至少10位密码"></input>
          </div>
          <p className="note"><small>{`(需包含至少一个大写字母，至少一个小写字母，至少一个数字，至少一个特殊字符。常用特殊字符：#?!@$%^&*-_)`}</small></p>
        </div>

        <div className="creat-account-input">
          <p>确认密码</p>
          <div className="input-text">
            <input type="text"
              minLength={10}
              maxLength={32}
              value={passwordConfirm}
              onChange={(e) => this.setStateAndCheckReady ('passwordConfirm', e.target.value) }
              placeholder="请重复输入密码"></input>
          </div>
        </div>

        <div className="creat-account-input">
          <p>注册担保（请手动输入下面一句话）</p>
          <p className="note">{ declaration }</p>
          <div className="input-text">
            <input type="text"
              minLength={declaration.length}
              maxLength={declaration.length}
              value={declarationOfGoodFish}
              onChange={(e) => this.setStateAndCheckReady ('declarationOfGoodFish', e.target.value) }
              placeholder="请输入注册担保"></input>
          </div>
        </div>

        <div className="checkboxes">
          { this.renderCheckBox('check1', '我知道可以左上角搜索关键词获取使用帮助') }
          { this.renderCheckBox('check2', '我已阅读《版规》中约定的社区公约，同意遵守版规') }
          { this.renderCheckBox('check3', '保证自己年满十八周岁，神智健全清醒，承诺为自己的言行负责。') }
        </div>

        <p><small>友情提示：本页面含有IP访问频率限制，为了你的正常注册，注册时请不要刷新或倒退网页。</small></p>
    </Card>
    );
   }
}