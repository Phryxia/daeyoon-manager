import React from 'react';
import ReactDOM from 'react-dom';
import Utility from './utility';
import axios from 'axios';
import css from '../index.css';

let url = '';

// Todo: DB에서 출석 받아오기

/*
	attendance의 출석 날짜를 계산하여
	fromDate ~ toDate의 출석 여부를 O X로 반환한다.
*/
function generateOX(fromDate, toDate, responses) {
	let range = Utility.generateDates(fromDate, toDate);
	return range.map(r => {
		for (let pair of responses) {
			// 만약 r에 권세규의 출석 정보가 담겨있으면
			if (Utility.dateEqual(new Date(pair[0]), r))
				return pair;
			// 키 값을 만들어내야 하기 때문에 날짜도 반환한다
		}
		return [r, ''];
	});
}

/*
	출석부에서 한 행을 담당한다.

	이름 O X O X   ...
*/
function Attendance(props) {
	const name = props.attendance.name;
	const resp = props.attendance.responses;

	return (
		<tr>
			<td>{name}</td>
			{
				generateOX(props.fromDate, props.toDate, resp)
					.map(pair => {
						return <td key={pair[0]}>{pair[1]}</td>;
					})
			}
		</tr>);
}

/*
	전체 앱을 담당한다.
*/
class App extends React.Component {
	constructor(props) {
		super(props);

		/*
			attendances의 예시

			[{
				name: '권세규',
				repsonses: [
					['2020-05-26', 'O'],
					['2020-05-27', 'X']
				]
			}]
		*/
		this.state = {
			attendances: [],
			assignName: '',
			assignDate: new Date(),
			fromDate: Utility.proceed(new Date(), -7),
			toDate: Utility.proceed(new Date(), 7),
			ranking: []
		};

		// handler
		this.handleAssignName = this.handleAssignName.bind(this); 
		this.handleAssignDate = this.handleAssignDate.bind(this);
		this.handleAssignButton = this.handleAssignButton.bind(this);
		this.handleFromToChange = this.handleFromToChange.bind(this);
	}

	fetchAttendances() {
		axios.get('/attendance')
			.then((response) => {
				this.setState({
					attendances: response.data
				});
			});
	}

	fetchRanking() {
		axios.get('/ranking')
		.then((response) => {
			this.setState({
				ranking: response.data
			});
		});
	}

	/*
		컴포넌트가 처음 로드되었을 때 페이지를 불러온다.
	*/
	componentDidMount() {
		this.fetchAttendances();
		this.fetchRanking();
  }

	/*
		출석 등록 이름을 변경할 때 호출된다.
	*/
	handleAssignName(event) {
		this.setState({
			assignName: event.target.value
		});
	}

	/*
		출석 등록 날짜를 변경할 때 호출된다.
	*/
	handleAssignDate(event) {
		this.setState({
			assignDate: new Date(event.target.value)
		});
	}

	/*
		출석 & 결석 버튼을 누를 때 호출된다.
	*/
	handleAssignButton(event) {
		// protection
		if (this.state.assignName === '') {
			alert('이름을 입력해주세요.');
			return;
		}

		let attend = event.target.value === '출석';
		// AJAX로 날린다.
		axios.post('/attendance', {
			assignName: this.state.assignName,
			assignDate: Utility.yyyymmdd(this.state.assignDate),
			attendance: attend ? 'O' : 'X'
		})
		.then((response) => {
			// response에는 새로운 state.attendances를
			// 반환한다.
			this.fetchAttendances();
			this.fetchRanking();
		})
		.catch((err) => {
			// 에러처리
			alert('서버와 연결이 끊어졌습니다.');
			console.error(err);
		});
	}
	

	/*
		출석부 조회 범위를 변경할 때 호출된다.
	*/
	handleFromToChange(event) {
		// target.name은 fromDate 또는 toDate이다.
		const target = event.target;
		this.setState({
			[target.name]: new Date(target.value)
		});
	}

	/*
		렌더링 함수
	*/
	render() {
		const fromDate = this.state.fromDate;
		const toDate = this.state.toDate;
		
		// 출석표 헤더에 들어갈 내용
		let headers = ['이름'];
		const dates = Utility.generateDates(fromDate, toDate);
		headers = headers.concat(dates.map(dt => Utility.mmdd(dt)));

		// 랭킹표 관련
		const ranking = this.state.ranking;
		let rankTable = [];
		for (let i = 0; i < ranking.length; ++i) {
			if (i === 0) {
				rankTable.push([1, ranking[i].name, ranking[i].count]);
			}
			else if (ranking[i - 1].count === ranking[i].count) {
				rankTable.push([rankTable[i - 1][0], ranking[i].name, ranking[i].count]);
			}
			else {
				rankTable.push([i + 1, ranking[i].name, ranking[i].count]);
			}
		}
		rankTable = rankTable.map(rank => {
			return (
				<tr key={rank[0]+rank[1]}>
					<td>{rank[0]}</td>
					<td>{rank[1]}</td>
					<td>{rank[2]}</td>
				</tr>);
		});

		return (
			<div className='master'>
				{/* 출석 등록 */}
				<form>
					<fieldset>
						<legend>출석하기</legend>
						<div><label>이름 </label>
						<input type='text' onChange={this.handleAssignName}/>
						</div>
						<div>
						<label>날짜 </label>
						{/* 날짜 Input 엘레먼트는 yyyy-mm-dd 형식을 사용한다. */}
						<input type='date'
							value={Utility.yyyymmdd(this.state.assignDate)}
							onChange={this.handleAssignDate}/>
						</div>
						<div className='buttons'>
						<input className='button' id='attend' type='button' 
							value='출석' 
							onClick={this.handleAssignButton}/>
						<input className='button' id='absent' type='button' 
							value='결석' 
							onClick={this.handleAssignButton}/>
						</div>
					</fieldset>
				</form>

				{/* 랭킹표 */}
				<fieldset>
				<legend>랭킹</legend>
				<table id='ranking'>
					<thead>
						<tr>
							<th>순위</th>
							<th>이름</th>
							<th>횟수</th>
						</tr>
					</thead>
					<tbody>
						{rankTable}
					</tbody>
				</table>
				</fieldset>

				{/* 출석부 조회 기간 */}
				<fieldset>
				<legend>
				<input name='fromDate' 
					type='date' 
					value={Utility.yyyymmdd(fromDate)} 
					onChange={this.handleFromToChange} />~
				<input name='toDate' 
					type='date' 
					value={Utility.yyyymmdd(toDate)} 
					onChange={this.handleFromToChange} />
				</legend>

				{/* 출석부 표 */}
				<table>
					<thead>
						<tr>
							{
								headers.map(str => <th key={str}>{str}</th>)
							}
						</tr>
					</thead>
					<tbody>
						{
							this.state.attendances.map(at => {
								return (
									<Attendance key={at.name}
										attendance={at} 
										fromDate={fromDate} 
										toDate={toDate} />
									);
							})
						}
					</tbody>
				</table>
				</fieldset>

			</div>);
	}


}

const element = (
	<App />
	);

ReactDOM.render(element, document.getElementById("root"));