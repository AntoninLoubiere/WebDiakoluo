const playCardPageView = document.getElementById('play-card-page');

class PlayCardPage extends Page {

    constructor() {
        super(playCardPageView, 'play-card', true);

        // a struct to hold state informations
        // testId:      the testId that is show
        // shuffleData: if data should be shown in order or randomly
        // index:       the index of the current data show
        // data:        the order of row to show in case o shuffleData
        this.context = {testId: -1, shuffleData: true, index: 0, data: []};
    }

    /* when the page is loaded */
    onload() {
        setPageTitle(currentTest.title);
        playCardPageView.classList.remove('hide');
        if (this.context.testId !== currentTest.id) {
            this.initialiseContext();
        }
    }

    /* initialise the context of the current card */
    initialiseContext() {
        this.context = {
            testId: currentTest.id,
            shuffleData: true,
            index: 0,
            data: []
        };

        if (this.context.shuffleData) {
            this.shuffleData();
        }
    }

    /* shuffle the data, and if reShuffle is true, make sure that the current index is correctly take in account */
    shuffleData(reShuffle = false) {
        if (reShuffle) {

        } else {
            this.context.data = randomShuffledNumberList(currentTest.data.length);
        }
        this.updateCard(0);
    }

    /* update the card at the index i */
    updateCard(i) {
        this.context.index = i;
        console.log("Card: ", i, this.context.data[i]);
    }
}

PAGES.play_card = new PlayCardPage();