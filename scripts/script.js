document.addEventListener('DOMContentLoaded', function() {
    
    var body = document.body;
    var jsListenButtons = document.querySelectorAll('.js-listen');
    var modalAudio = document.querySelector('.modal-audio');
    var jsModalPlayBtns = document.querySelectorAll('.js-modal-play');
    var jsVideoPlayBtns = document.querySelectorAll('.js-video-play');
    var menuBtn = document.querySelector('.menu-btn');

    // Opening/closing burger menu 
    menuBtn.addEventListener('click', function() {
        document.querySelector('.menu-wrapper').classList.toggle('open-burger-menu');
        menuBtn.classList.toggle('menu-btn-active');
        body.classList.toggle('lock');
    });

    document.querySelectorAll('.submenu-link').forEach(function (submenuLink) {
        submenuLink.addEventListener('click', function() {
            body.classList.remove('lock');
            document.querySelector('.menu-wrapper').classList.remove('open-burger-menu');
            menuBtn.classList.remove('menu-btn-active');
        });
    });

    // Opening/closing modal window with audio playing by clicking on "Listen" button
    jsListenButtons.forEach(function (jsListenButton) {
        jsListenButton.addEventListener('click', function() {
            var currentFilmSection = jsListenButton.closest('section');
            var filmTitle = currentFilmSection.dataset.title;
            var filmRating = currentFilmSection.dataset.rating;
            var audio = currentFilmSection.dataset.audio;

            document.querySelector('.modal-overlay').classList.add('modal-open');
            body.classList.add('lock');

            document.querySelector('.modal-rating').textContent = filmRating;
            document.querySelector('.modal-title').textContent = filmTitle;
            modalAudio.setAttribute('src', 'audios/' + audio);  
        });
    });

    document.querySelector('.modal-container').addEventListener('click', function (e) {
        e.stopPropagation();
    });

    jsModalPlayBtns.forEach(function (jsModalPlayBtn) {
        jsModalPlayBtn.addEventListener('click', function() {
            jsModalPlayBtn.classList.toggle('btn-pause');

            if (jsModalPlayBtn.classList.contains('btn-pause')) {
                modalAudio.play();
            } else {
                modalAudio.pause();
            }
        });
    });

    closeModal('.modal-overlay');
    closeModal('.modal-close-btn');


    // Interacting with videos in movie sliders
    jsVideoPlayBtns.forEach(function (jsVideoPlayBtn) {
        jsVideoPlayBtn.addEventListener('click', function() {
            var movieItem = jsVideoPlayBtn.closest('.movie-item');
            var video = movieItem.querySelector('.movie-video');
            var allVideos = document.querySelectorAll('.movie-video');

            jsVideoPlayBtn.classList.toggle('btn-pause');
            movieItem.classList.toggle('movie-item-playing');

            if (jsVideoPlayBtn.classList.contains('btn-pause')) {
                video.play();
            } else {
                video.pause();
            }

            allVideos.forEach(function (videoElem) {
                if (videoElem !== video) {
                    videoElem.pause();
                    videoElem.closest('.movie-item').classList.remove('movie-item-playing');
                    videoElem.nextElementSibling.classList.remove('btn-pause');
                }
            });
        });   
    });

    // Adjusting media volume when volume is being dragged
    document.querySelectorAll('.volume-range').forEach(function (volumeRange) {
        volumeRange.addEventListener('mousedown', function (e) {
            setVolume(volumeRange, e.pageX);

            window.addEventListener('mousemove', handleMouseMove);

            document.addEventListener('mouseup', function() {
                window.removeEventListener('mousemove', handleMouseMove);
            }, { once: true });
        });

        function handleMouseMove(e) {
            setVolume(volumeRange, e.pageX);
        }
    });

    initSliders(1);

    closeVideo('.slider-btn-left');
    closeVideo('.slider-btn-right');
    closeVideo('.js-listen');

    makeSmoothScroll('.submenu-link');
    makeSmoothScroll('.js-scroll-link');

    showMediaTime('.movie-video');
    showMediaTime('.modal-audio');
});

function closeModal(selector) {
    var elements = document.querySelectorAll(selector);

    elements.forEach(function (element) {
        element.addEventListener('click', function () {
            document.querySelector('.modal-audio').pause();
            document.querySelector('.modal-overlay').classList.remove('modal-open');
            document.body.classList.remove('lock');
            document.querySelector('.js-modal-play').classList.remove('btn-pause');
        });
    });   
}

function closeVideo(selector) {
    var elements = document.querySelectorAll(selector);

    elements.forEach(function (element) {
        element.addEventListener('click', function () {
            document.querySelectorAll('.movie-video').forEach(function (movieVideoElem) {
                movieVideoElem.pause();
            });
            document.querySelectorAll('.movie-item').forEach(function (movieItemElem) {
                movieItemElem.classList.remove('movie-item-playing');
            });
            document.querySelectorAll('.js-video-play').forEach(function (jsVideoPlayElem) {
                jsVideoPlayElem.classList.remove('btn-pause');
            });
        });
    });
}

function initSliders(initialSlide) {
    var SLIDE_STEP = -100;

    document.querySelectorAll('.slider-wrapper').forEach(function (sliderWrapperElem) {
        var currentSlide = initialSlide;
        var moviesList = sliderWrapperElem.querySelector('.movies-list');
        var lastSlideIndex = moviesList.querySelectorAll('.movie-item').length - 1;

        moveSlide(moviesList, currentSlide);

        sliderWrapperElem.querySelector('.slider-btn-right').addEventListener('click', function (e) {
            e.preventDefault();

            if (currentSlide < lastSlideIndex) {
                currentSlide++;
                moveSlide(moviesList, currentSlide);
            }
        });

        sliderWrapperElem.querySelector('.slider-btn-left').addEventListener('click', function (e) {
            e.preventDefault();

            if (currentSlide > 0) {
                currentSlide--;
                moveSlide(moviesList, currentSlide);
            }
        });
    });

    function moveSlide(element, slide) {
        element.style.marginLeft = (slide * SLIDE_STEP) + '%';
    }
}

function makeSmoothScroll(selector) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        element.addEventListener('click', function (e) {
            e.preventDefault();
            var elementHref = element.getAttribute('href');
            var offsetTop = document.querySelector(elementHref).offsetTop;

            scroll({
                top: offsetTop,
                behavior: 'smooth'
            });
        });
    });
}

function showMediaTime(selector) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        var mediaControlsElement = element.parentNode.querySelector('.media-controls');
        var mediaTimeElem = mediaControlsElement.querySelector('.media-time');
        var currentTimeElem = mediaTimeElem.querySelector('.current-time');
        var timeLineElem = mediaTimeElem.querySelector('.timeline');
        var timeProgressElem = mediaTimeElem.querySelector('.timeline-progress');
        var timer = 0;

        element.addEventListener('loadedmetadata', function () {
            var mediaDuration = mediaTimeElem.querySelector('.media-controls .media-duration');
            
            mediaDuration.textContent = formatTime(element.duration);
            currentTimeElem.textContent = formatTime(0);
            timeProgressElem.style.width = '0';

            element.addEventListener('play', function () {
                showProgress();
            });
        
            element.addEventListener('pause', function () {
                cancelAnimationFrame(timer);
            });

            element.addEventListener('ended', function () {
                element.nextElementSibling.classList.remove('btn-pause');
                currentTimeElem.textContent = formatTime(0);
                timeProgressElem.style.width = '0';

                if (selector == '.movie-video') {
                    document.querySelector('.movie-item').classList.remove('movie-item-playing');
                }
            });

            function showProgress() {
                var currTime = element.currentTime;
                currentTimeElem.textContent = formatTime(currTime);
    
                var progress = (currTime / element.duration) * 100;
                timeProgressElem.style.width = progress + '%';
    
                timer = requestAnimationFrame(showProgress);
            }

            timeLineElem.addEventListener('click', function (e) {
                var progress = e.offsetX / this.offsetWidth;
                var newCurrentTime = progress * element.duration;
    
                element.currentTime = newCurrentTime;
    
                currentTimeElem.textContent = formatTime(newCurrentTime);
                timeProgressElem.style.width = (progress * 100) + '%';    
            });
        });
    }); 
};

function formatTime(time) {
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time - minutes * 60);
  
    return  minutes + ':' +
            (seconds < 10 ? '0' + seconds : seconds);
}

function setVolume(element, eventXPosition) {
    var elementObj = $(element)
    var volumeRangeWidth = elementObj.width();
    var volumeRangeLeftPostion = elementObj.offset().left;
    var volumeElement = elementObj.find('.volume');
    var volumeIcon = elementObj.siblings('.volume-icon');
    var grandparentElement = elementObj.parent('.volume-control').parent('.media-controls').parent();
    var x = eventXPosition - volumeRangeLeftPostion;
    var volume = x / volumeRangeWidth;
    var volumeValue = volume * 100;

    if (volume <= 0) {
        volumeValue = 0;
        volume = 0;
    } else if (volume > 1) {
        volume = 1;
        volumeValue = 100; 
    }

    volumeElement.css('width', volumeValue + '%');
    
    var icon = volume <= 0 ? 'images/player/mute.svg' : 'images/player/volume.svg';
    volumeIcon.attr('src', icon);

    var mediaSelector = grandparentElement.hasClass('movie-item') ? '.movie-video' : '.modal-audio';        
    grandparentElement.find(mediaSelector).prop('volume', volume);
}
