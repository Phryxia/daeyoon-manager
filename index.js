const express = require('express');
const { Client } = require('pg');

/*
	Express Init
*/
const app = express();
const port = 4577;

/*
	PG Init
*/
const client = new Client({
	user: 'postgres',
	database: 'daeyoon',
	port: 5432
});
client.connect();

app.use(express.static('dist'));
app.use(express.json());

app.get('/attendance', (req, res) => {
	const query = `SELECT name, date, attendance 
		FROM daeyoon 
		ORDER BY name`;
	client.query(query)
		.then(dbres => {
			let out = [];
			let cnt = 0;
			for (let i = 0; i < dbres.rows.length; ++i) {
				// 새 이름이 나온 경우
				if (i === 0 || out[out.length - 1].name !== dbres.rows[i].name) {
					out.push({
						name: dbres.rows[i].name,
						responses: []
					});
				}

				out[out.length - 1].responses.push([
					dbres.rows[i].date, 
					dbres.rows[i].attendance
				]);
			}
			res.send(out);
		});
});

app.post('/attendance', (req, res) => {
	// 이름-날짜로 조회해서 없으면 등록
	// 있으면 수정
	const assignName = req.body.assignName;
	const assignDate = req.body.assignDate;
	const attendance = req.body.attendance;
	const query = 
		`SELECT *
		FROM daeyoon 
		WHERE name=$1 AND date=$2`;

	client.query(query, [assignName, assignDate])
		.then(dbres => {
			if (dbres.rows.length === 0) {
				// 해당 날짜에 출석 이력이 없는 경우
				const iquery = 
					`INSERT INTO daeyoon(name, date, attendance)
					VALUES($1, $2, $3)`

				client.query(iquery, [assignName, assignDate, attendance])
					.then(dbres => {
						console.log('[LOG] app.post: INSERT Success');
					})
					.catch(e => {
						console.log('[ERROR] app.post: INSERT Error');
						console.log(e.stack);
					})
					.then(() => {
						res.end();
					});
			}
			else {
				// 해당 날짜에 출석 이력이 있는 경우
				const iquery = 
					`UPDATE daeyoon SET
					(name, date, attendance) = ($1, $2, $3)
					WHERE name = $1 AND date = $2`;

				client.query(iquery, [assignName, assignDate, attendance])
					.then(dbres => {
						console.log('[LOG] app.post: UPDATE Success');
					})
					.catch(e => {
						console.log('[ERROR] app.post: UPDATE Error');
						console.log(e.stack);
					})
					.then(() => {
						res.end();
					});
			}
		})
		.catch(e => {
			console.log('[ERROR] app.post: SELECT Error');
			console.log(e.stack);
		})
		.then(() => {
			res.end();
		});
});

/*
	누가누가 머윤을 많이 먹었는지 랭킹을 매겨서 순서대로 출력한다.
*/
app.get('/ranking', (req, res) => {
	const query = `SELECT daeyoon.name, COUNT(*)
		FROM daeyoon
		WHERE daeyoon.attendance='O'
		GROUP BY daeyoon.name
		ORDER BY COUNT(*) DESC`;
	client.query(query)
		.then(dbres => {
			res.send(dbres.rows);
		})
		.catch(e => {
			console.log('[ERROR] app.get.ranking: SELECT ERROR');
			console.log(e.stack());
			res.end();
		});
});

app.listen(port, () => {
	console.log('Listening on ' + port);
});