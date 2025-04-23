
const API_KEY = 'c285dd7aae048f1be536c829711225'; // Replace with your actual API key
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
    
    try {
        const url = `${BASE_URL}/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok') {
            displayNews(data.articles);
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        showError();
    } finally {
        hideLoading();
    }
}

async function fetchNewsBySearch(searchTerm) {
    showLoading();
    hideError();
    
    try {
        const url = `${BASE_URL}/everything?q=${encodeURIComponent(searchTerm)}&sortBy=publishedAt&apiKey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok') {
            displayNews(data.articles);
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        showError();
    } finally {
        hideLoading();
    }
}

function displayNews(articles) {
    newsContainer.innerHTML = '';
    
    if (articles.length === 0) {
        newsContainer.innerHTML = '<div class="no-results">No articles found. Try a different search or category.</div>';
        return;
    }
    
    articles.forEach(article => {
        if (!article.title || article.title === '[Removed]') return;
        
        const card = document.createElement('div');
        card.className = 'news-card';
        
        const publishedDate = new Date(article.publishedAt);
        const formattedDate = publishedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        card.innerHTML = `
            <img src="${article.urlToImage || '/placeholder.svg?height=180&width=300'}" 
                 alt="${article.title}" 
                 class="news-image"
                 onerror="this.src='/placeholder.svg?height=180&width=300'">
            <div class="news-content">
                <span class="news-source">${article.source.name || 'Unknown Source'}</span>
                <h3 class="news-title">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                        ${article.title}
                    </a>
                </h3>
                <p class="news-description">${article.description || 'No description available'}</p>
                <p class="news-date">${formattedDate}</p>
            </div>
        `;
        
        newsContainer.appendChild(card);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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