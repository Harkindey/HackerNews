'use strict';

const newsContainer = document.querySelector('#news');
const getTopNewsQuery = () =>
	`query {
        hn{
          topStories(limit: 30){
            id
            type
            by {
              id
            }
            time
            timeISO
            url
            score
            title
            parent {
              id
            }
            descendants
          }
        }
      }`;

const getTopNews = ev => {
	ev.preventDefault();
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: getTopNewsQuery(),
		}),
	};
	//The endpoint as a CORS (Cross-Origin Resource Sharing) problem
	fetch(`https://www.graphqlhub.com/playground`, options)
		.then(res => res)
		.then(res => console.log(res));
};

/* The below is me working with an API with no CORS issues,
 I found this (https://github.com/HackerNews/API) when I was looking
for solution to the Graphlql endpoint issue. The data returned are different,
but it helps with displaying some Hacker News content
*/
let endPoint = 'https://hacker-news.firebaseio.com/v0';
let options = {
	method: 'GET',
	headers: {
		Accept: 'application/json',
	},
};

function itemRef(id) {
	return fetch(endPoint + '/item/' + id + '.json', options);
}

function itemRefJSON(id) {
	return itemRef(id).then(function(response) {
		return response.json();
	});
}

function fetchItems(ids, cb) {
	var items = [];
	var promises = [];
	ids.forEach(function(id) {
		promises.push(itemRefJSON(id));
	});
	Promise.all(promises).then(function(values) {
		items = values;
		if (items.length >= ids.length) {
			cb(items);
		}
	});
}

const getTopStoriesID = ev => {
	ev.preventDefault();
	fetch(`${endPoint}/topstories.json`, options)
		.then(res => res.json())
		.then(res => {
			fetchItems(res.splice(0, 30), renderNews);
		});
};

const getLocation = function(href) {
	var l = document.createElement('a');
	l.href = href;
	return l;
};

const renderNews = items => {
	items.forEach((v, i) => {
		let author = v.by,
			comments = v.kids ? v.kids.length : 0,
			points = v.score,
			title = v.title,
			url = getLocation(v.url).hostname,
			time = v.time * 1000;

		const newsItem = document.createElement('div');
		newsItem.className = 'news__item flex-row';
		//News Rank
		const newsRank = document.createElement('div');
		newsRank.setAttribute('id', `newsRank_${i}`);
		newsRank.innerHTML = `
    <span class="news__rank">${i + 1}.</span>
    `;

		//News Vote
		const newsVote = document.createElement('div');
		newsVote.setAttribute('id', `newsVote_${i}`);
		newsVote.innerHTML = `
      <a href="#">
          <div class="votearrow"></div>
      </a>
    `;

		//News Content
		const newsContent = document.createElement('div');
		newsContent.setAttribute('id', `newsContent_${i}`);

		// Title
		const newsTitle = document.createElement('div');
		newsTitle.className = 'news__title';
		newsTitle.innerHTML = `
      <p>${title} <span class="news__source"> (<a href="#"><span class="news__source-site">${url}</span></a>)</span></p>
    `;
		// Subtext
		const newsSubtext = document.createElement('div');
		newsSubtext.className = 'news__subtext';
		newsSubtext.innerHTML = `
          <span class="score">${points} points</span>
          by
          <a href="#">${author}</a>
          <span class="news__age">${timeago.format(time)}</span>
          <span></span> |
          <a href="#">hide</a> |
          <a href="#">${comments} comments</a>
      `;

		newsContent.appendChild(newsTitle);
		newsContent.appendChild(newsSubtext);

		newsItem.appendChild(newsRank);
		newsItem.appendChild(newsVote);
		newsItem.appendChild(newsContent);

		newsContainer.appendChild(newsItem);
	});
};

document.addEventListener('DOMContentLoaded', getTopStoriesID);
