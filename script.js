const API_KEY = '511a56d8bd254920ae03df1f33db7c79'; // Replace this with your actual API key from https://newsapi.org
const BASE_URL = 'https://newsapi.org/v2';

const newsContainer = document.getElementById('news-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const currentCategoryTitle = document.querySelector('.current-category h2');
const loadingIndicator = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');

let currentCategory = 'general';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchNews(currentCategory);
    setupEventListeners();
});

function setupEventListeners() {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;

            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            currentCategory = category;
            currentSearch = '';
            searchInput.value = '';
            currentCategoryTitle.textContent = `${capitalizeFirstLetter(category)} News`;
            fetchNews(category);
        });
    });

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        currentSearch = searchTerm;
        currentCategoryTitle.textContent = `Search Results: "${searchTerm}"`;
        fetchNewsBySearch(searchTerm);
    }
}

async function fetchNews(category) {
    showLoading();
    hideError();

    const url = `${BASE_URL}/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Category News Response:', data);

        if (data.status === 'ok') {
            displayNews(data.articles);
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
        showError();
    } finally {
        hideLoading();
    }
}

async function fetchNewsBySearch(searchTerm) {
    showLoading();
    hideError();

    // Use top-headlines search (free-tier safe)
    const url = `${BASE_URL}/top-headlines?q=${encodeURIComponent(searchTerm)}&country=us&apiKey=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Search News Response:', data);

        if (data.status === 'ok') {
            displayNews(data.articles);
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
    } catch (error) {
        console.error('Search fetch error:', error.message);
        showError();
    } finally {
        hideLoading();
    }
}

function displayNews(articles) {
    newsContainer.innerHTML = '';

    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = '<div class="no-results">No articles found.</div>';
        return;
    }

    articles.forEach(article => {
        if (!article.title || article.title === '[Removed]') return;

        const card = document.createElement('div');
        card.className = 'news-card';

        const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        card.innerHTML = `
            <img src="${article.urlToImage || '/placeholder.svg'}" 
                 alt="${article.title}" 
                 class="news-image"
                 onerror="this.src='/placeholder.svg'">
            <div class="news-content">
                <span class="news-source">${article.source.name || 'Unknown Source'}</span>
                <h3 class="news-title">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                        ${article.title}
                    </a>
                </h3>
                <p class="news-description">${article.description || 'No description available.'}</p>
                <p class="news-date">${date}</p>
            </div>
        `;
        newsContainer.appendChild(card);
    });
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showLoading() {
    loadingIndicator.style.display = 'flex';
    newsContainer.style.display = 'none';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
    newsContainer.style.display = 'grid';
}

function showError() {
    errorContainer.style.display = 'block';
    newsContainer.style.display = 'none';
}

function hideError() {
    errorContainer.style.display = 'none';
}
