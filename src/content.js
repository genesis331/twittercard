let darkMode = false;

function toggleTheme() {

    // Converts to Dark Theme
    if (!darkMode) {
        
        Array.from(document.getElementsByClassName('themeElem')).forEach((elem) => {
            elem.classList.remove('light-text');
            elem.classList.add('dark-text');
        });
        Array.from(document.getElementsByClassName('themeElem-2')).forEach((elem) => {
            elem.classList.remove('light-2');
            elem.classList.add('dark-2');
        });
        
        document.getElementById('github-icon').src = './src/icons/icon_github_white.svg';
        document.getElementById('theme-switcher-icon').src = './src/icons/icon_moon.svg';
        document.getElementById('output-img').src = './src/default/default-dark.png';
        document.getElementsByTagName('hr')[0].style.backgroundColor = 'white';
        document.getElementsByTagName('body')[0].style.background = 'linear-gradient(135deg, #021623, #130223)';
    }

    // Converts to Light Theme 
    else {

        Array.from(document.getElementsByClassName('themeElem')).forEach((elem) => {
            elem.classList.remove('dark-text');
            elem.classList.add('light-text');
        });
        Array.from(document.getElementsByClassName('themeElem-2')).forEach((elem) => {
            elem.classList.remove('dark-2');
            elem.classList.add('light-2');
        });
        
        document.getElementById('github-icon').src = './src/icons/icon_github_black.svg';
        document.getElementById('theme-switcher-icon').src = './src/icons/icon_sun.svg';
        document.getElementById('output-img').src = './src/default/default-light.png';
        document.getElementsByTagName('hr')[0].style.backgroundColor = 'black';
        document.getElementsByTagName('body')[0].style.background = 'linear-gradient(135deg, #f0f9ff, #e4ecff)';
    }
    
    darkMode = !darkMode;
}

function imageExists(url) {

    console.log(url);

    return new Promise((resolve, reject) => {

        var img = new Image();

        img.onload = function () {
            resolve(true);
        };
        img.onerror = function () {
            resolve(false);
        };

        img.src = url;
    });
}
  
async function getTwittercard() {
    
    const url = document.getElementById('input-url').value;
    let imgElem = document.getElementById('output-img');
    
    imgElem.src = `./src/loading/loading-${darkMode ? 'dark' : 'light'}.png`;

    if (url.includes('https://twitter.com/') && url.includes('/status/')) {

        const inputArr = url.split('/');
        const id = inputArr[inputArr.length - 1].split('?')[0];

        if (await imageExists(`http://twittercard.zixucheah331.ml/image?id=${id}${darkMode ? '&darkMode=true' : ''}`)) {

            imgElem.src = `http://twittercard.zixucheah331.ml/image?id=${id}&darkMode=${darkMode ? '&darkMode=true' : ''}`;
        } 
        else {imgElem.src = `./src/error/error-${darkMode ? 'dark' : 'light'}.png`;}
    } 
    else {imgElem.src = `./src/error/error-${darkMode ? 'dark' : 'light'}.png`;}
}