# Introduction
Twittercard creates beautiful Twitter tweet images. 

# Development
This section describes the process for running the application on a local environment.

### Getting Started
You'll need NodeJS to run the app. To install NodeJS, [get the installer from nodejs.org](https://nodejs.org).

Once you've installed Node.js (which includes the popular `npm` package manager), launch a Terminal and run the following commands:

```sh
git clone https://github.com/genesis331/twittercard.git
npm install
npm start
```
Create an `.env` file and include your Twitter API Authorization Bearer Token, following the format provided below.
```
TWITTER_AUTH_TOKEN={YOUR_TOKEN_HERE}
```
> Do not include the curly braces!

Visit [localhost:3000](http://localhost:3000) in your browser.

When you're ready to stop your local server, type <kbd>Ctrl</kbd>+<kbd>C</kbd> in your terminal window.

# Usage
- [Basic example](#basic-example)
- [Enable dark mode](#enable-dark-mode)

## Basic example
Make a GET request to `/image` & provide a tweet ID to `id` parameter.
```
https://domain.com/image?id=1250966843545640960
```

## Enable dark mode
Add the `darkMode=true` parameter to the URL.
```
https://domain.com/image?id=1250966843545640960&darkMode=true
```

## Inspect HTML
Perform a GET request to `/html` to return a HTML. 
```
https://domain.com/html?id=1250966843545640960
```
> You may also add the `darkMode=true` parameter to enable dark mode.

# Self-Hosting

1. Pull the latest Docker image from GitHub Packages
```
docker pull ghcr.io/genesis331/twittercard:latest
```
2. Run the Docker image
```
docker run -d --restart unless-stopped -p {PREFERRED_PORT}:3000 --name twittercard -v /{VOLUME_NAME}:/twittercardtemp -e TWITTER_AUTH_TOKEN={YOUR_TOKEN_HERE} ghcr.io/genesis331/twittercard:latest
```
> Again, do not include the curly braces!