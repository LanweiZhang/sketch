import * as React from 'react';
import { Card } from '../../../components/common/card';
import { RegisterByInvitationEmail } from './sampleData';
import { ResData } from '../../../../config/api';
import { QuizAnswer } from './register';

interface Props {
  email:string;
  quizAnswer:QuizAnswer;
  changeQuizAnswer:(qa:QuizAnswer) => () => void;
}

interface State {
}
const quiz = RegisterByInvitationEmail.data.quizzes as ResData.QuizQuestion[];

// TODO: customize radio button
// https://www.w3schools.com/howto/howto_css_custom_checkbox.asp

// TODO: refactor out quiz component, so 升级题 can reuse, 升级题 may have mutliple choices questions

export class RegMail2 extends React.Component<Props, State> {

  private handleOptionChange = (e) => {
    const optionValue = e.target.value;
    // TODO: support multiple choice
    const quizAnswer = {
      ...this.props.quizAnswer,
      [Number(e.target.name)]:optionValue };
    this.props.changeQuizAnswer(quizAnswer)();
  }

  private renderQuizQuestion(question:ResData.QuizQuestion) {
    return (
      <div className="quiz-question" key={question.id}>
        <p>{ question.attributes.body }</p>
        { question.attributes.options.map((o) => (
          <div className="quiz-option" key={'' + o.id}>
            <input type="radio"
              name={'' + question.id}
              value={o.id}
              checked={this.props.quizAnswer[question.id] ?
                this.props.quizAnswer[question.id] == o.id : false }
              onChange={this.handleOptionChange}
              />
            <label>{o.attributes.body}</label>
          </div>
        ))}
      </div>
    );
  }
  public render () {
    console.log(quiz);
    return (
      <Card className="reg">
      {/* TODO: use h2 here, after h2 is defined in common.scss */}
      <p className="title">步骤二：回答问题（11题中只需答对7题）</p>
      <p className="small-warning">你正在使用 {this.props.email} 进行注册，如果邮箱有误，请勿继续！</p>
      <p>你好！欢迎你前来废文！因为当前排队人数较多，为了避免误入、囤号和机器批量注册，保证真正的申请者能够进入排队队列，请先回答下列问题哦!</p>

      <div id="quiz">
        { quiz.map((q) => this.renderQuizQuestion(q)) }
      </div>

      <p>为保证注册公平，避免机器恶意注册，页面含有防批量注册机制，五分钟只能回答一次问题，请核实后再提交回答，请勿直接“返回”前页面重新提交。</p>
    </Card>
    );
   }
}