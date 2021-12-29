const express = require('express');
// will use this later to send requests
const http = require('http');
// import env variables
require('dotenv').config();

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	res.status(200).send('Server is working.')
})

app.post('/getmovie', (req, res) => {
	const movieToSearch =
		req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.movie
			? req.body.queryResult.parameters.movie
			: '';
    console.log(req.body);        

	const reqUrl = encodeURI(
        `http://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=${movieToSearch}`
	);
    console.log(reqUrl);
	http.get(
		reqUrl,
		responseFromAPI => {
            console.log(responseFromAPI.status);
			let completeResponse = ''
			responseFromAPI.on('data', chunk => {
				completeResponse += chunk
			})
			responseFromAPI.on('end', () => {
				const response = JSON.parse(completeResponse);
                const movie = response.results[0]

				let dataToSend = movieToSearch;
				dataToSend = `${movie.title} was released in the year ${movie.release_date}.
                Here some glimpse of the plot: ${movie.overview}.
                }`

				return res.json({
					fulfillmentText: dataToSend,
					source: 'getmovie'
				})
			})
		},
		error => {
			return res.json({
				fulfillmentText: 'Could not get results at this time',
				source: 'getmovie'
			})
		}
	)
})

app.listen(port, () => {
	console.log(`🌏 Server is running at http://localhost:${port}`)
})