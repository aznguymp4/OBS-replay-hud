// YouTube API video uploader using JavaScript/Node.js
// You can find the full visual guide at: https://www.youtube.com/watch?v=gncPwSEzq1s
// You can find the brief written guide at: https://quanticdev.com/articles/automating-my-youtube-uploads-using-nodejs
//
// Upload code is adapted from: https://developers.google.com/youtube/v3/quickstart/nodejs

const fs = require('fs');
const readline = require('readline');
const assert = require('assert')
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// video category IDs for YouTube:
const categoryIds = {
	Gaming: 20
}

// If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = './' + 'client_oauth_token.json';

// const videoFilePath = '../vid.mp4'
// const thumbFilePath = '../thumb.png'

exports.uploadVideo = (title, description, tags, videoFilePath) => {
	// assert(fs.existsSync(videoFilePath))
	// assert(fs.existsSync(thumbFilePath))

	// Load client secrets from a local file.
	return new Promise((res,rej) => {
		fs.readFile('./client_secret.json', function processClientSecrets(err, content) {
			if (err) {
				console.log('Error loading client secret file: ' + err);
				rej(err)
				return;
			}
			// Authorize a client with the loaded credentials, then call the YouTube API.
			authorize(JSON.parse(content), (auth) => {
				uploadVideo(auth, title, description, tags, videoFilePath)
				.then(res)
				.catch(rej)
			});
		});
	})
}

/**
 * Upload the video file.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function uploadVideo(auth, title, description, tags, videoFilePath) {
	const service = google.youtube('v3')

	return new Promise((res,rej) => {
		service.videos.insert({
			auth,
			part: 'snippet,status',
			requestBody: {
				snippet: {
					title,
					description,
					tags,
					categoryId: categoryIds.Gaming,
					defaultLanguage: 'en',
					defaultAudioLanguage: 'en'
				},
				status: { privacyStatus: 'unlisted' },
			},
			media: {
				body: fs.createReadStream(videoFilePath),
			},
		}, function(err, response) {
			if (err) {
				console.error('The API returned an error: ' + err);
				return rej(err);
			}
			console.log(response.data)
			console.log('Video uploaded.')
			return res(response.data)
	
			// console.log('Uploading the thumbnail now.')
			// service.thumbnails.set({
			// 	auth: auth,
			// 	videoId: response.data.id,
			// 	media: {
			// 		body: fs.createReadStream(thumbFilePath)
			// 	},
			// }, function(err, response) {
			// 	if (err) {
			// 		console.log('The API returned an error: ' + err);
			// 		return;
			// 	}
			// 	console.log(response.data)
			// })
		})
	})
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	const clientSecret = credentials.installed.client_secret;
	const clientId = credentials.installed.client_id;
	const redirectUrl = credentials.installed.redirect_uris[0];
	const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function(err, token) {
		if (err) {
			getNewToken(oauth2Client, callback);
		} else {
			const json = JSON.parse(token)
			oauth2Client.credentials = json;
			if(Date.now() > json.expiry_date) {
				console.log('Access Token expired...refreshing!')
				oauth2Client.refreshAccessToken().then(newToken => {
					storeToken(newToken.credentials)
					callback(oauth2Client)
				})
			} else callback(oauth2Client);
		}
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	});
	console.log('Authorize this app by visiting this url: ', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question('Enter the code from that page here: ', function(code) {
		rl.close();
		oauth2Client.getToken(decodeURIComponent(code), function(err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			callback(oauth2Client);
		});
	});
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
	console.log(token)
	fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
		if (err) throw err;
		console.log('Token stored to ' + TOKEN_PATH);
	});
}