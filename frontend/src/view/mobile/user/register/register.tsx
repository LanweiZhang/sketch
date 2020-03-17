import * as React from 'react';
import { API, ResData, ReqData } from '../../../../config/api';
import { MobileRouteProps } from '../../router';
import { Page } from '../../../components/common/page';
import { NavBar } from '../../../components/common/navbar';
import { List } from '../../../components/common/list';
import { RoutePath } from '../../../../config/route-path';
import { Menu, MenuItem } from '../../../components/common/menu';
import { PreRegInfo } from './pre-reg-info';
import '../../message/style.scss';  // TODO: extract common css
import './style.scss';
import { RegOptions } from './reg-options';
import { RegMail1 } from './reg-mail1';
import { RegMail2 } from './reg-mail2';
import { RegMail3 } from './reg-mail3';
import { RegisterByInvitationEmail, registrationApplication } from './sampleData';
import { RegMail4 } from './reg-mail4';
import { Popup } from '../../../components/common/popup';
import { RegMail4Confirm } from './reg-mail4-confirm';
import { RegMailInfo } from './reg-mail-info';
import { RegMailProgress } from './reg-mail-progress';
import { RegCode } from './reg-code';
import { CreateAccount } from './create-account';

const regMailTokenLength = 10;
const essayMinLength = 500;

export type QuizAnswer = {[key:number]:number};
export type Account = {
  username:string;
  password:string;
};
interface State {
  registrationOption:RegistrationOption;
  email:string;
  registrationStatus:ResData.RegistrationApplication;
  quiz:ResData.QuizQuestion[];
  quizAnswer:QuizAnswer;
  regMailToken:string;
  regCode:string;
  essay:ResData.Essay;
  essayAnswer:string;
  account:Account;
  step:Step;
  showPopup:boolean;
}

export type RegistrationOption = 'code' | 'mail';

// we put all registration pages in one component,
// and use internal component state to navigate between steps, instead of providing urls for different steps
// thus we can make sure user cannot skip any steps
// and attackers cannot get to final registration page without clicking through all the previous steps
// if user refreshes page, he just has start from the very beginning
export type Step = 'info' | 'choose-reg-option' | 'reg-mail-1' |
  'reg-mail-2' | 'reg-mail-3' | 'reg-mail-4' | 'reg-mail-info' |
  'reg-mail-progress' | 'reg-code' | 'create-account';

const quiz = RegisterByInvitationEmail.data.quizzes as ResData.QuizQuestion[];

export class Register extends React.Component<MobileRouteProps, State> {
  public state:State = {
    // internal state
    registrationOption: 'code',
    email: '',
    registrationStatus: ResData.allocRegistrationApplication(),
    quiz: [],
    quizAnswer:{},      // reg-mail2
    regMailToken: '',   // reg-mail3
    regCode: '',
    essay: ResData.allocEssay(),
    essayAnswer: '',
    account:{
      username: '',
      password: '',
    },
    step: 'info',
    showPopup:false,
  };

  public async componentDidMount() {
  }

  // QUESTION: 像这个情况,type该怎么写呢..
  public updateState = (key:keyof State) => (value:any) => () => {
    this.setState({
      [key]: value,
    } as any);
  }

  public nextStep = async () => {
    const { registerByInvitationEmailSubmitEmail } = this.props.core.db;
    const { registrationOption, step, email, registrationStatus, quiz, essay } = this.state;
    switch (step) {
      case 'info':
        this.setState({ step: 'choose-reg-option' });
        break;
      case 'choose-reg-option': {
        this.setState({ step:
          registrationOption == 'code' ? 'reg-code' : 'reg-mail-1' });
        break;
      }
      case 'reg-mail-1': {
        try {
          const res = await registerByInvitationEmailSubmitEmail(email);
          const newState = {
            registrationStatus: res.registration_application,
            quiz,
            essay,
            step: step as Step,
          };
          if (res.quizzes) { newState.quiz = res.quizzes; }
          if (res.essay) { newState.essay = res.essay; }

          const { has_quizzed, email_verified_at, submitted_at } = res.registration_application.attributes;
          if (!has_quizzed) {
            // user has not finish quiz, redirect user to take quiz
            newState.step = 'reg-mail-2';
          } else if (!email_verified_at) {
            // user has finished quiz, but has not verify email
            // redirect user to verify email
            newState.step = 'reg-mail-3';
          } else if (!submitted_at) {
            // user has finished quiz and verified email, but has not submit essay
            // redirect user to submit essay
            newState.step = 'reg-mail-4';
          } else {
            // everything is done! redirect user to check application progress page
            newState.step = 'reg-mail-progress';
          }
          this.setState(newState);
        } catch (e) {
          console.log(e);
        }
        break;
      }
        // TODO: serverl branches here
      case 'reg-mail-2':
        // TODO: submit quiz
        this.setState({ step: 'reg-mail-3' });
        break;
      case 'reg-mail-3':
        this.setState({ step: 'reg-mail-4' });
        console.log(222);
        break;
      case 'reg-mail-4':
        console.log(1);
        break;
      case 'reg-mail-info':
        break;
      case 'reg-mail-progress':
        break;
      case 'reg-code': {
        // TODO: submit invitation code (waiting for api)
        alert('邀请码注册api还没好,之后注册肯定会失败哈');
        this.setState({ step: 'create-account' });
        break;
      }
      case 'create-account':
        break;
    }
  }
  // 通过邮件注册的详细步骤
  private getMenuButton() {
    const { registrationOption, step, email } = this.state;
    switch (step) {
      case 'info':
      case 'choose-reg-option':
        return <span>下一步</span>;
      case 'reg-mail-1':
      case 'reg-mail-2':
        return <span>提交</span>;
      case 'reg-mail-3':
      case 'reg-mail-info':
        return <span>确认</span>;
      case 'reg-mail-4':
      case 'reg-code':
      case 'create-account':
        return <span>提交</span>;
      case 'reg-mail-progress':
        return '';
    }
  }

  private getMenuButtonIsInvalid() {
    const { registrationOption, step, email, quizAnswer, regMailToken, essayAnswer, regCode } = this.state;
    if (step == 'reg-mail-1' && !email) {
      // TODO: check if email valid
      return true;
    }
    if (step == 'reg-mail-2') {
      if (!email) { return true; }
      if (Object.keys(quizAnswer).length != quiz.length) { return true; }
    }
    if (step == 'reg-mail-3' &&
      regMailToken.length != regMailTokenLength) {
        return true;
    }
    if (step == 'reg-mail-4' && essayAnswer.length < essayMinLength) {
      return true;
    }
    if (step == 'reg-mail-progress') { return true; }
    if (step == 'reg-code' && !regCode) { return true; }
    if (step == 'create-account') {
      // TODO: a lot checks
      return true;
    }
    return false;
  }

  private getMenuTitle() {
    const { registrationOption, step } = this.state;
    switch (step) {
      case 'info':
      case 'choose-reg-option':
        return '注册';
      case 'reg-mail-1':
      case 'reg-mail-2':
      case 'reg-mail-3':
      case 'reg-mail-4':
        return '通过邮件注册';
      case 'reg-mail-info':
        return '通过邮件注册的详细步骤';
      case 'reg-mail-progress':
        return '查询注册申请进度';
      case 'reg-code':
        return '通过邀请码注册';
      case 'create-account':
        return '填写注册信息';
    }
  }

  private getPageContent() {
    const { registrationOption, step, email, quizAnswer, essayAnswer, regMailToken, regCode } = this.state;
    switch (step) {
      case 'info':
        return <PreRegInfo />;
      case 'choose-reg-option':
        return (
          <RegOptions
            regOption={this.state.registrationOption}
            changeRegOption={this.updateState('registrationOption')} />);
      case 'reg-mail-1':
        return (
          <RegMail1
            email={email}
            changeMailAddress={this.updateState('email')}/>);
      case 'reg-mail-2':
        return (
          <RegMail2
            email={email}
            quizAnswer={quizAnswer}
            changeQuizAnswer={this.updateState('quizAnswer')}
          />
        );
      case 'reg-mail-3':
        return (
          <RegMail3
            regMailToken={regMailToken}
            changeRegMailToken={this.updateState('regMailToken')}
            email={email}/>
        );
      case 'reg-mail-4':
        return (
          <RegMail4
            email={email}
            essayAnswer={essayAnswer}
            changeEssayAnswer={this.updateState('essayAnswer')}/>
        );
      case 'reg-mail-info':
        return <RegMailInfo />;
      case 'reg-mail-progress':
        return <RegMailProgress email={email}/>;
      case 'reg-code':
        return (
          <RegCode
            regCode={regCode}
            changeRegCode={this.updateState('regCode')}/>);
      case 'create-account':
        return (
          <CreateAccount
            email={email}
            changeAccount={this.updateState('account')}/>
        );
    }
  }

  public render () {
    return (<Page
        top={<NavBar
          goBack={this.props.core.route.back}
          onMenuClick={this.nextStep}
          menuButton={this.getMenuButton()}
          buttonInvalid={this.getMenuButtonIsInvalid()}>
          {this.getMenuTitle()}
        </NavBar>}>
        {/* <RegMail4
            email={this.state.email}
            essayAnswer={this.state.essayAnswer}
            changeEssayAnswer={this.updateState('essayAnswer')}/> */}

            {this.getPageContent()}
            {/* <RegCode
            regCode={this.state.regCode}
            changeRegCode={this.updateState('regCode')}/> */}
            {this.state.showPopup && <Popup
              className="reg"
              onClose={() => {}}>
              <RegMail4Confirm onClick={() => console.log(1)}/>
            </Popup>}
      </Page>);
  }
}