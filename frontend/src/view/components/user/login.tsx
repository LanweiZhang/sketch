import * as React from 'react';
import { Link } from 'react-router-dom';
import { validEmail } from '../../../utils/validates';
import { Card } from '../common/card';
import { NoticeBar } from '../common/notice-bar';
// FIXME: internal server error will be treated as incorrect password 
interface Props {
  login:(email:string, pwd:string) => Promise<boolean>;
}
interface State {
  email:string;
  password:string;
  errMsg:string;
}

export class Login extends React.Component<Props, State> {
  public state = {
    email: '',
    password: '',
    errMsg: '',
  };

  public render () {
    return <Card>
      <div className="card-header" style={{boxShadow: 'none'}}><h1 className="title">登录</h1></div>
        <div className="card-content">

        { this.state.errMsg && <NoticeBar>{this.state.errMsg}</NoticeBar> }

        邮箱:
        <input className="input is-normal"
          type="email"
          value={this.state.email}
          onChange={(ev) => this.setState({email:ev.target.value})} />

        <br />

        密码:
        <input
          className="input is-normal"
          type="password"
          value={this.state.password}
          onChange={(ev) => this.setState({password:ev.target.value})} />

        <div style={{
          marginTop: '1vh',
          textAlign: 'justify',
        }}>
          <label className="checkbox"><input type="checkbox" />记住我</label>
          <Link to="reset_password"
            style={{
            color: 'grey',
            float: 'right',
            fontSize: 'smaller',
          }}>忘记密码/重新激活</Link>
        </div>

        <a className="button is-fullwidth" onClick={async (ev) => {
          if (this.state.email === '') {
            this.setState({errMsg: '邮箱 不能为空。'});
          } else if (this.state.password === '') {
            this.setState({errMsg: '密码 不能为空。'});
          } else if (!validEmail(this.state.email)) {
            this.setState({errMsg: '邮箱格式不符'});
          } else {
            try {
              await this.props.login(this.state.email, this.state.password);
            } catch (e) {
              this.setState({errMsg: '用户名或密码错误。'});
            }
          }
        }}>登录</a>
      </div>
      <div className="card-footer">
        <span>还没账号?&#160;&#160;</span><Link to="/register">现在注册</Link>!
      </div>
    </Card>;
  }
}