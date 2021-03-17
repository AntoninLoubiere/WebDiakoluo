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

        document.getElementById('play-set-form').onsubmit = this.playTest.bind(this);
    }

    onload() {
        if (!currentTest.isPlayable()) {
            backToMain(); // TODO dialog
            return;
        } 

        playSetPageTestTitle.textContent = currentTest.title;

        this.setMinMaxColumns();

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

    /* set the minimum and the maximum of the columns input */
    setMinMaxColumns() {
        var min = 0;
        var max = 0; // a column must be show
        var askOnly = false;
        var columnCount = 0;
        var c;
        for (var i = 0; i < currentTest.columns.length; i++) {
            c = currentTest.columns[i];
            if (c.getSettings(Column.SET_CAN_BE_ASK)) {
                if (c.getSettings(Column.SET_CAN_BE_SHOW)) {
                    max++;
                } else {
                    askOnly = true;                    
                }     
                columnCount++;
            } else if (c.getSettings(Column.SET_CAN_BE_SHOW)) {
                min++;
                max++;
                columnCount++;
            }
        }

        if (!askOnly) {
            max--;
        }
        if (min <= 0)
            min = 1;

        playSetPageNumberColumns.min = min;
        playSetPageNumberColumns.max = max;
        playSetPageNumberColumnsMax.textContent = columnCount;
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