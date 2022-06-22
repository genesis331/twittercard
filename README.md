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
Visit [localhost:3000](http://localhost:3000) in your browser.

When you're ready to stop your local server, type <kbd>Ctrl</kbd>+<kbd>C</kbd> in your terminal window.

# Usage
- [Basic example](#basic-example)
- [Enable dark mode](#enable-dark-mode)

## Basic example
Make a GET request to `/image` & provide a tweet ID to `id` parameter.
```
http://domain.com/image?id=1250966843545640960
```

## Enable dark mode
Add the `darkMode=true` parameter to the URL.
```
http://domain.com/image?id=1250966843545640960&darkMode=true
```

## Inspect HTML
Perform a GET request to `/html` to return a HTML. 
```
http://domain.com/html?id=1250966843545640960
```
> You may also add the `darkMode=true` parameter to enable dark mode.