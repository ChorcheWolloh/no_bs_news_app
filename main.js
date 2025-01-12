const API_KEY = ''; // needs free API Key for Development build
let firstPageArticles, secondPageArticles, thirdPageArticles;
let newsList = document.querySelector(".news-list");
let searchBtn = document.querySelector('#search-btn');
let dateInput = document.querySelector('#from-date');

limitDateInput(dateInput);

let articleHTML = (article) => {
    return `
                    <div class="news-body h-100 d-flex flex-column justify-content-around">
                        <h4 class="card-title">${article.title}</h4>
                        <p class="description card-text">${article.description}</p>
                        <a href="${article.url}" class="link-to-source card-link">Read More</a>
                    </div>
                    <div class="news-footer">
                        <div class="source">
                            <h6 class="author card-subtitle mb-2">${article.author}k</h6>
                            <h6 class="source card-subtitle mb-2">${article.source.name}</h6>
                        </div>
                        <div class="publish-date card-subtitle">${sliceDate(article.publishedAt)}</div>
                    </div>
                `;
}

function sliceDate(date){
    return date.slice(0,10);
}

function getMonthAgo(today){
    let monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    // Format it as YYYY-MM-DD
    monthAgo = monthAgo.toISOString().slice(0, 10);
    return monthAgo;
}

// limits input field by today and a month back
function limitDateInput(dateInput){
    let today = sliceDate(new Date().toISOString());
    let monthAgo =  getMonthAgo(new Date());
    dateInput.setAttribute('max', `${today}`);
    dateInput.setAttribute('min', `${monthAgo}`);
}

// returns user input
function getUserInput(){
    let topic = '';
    let dateFrom = ''; //2025-01-01
    topic = document.querySelector("#topic").value;
    dateFrom = dateInput.value;
    return { topic, dateFrom };
}

// populates the container with articles
function populateNewsList(articlesArr){
    let articlesHTML = '';
    for (let i = 0; i < articlesArr.length; i++) {
        //instead of adding each article individually a string is build with all of them and appended once
        articlesHTML += `<article class="news card card-body">${articleHTML(articlesArr[i])}</article>`;
    }
    newsList.innerHTML = articlesHTML;
}

// checks if article has [Removed] in the title and filters those out
function filterArticles(articlesArr){
    let filteredArticlesArr = []
    for (let i = 0; i < articlesArr.length; i++) {
        if(articlesArr[i].title === "[Removed]"){
            // go over to the next article
            continue;
        } else {
            filteredArticlesArr.push(articlesArr[i])
        }
    }
    return filteredArticlesArr;
}

function clearPosts(){
    while (newsList.firstChild) {
        newsList.removeChild(newsList.firstChild);
    }
}

// adds clearing to each pagination button and event listeners to populate another set of articles
function setupPagination() {
    let firstPageBtn = document.querySelector("#first-page");
    let secondPageBtn = document.querySelector("#second-page");
    let thirdPageBtn = document.querySelector("#third-page");
    firstPageBtn.addEventListener('click', () => {
        clearPosts();
        populateNewsList(firstPageArticles);
    });
    secondPageBtn.addEventListener('click', () => {
        clearPosts();
        console.log(secondPageArticles);
        populateNewsList(secondPageArticles);
    });
    thirdPageBtn.addEventListener('click', () => {
        clearPosts();
        populateNewsList(thirdPageArticles);
    });
}

function init(API_KEY, topic, dateFrom){
    let url = 'https://newsapi.org/v2/everything?' +
          `q=${topic}&` +
          `from=${dateFrom}&` +
          'sortBy=popularity&' +
          `apiKey=${API_KEY}`;
    let req = new Request(url);
    let newsPromise = fetch(req).then(response => response.json()).then((news) => {
        return news;
    });
    newsPromise.then((news) =>{
        let filteredNews = filterArticles(news.articles);
        if (filteredNews.length === 0) {
            let searchedTopic = document.querySelector('.search-results-title');
            searchedTopic.innerHTML = `<p class="text-muted">No articles found for the selected topic and date range.</p>`;
        } else {
        firstPageArticles = filteredNews.slice(0,12); //limits to 12 articles
        secondPageArticles = filteredNews.slice(12,24);
        thirdPageArticles = filteredNews.slice(24,36);
        populateNewsList(firstPageArticles);
        setupPagination();
        }
    }).catch((error) => {
        console.error("Error fetching news:", error);
        alert("Unable to fetch news. Please check your connection.");
    });

}

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let {topic, dateFrom} = getUserInput();
    let searchedTopic = document.querySelector('.search-results-title');
    if (topic !== '' && dateFrom !== ''){
        let newsSection = document.querySelector(".results");
        searchedTopic.innerHTML = `News results for: ${topic}`;
        newsSection.classList.remove('d-none');
        init(API_KEY, topic, dateFrom);
    } else {
        alert("Please provide any input!")
        clearPosts();
        searchedTopic.innerHTML = '';
    }
})
