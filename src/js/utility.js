class Utility {
	/*
		digit자리가 될 때까지 0을 채운다.
	*/
	static zeropad(numb, digit) {
		numb = numb.toString();
		while (numb.length < digit) {
			numb = '0' + numb;
		}
		return numb;
	}

	/*
		javascript date를 yyyy-mm-dd 형식의 string으로 바꾼다.
	*/
	static yyyymmdd(date) {
		const y = date.getFullYear();
		const m = Utility.zeropad(date.getMonth() + 1, 2);
		const d = Utility.zeropad(date.getDate(), 2);
		return `${y}-${m}-${d}`;
	}

	/*
		javascript date를 mm-dd 형식의 string으로 바꾼다.
	*/
	static mmdd(date) {
		const m = Utility.zeropad(date.getMonth() + 1, 2);
		const d = Utility.zeropad(date.getDate(), 2);
		return `${m}-${d}`;
	}

	/*
		두 시각의 날짜가 같은지 비교한다.
	*/
	static dateEqual(d1, d2) {
		return d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate();
	}

	/*
		date에 addDay일을 더한 Date를 출력한다.
		addDay는 임의의 정수이다.
	*/
	static proceed(date, addDay) {
		return new Date(date.getFullYear(), 
			date.getMonth(),
			date.getDate() + addDay);
	}

	/*
		fromDate ~ toDate까지의 날짜를 만들어냅니다.
	*/
	static generateDates(fromDate, toDate) {
		let out = [];
		let dt = fromDate;
		while (toDate - dt >= 0) {
			out.push(dt);
			dt = Utility.proceed(dt, 1);
		}
		return out;
	}
}

module.exports = Utility;