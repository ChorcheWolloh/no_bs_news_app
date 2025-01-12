const API_KEY = '9ea0ffec0b27407d8d62e651c472fa13';
let topic = '';
let dateFrom = ''; //2025-01-01

let firstPageArticles, secondPageArticles, thirdPageArticles;

// possible refactor opportunity - move all variables from global scope to local
let newsList = document.querySelector(".news-list");
let searchBtn = document.querySelector('#search-btn');
let searchedTopic = document.querySelector('.search-results-title');
let newsSection = document.querySelector(".results");
let dateInput = document.querySelector('#from-date');

let firstPageBtn = document.querySelector("#first-page");
let secondPageBtn = document.querySelector("#second-page");
let thirdPageBtn = document.querySelector("#third-page");

let paginationBtns = [firstPageBtn, secondPageBtn, thirdPageBtn];

let today =  new Date().toISOString().slice(0, 10);
let monthAgo =  getMonthAgo(new Date());
dateInput.setAttribute('max', `${today}`);
dateInput.setAttribute('min', `${monthAgo}`);

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
                        <div class="publish-date card-subtitle">${convertDate(article.publishedAt)}</div>
                    </div>
                `;
}

function convertDate(date){
    return date.slice(0,10);
}

function getMonthAgo(today){
    let monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    // Format it as YYYY-MM-DD
    monthAgo = monthAgo.toISOString().slice(0, 10);
    return monthAgo;
}

function getUserInput(){
    topic = document.querySelector("#topic").value;
    dateFrom = dateInput.value;
}

// populates the container with articles
function populateNewsList(articlesArr){
    for (let i = 0; i < articlesArr.length; i++) {
        let article = document.createElement('article');
        article.setAttribute('class', 'news card card-body');
        article.innerHTML = articleHTML(articlesArr[i]);
        newsList.appendChild(article);
    }

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
        firstPageArticles = filteredNews.slice(0,12);
        secondPageArticles = filteredNews.slice(10,22);
        thirdPageArticles = filteredNews.slice(20,32);
        populateNewsList(firstPageArticles);
    });

}

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

// adds clearing to each pagination button
function btnPagination(){
    paginationBtns.forEach((button) => {
        button.addEventListener('click', (e) => {
            clearPosts();
            switch(button.id) {
                case "first-page":
                    populateNewsList(firstPageArticles);
                    break;
                case "second-page":
                    populateNewsList(secondPageArticles);
                    break;
                case "third-page":
                    populateNewsList(thirdPageArticles);
                    break;
                default:
                    alert("Something went wrong, sorry.");
                }
        })
    })
}



searchBtn.addEventListener('click', (e) => {
    e.preventDefault;
    getUserInput();
    if (topic !== '' && dateFrom !== ''){
        searchedTopic.innerHTML = `News results for: ${topic}`;
        newsSection.classList.remove('d-none');
        init(API_KEY, topic, dateFrom);
        btnPagination();
    } else {
        alert("Please provide any input!")
    }
})
