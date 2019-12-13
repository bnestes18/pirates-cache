;
(function () {
    "use strict";

    // VARIABLES
    let url = 'https://vanillajsacademy.com/api/pirates.json';
    let app = document.querySelector('#app');

    // FUNCTIONS

    /*
    * Dynamically vary the API endpoint
    * @return {String} The API endpoint
    */
    let getEndpoint = function () {
        let endpoint = 'https://vanillajsacademy.com/api/';     
        let random = Math.random();
        if (random < 0.5) return endpoint + 'pirates.json';
        return endpoint + 'fail.json'

    }
    /*!
     * Sanitize and encode all HTML in a user-submitted string
     * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
     * @param  {String} str  The user-submitted string
     * @return {String} str  The sanitized string
     */
    var sanitizeHTML = function (str) {
        var temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };
    /*
    This function renders the articles from the passed in pirates data object
    */
    let renderArticles = function (data) {
        // Extract articles object, publication and tagline properties from pirates object
        let {
            articles,
            publication,
            tagline
        } = data;

        // If there are no articles to render, render a message to the UI and
        // break out of the renderArticles() function
        if (articles.length < 1) {
            app.innerHTML += 'Sorry, there are no articles to display at this time.';
            return;
        }

        // Render articles to the UI
        app.innerHTML += '<div>' +
            '<h1>' + sanitizeHTML(publication) + '</h1>' +
            '<h2>' + sanitizeHTML(tagline) + '</h2>' +
            articles.map(function (article) {
                let html = '<article>' +
                    '<h4>' + sanitizeHTML(article.title) + ' by ' + sanitizeHTML(article.author) + '</h4>' +
                    '<p>' + sanitizeHTML(article.article) + '</p>' +
                    '</article>'
                return html;
            }).join('') +
            '</div>'

    }
    /*
    This function sets up the object that will hold the pirates data 
    and saves the data in localStorage
    */
    let saveData = function (data) {
        // Set up localStorage object
        let pirates = {
            data,
            timestamp: new Date().getTime()
        };

        // Save the object holding the pirates data to localStorage
        localStorage.setItem('cachedPirates', JSON.stringify(pirates));
    }
    /* 
     * Check if saved data is still valid
     * @param  {Object}  saved   Saved data
     * @param  {Number}  goodFor Amount of time in milliseconds that the data is good for
     * @return {Boolean}         If true, data is still valid
     */
    let isDataValid = function (saved, goodFor) {
        // Check that there's data, and a timestamp key
        if (!saved || !saved.data || !saved.timestamp) return false;

        // Get the difference between the timestamp and current time
        let difference = new Date().getTime() - saved.timestamp;

        return difference < goodFor;
    }
    /*
    This function makes a fetch call to the api that holds the pirates data
    */
    let getArticles = function () {

        let cached = getData();
        if (cached) {
            renderArticles(cached);
            console.log('Using cached data...');
            return;
        }
        // Otherwise, fetch articles from API
        fetch(getEndpoint())
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(response);
                }
            }).then(function (piratesData) {
                // Render the articles with returned fetch data
                renderArticles(piratesData);
                saveData(piratesData);
                console.log('Using fetched data...');
            }).catch(function (err) {
                let expiredData = localStorage.getItem('cachedPirates');
                if (!expiredData) {
                    app.innerHTML = 'Cannot load the articles at this time.'
                    console.log(err);
                }
                expiredData = JSON.parse(expiredData);
                console.log('Using expired data...')
                renderArticles(expiredData.data);
                
            })
    }

    /* This function returns the saved data from localStorage if the data is still valid*/
    let getData = function () {
        let cachedData = localStorage.getItem('cachedPirates');
        if (!cachedData) return;
        cachedData = JSON.parse(cachedData);
        // Check if localStorage data (cached data) is still valid after 5 seconds
        // If so, used it.
        if (isDataValid(cachedData, 1000 * 5)) {
            return cachedData.data;
        }
    }


    // Get the articles on initial load
    getArticles();




})();