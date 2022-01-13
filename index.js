const express = require('express');
// will use this later to send requests
const http = require('http');
const https = require('https');
// import env variables
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
	res.status(200).send('Server is working.')
});

app.post('/getmovie', (req, res) => {
	const movieToSearch =
		req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.movie
			? req.body.queryResult.parameters.movie
			: '';

	const reqUrl = encodeURI(
		`http://www.omdbapi.com/?t=${movieToSearch}&apikey=${process.env.API_KEY}`
	);
	http.get(
		reqUrl,
		responseFromAPI => {
			let completeResponse = ''
			responseFromAPI.on('data', chunk => {
				completeResponse += chunk
			})
			responseFromAPI.on('end', () => {
				const movie = JSON.parse(completeResponse);
                if (!movie || !movie.Title) {
                    return res.json({
                        fulfillmentText: 'Sorry, we could not find the movie you are asking for.',
                        source: 'getmovie'
                    });
                }

				let dataToSend = movieToSearch;
				dataToSend = `${movie.Title} was released in the year ${movie.Year}. It is directed by ${
					movie.Director
				} and stars ${movie.Actors}.\n Here some glimpse of the plot: ${movie.Plot}.`;

				return res.json({
					fulfillmentText: dataToSend,
					source: 'getmovie'
				});
			})
		},
		error => {
			return res.json({
				fulfillmentText: 'Could not get results at this time',
				source: 'getmovie'
			});
		}
	)
});

app.post('/getholiday', (req, res) => {
	const holidayToSearch =
		req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.holiday
			? req.body.queryResult.parameters.holiday
			: '';
	console.log(req.body);

	const reqUrl = encodeURI(`https://xn--riigiphad-v9a.ee/?output=json`);
	https.get(
		reqUrl,
		responseFromAPI => {
			let completeResponse = ''
			responseFromAPI.on('data', chunk => {
				completeResponse += chunk
			})
			responseFromAPI.on('end', () => {
				const holidays = JSON.parse(completeResponse);
				var holiday = holidays.find(x => x.title?.toLowerCase() === holidayToSearch?.toLowerCase());
                if (!holiday || !holiday.title) {
                    return res.json({
                        fulfillmentText: 'Sorry, we could not find the holiday you are asking for.',
                        source: 'getholiday'
                    });
                }

				dataToSend = `${holiday.title} is on ${holiday.date}.`;

				return res.json({
					fulfillmentText: dataToSend,
					source: 'getholiday'
				});
			})
		},
		error => {
			return res.json({
				fulfillmentText: 'Could not get results at this time',
				source: 'getholiday'
			});
		}
	)
})

app.listen(port, () => {
	console.log(`🌏 Server is running at http://localhost:${port}`);
});