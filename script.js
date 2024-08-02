class MovieApp {
    constructor() {
        // Initialize favorites, cache, and DOM elements
        this.favorites = this.getFavoritesFromLocalStorage();
        this.cache = {};
        this.displayedMovies = new Set();  // Keep track of displayed movies
        this.userInput = document.querySelector('.input-search');
        this.searchResultElement = document.querySelector('.search-results');
        this.favElement = document.querySelector('.fav-movies-container');
        this.searchResultsElement = document.querySelector('.search-results');
        this.favContainerElement = document.querySelector('.favorites');
        this.menuElement = document.querySelector('.menu-icon');
        this.apiKey = 'e6ff8ba';
        this.init();
    }

    init() {
        // Initial setup: display favorite movies and set up event listeners
        this.displayFavoriteMovies();
        this.searchResultElement.innerHTML = "Your search results will appear here!";
        this.searchResultElement.classList.add('empty');
        this.userInput.addEventListener('input', (e) => this.displayRecursively(e.target.value));
        this.searchResultsElement.addEventListener('click', (e) => this.handleSearchResultsClick(e));
        this.favContainerElement.addEventListener('click', (e) => this.handleFavoritesClick(e));
        this.menuElement.addEventListener('click', (e) => this.toggleFavoritesVisibility(e));
    }

    getFavoritesFromLocalStorage() {
        // Retrieve favorites from localStorage
        return localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites')) : [];
    }

    async fetchMovies(userInput) {
        // Fetch movies from the API
        try {
            const url = `https://www.omdbapi.com/?t=${userInput}&apikey=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.Response === 'True' && response.status == 200) {
                return data;
            }
        } catch (err) {
            console.log("Error while fetching the data from the API: ", err);
        }
    }

    memoisedFetchMovies(fn) {
        // Memoization function to cache API results
        return async (...args) => {
            const key = args.toString();
            if (this.cache.hasOwnProperty(key)) {
                return this.cache[key];
            } else {
                try {
                    const result = await fn(...args);
                    this.cache[key] = result;
                    return result;
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }

    displayMovies(movie) {
        // Display movie details in the search results
        if (movie && !this.displayedMovies.has(movie.Title)) {
            this.displayedMovies.add(movie.Title);  // Add to displayed set
            const imagePath = (movie.Poster !== 'N/A') ? movie.Poster : "./Images/not-found.png";
            const movieElement = `
                <div class="movie">
                    <a href="./movieDetails/movieDetails.html" class="link">
                        <img src=${imagePath} alt="Image not available">
                        <p class="title">${movie.Title}</p>
                    </a>
                    <p class="year">${movie.Year}</p>
                    <p class="rating">Ratings: ${movie.imdbRating}/10</p>
                    <button class="fav-btn">Favourite <img src="./Images/fav-icon.png" alt="" class="fav-img"></button>
                </div>`;
            this.searchResultElement.insertAdjacentHTML('afterbegin', movieElement);
        }
    }

    displayRecursively(userInput) {
        // Display movies as user types in the search input
        let normalizedInput = userInput.replaceAll(/\s+/g, '').trim();

        if (normalizedInput.length !== 0) {
            this.searchResultElement.innerHTML = '';
            this.searchResultElement.classList.remove('empty');
            this.displayedMovies.clear();  // Clear the displayed set on new input
            for (let i = 1; i <= normalizedInput.length; i++) {
                const newInput = normalizedInput.slice(0, i).replaceAll(/\s+/g, '').trim();
                this.optimisedFetchMovies(newInput).then((data) => {
                    this.displayMovies(data);
                }).catch((err) => {
                    console.log('Error while displaying the movies: ', err);
                });
            }
        } else {
            this.searchResultElement.innerHTML = "Your search results will appear here!";
            this.searchResultElement.classList.add('empty');
        }
    }

    displayFavoriteMovies() {
        // Display favorite movies stored in localStorage
        try {
            let favList = JSON.parse(localStorage.getItem('favorites')) || [];
            if (favList.length !== 0) {
                this.favElement.innerHTML = '';
                this.favElement.classList.remove('empty');
                favList.forEach((movie) => {
                    const imagePath = (movie.Poster !== 'N/A') ? movie.Poster : "/Images/not-found.png";
                    const movieElement = `
                        <div class="fav-movie">
                            <a href="./movieDetails/movieDetails.html" class="link">
                                <img src=${imagePath} alt="">
                            </a>
                            <div class="features">
                                <a href="./movieDetails/movieDetails.html" class="link">
                                    <p class="title">${movie.Title}</p>
                                </a>
                                <p class="year">${movie.Year}</p>
                                <p class="rating">Ratings: ${movie.imdbRating}/10</p>
                                <button class="rem-btn">Remove <img src="./Images/remove-icon.png" alt="" class="rem-img"></button>
                            </div>
                        </div>`;
                    this.favElement.insertAdjacentHTML('afterbegin', movieElement);
                });
            } else {
                this.favElement.innerHTML = 'There is nothing in the favourite list';
                this.favElement.classList.add('empty');
            }
        } catch (error) {
            console.log("Error parsing favorites from localStorage: ", error);
        }
    }

    addFavorites(title) {
        // Add a movie to the favorites list
        if (this.favorites.findIndex(movie => movie.Title === title) === -1) {
            this.optimisedFetchMovies(title).then((data) => {
                this.favorites.push(data);
                localStorage.setItem('favorites', JSON.stringify(this.favorites));
                this.displayFavoriteMovies();
            }).catch((err) => {
                console.log(err);
            });
        } else {
            alert("This movie is already in your favorite list");
        }
    }

    removeFavourite(title) {
        // Remove a movie from the favorites list
        this.favorites = this.favorites.filter(movie => movie.Title !== title);
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.displayFavoriteMovies();
    }

    handleSearchResultsClick(e) {
        // Handle clicks on search results (add to favorites or navigate to details)
        const parent = e.target.closest('.movie');
        const title = parent.querySelector('.title').innerText;
        if (e.target && (e.target.classList.contains('fav-btn') || e.target.classList.contains('fav-img'))) {
            this.addFavorites(title);
        } else if (e.target && (e.target.classList.contains('link') || e.target.closest('.link'))) {
            localStorage.setItem('lastClickedMovie', title);
        }
    }

    handleFavoritesClick(e) {
        // Handle clicks on favorite movies (remove from favorites or navigate to details)
        const parent = e.target.closest('.fav-movie');
        const title = parent.querySelector('.title').innerHTML;
        if (e.target && (e.target.classList.contains('rem-btn') || e.target.classList.contains('rem-img'))) {
            this.removeFavourite(title);
        }
        if (e.target && (e.target.classList.contains('link') || e.target.closest('.link'))) {
            localStorage.setItem('lastClickedMovie', title);
        }
    }

    toggleFavoritesVisibility(e) {
        // Toggle the visibility of the favorites section
        e.preventDefault();
        this.favContainerElement.classList.toggle('none');
    }

    get optimisedFetchMovies() {
        // Get memoized fetch function
        return this.memoisedFetchMovies(this.fetchMovies.bind(this));
    }
}

// Initialize the MovieApp when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Select the elements to apply the animation to
    const elements = document.querySelectorAll('main');

    // Add the 'fade-in' class to each element
    elements.forEach(element => {
        element.classList.add('fade-in');
    });

    new MovieApp();
});
