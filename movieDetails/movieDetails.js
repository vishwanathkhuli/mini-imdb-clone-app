// Class to handle movie details functionality
class MovieDetails {
    constructor() {
        // Initialize API key and movie container element
        this.apiKey = 'e6ff8ba';
        this.movieContainer = document.querySelector('.movie-details-container');
        // Set up event listeners and fetch movie details
        this.init();
    }

    init() {
        // Event listener to fetch and display movie details when the document is fully loaded
        console.log('init is executing');
        // Retrieve the last clicked movie from localStorage
        const lastClickedMovie = localStorage.getItem('lastClickedMovie'); // Use getItem
        console.log('Last Clicked Movie:', lastClickedMovie); // Debugging line
        if (lastClickedMovie) {
            // Fetch movie details and display them
            this.fetchMovieDetails(lastClickedMovie)
                .then(movie => this.displayMovieInfo(movie))
                .catch(err => console.log(err));
        } else {
            console.log('No last clicked movie found'); // Debugging line
        }
    }

    // Fetch movie details from the API
    async fetchMovieDetails(userInput) {
        try {
            // Construct the API URL with the movie title and API key
            const url = `https://www.omdbapi.com/?t=${userInput}&apikey=${this.apiKey}`;
            // Fetch data from the API
            const response = await fetch(url);
            const data = await response.json();
            // Check if the response is valid and return the movie data
            if (data && data.Response === 'True') {
                return data;
            } else {
                throw new Error('Movie not found');
            }
        } catch (err) {
            // Log errors and rethrow them
            console.log("Error while fetching the data from the API: ", err);
            throw err;
        }
    }

    // Display movie information in the movie details container
    displayMovieInfo(movie) {
        // Determine the image path for the movie poster
        const imagePath = (movie.Poster !== 'N/A') ? movie.Poster : "../Images/not-found.png";
        // Generate the HTML content to display movie details
        const movieElement = `
            <p class="title">${movie.Title}</p>
            <div class="info">
                <ul class="key-details">
                    <li><span>Plot </span> <br>${movie.Plot}</li>
                    <li><span>Actors :</span> ${movie.Actors}</li>
                    <li><span>Director :</span> ${movie.Director}</li>
                    <li><span>Released Date :</span> ${movie.Released}</li>
                    <li><span>Writer :</span> ${movie.Writer}</li>
                    <li><span>Year :</span> ${movie.Year}</li>
                    <li><span>Ratings :</span> ${movie.imdbRating}/10</li>
                </ul>
                <img src="${imagePath}" alt="${movie.Title} Poster">
            </div>`;
        // Insert the generated HTML into the movie details container
        this.movieContainer.innerHTML = movieElement;
    }
}

// Initialize the MovieDetails class when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovieDetails();
});
