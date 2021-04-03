const playCardPageView = document.getElementById('play-card-page');

const playCardProgress = document.getElementById('play-card-progress');
const playCardProgressIndex = document.getElementById('play-card-progress-index');
const playCardProgressMax = document.getElementById('play-card-progress-max');

class PlayCardPage extends Page {

    constructor() {
        super(playCardPageView, 'play-card', true);

        // a struct to hold state informations
        // testId:      the testId that is show
        // shuffleData: if data should be shown in order or randomly
        // index:       the index of the current data show
        // data:        the order of row to show in case o shuffleData
        this.context = {testId: -1, shuffleData: true, index: 0, data: []};

        this.globalNavigation = new GlobalNavigation(playCardPageView);
        this.globalNavigation.onnext = this.nextCard.bind(this);
        this.globalNavigation.onprevious = this.previousCard.bind(this);
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

        this.initialise();
        if (this.context.shuffleData) {
            this.shuffleData();
        }
    }

    /* initialise the UI from the context */
    initialise() {
        playCardProgressMax.textContent = currentTest.data.length;
    }

    /* shuffle the data, and if reShuffle is true, make sure that the current index is correctly take in account */
    shuffleData(reShuffle = false) {
        if (reShuffle) {
            var i = this.context.data[this.context.index];
            this.context.data = randomShuffledNumberList(currentTest.data.length);
            var to = this.context.data.indexOf(i);
            var temp = this.context.data[to];
            this.context.data[to] = this.context.data[0];
            this.context.data[0] = temp;
        } else {
            this.context.data = randomShuffledNumberList(currentTest.data.length);
        }
        this.updateCard(0);
    }

    /* update the card at the index i */
    updateCard(i) {
        var max = currentTest.data.length;
        this.context.index = i;
        this.globalNavigation.updateStatus(i <= 0 ? 1 : i >= max - 1 ? 2 : 0);
        
        playCardProgressIndex.textContent = i + 1;
        playCardProgress.value = i / (max - 1);

        console.log("Card: ", i, this.context.data[i]);
    }

    nextCard() {
        if (this.context.index < currentTest.data.length - 1) {
            this.updateCard(this.context.index + 1);
        }
    }

    previousCard() {
        if (this.context.index > 0) {
            this.updateCard(this.context.index - 1);
        }
    }
}

PAGES.play_card = new PlayCardPage();