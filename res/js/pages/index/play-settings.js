const playSetPageView = document.getElementById('play-settings-page');

const playSetPageTestTitle = document.getElementById('play-set-test-title');
const playSetPageStartButton = document.getElementById('play-set-start-button');

const playSetPageNumberData = document.getElementById('play-set-number-data');
const playSetPageNumberColumns = document.getElementById('play-set-number-column');
const playSetPageNumberColumnsMax = document.getElementById('play-set-number-column-max');

class PlaySettingsPage extends Page {

    constructor() {
        super(playSetPageView, "play-settings", true);
        this.currentTestId = -1;
    }

    onload() {
        if (!currentTest.isPlayable()) {
            backToMain(); // TODO dialog
            return;
        } 

        playSetPageTestTitle.textContent = currentTest.title;

        playSetPageNumberColumns.max = currentTest.columns.length - 1; // cannot be max
        playSetPageNumberColumnsMax.textContent = playSetPageNumberColumns.max;

        var maxData = currentTest.data.length;
        var d;
        for (var i = 0; i < playSetPageNumberData.options.length; i++) {
            d = Number(playSetPageNumberData.options[i].value);
            if (d && d > maxData) {
                playSetPageNumberData.options[i].disabled = true;
            }
        }

        playSetPageView.classList.remove('hide');
        setPageTitle(currentTest.title);
    }

    /* play the test */
    playTest(event) {
        event.preventDefault(); // prevent send of form
        
        currentURL.searchParams.set("page", "play");
        currentURL.searchParams.set("data", playSetPageNumberData.value);
        currentURL.searchParams.set("columns", playSetPageNumberColumns.value);
        history.pushState({}, "Play", currentURL);
        loadPage();
    }
}

PAGES.play_settings = new PlaySettingsPage();