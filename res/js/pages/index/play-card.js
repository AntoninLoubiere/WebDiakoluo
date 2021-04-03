const playCardPageView = document.getElementById('play-card-page');

const playCardProgress = document.getElementById('play-card-progress');
const playCardProgressIndex = document.getElementById('play-card-progress-index');
const playCardProgressMax = document.getElementById('play-card-progress-max');

const playCardCard = document.getElementById('play-card-card');

class PlayCardPage extends Page {

    static MAX_CACHE_SIZE = 10;

    constructor() {
        super(playCardPageView, 'play-card', true);

        /* a struct to hold state informations
         * testId:           the testId that is show
         * shuffleData:      if data should be shown in order or randomly
         * index:            the index of the current data show
         * data:             the order of row to show in case o shuffleData
         * columnsShow:      the list of columns to show (side 1)
         * columnsAsk:       the list of columns to ask (side 2) 
         * columnsRandom:    the list of columns to choose randomly
         * nbColumnsRandom:  the number of columns to choose randomly to be on the show side
         * randomSide:       choose a random side (columnsShow / columnsAsk)
         * showColumnName:   show the name of the columns in the card
         * columnsCache:     the cache of the columns selected: array of array with the first element representing the index of the element and after the list of columns to show and eventually, the list of columns to ask
         * showOtherside:    if the other side is shown
         */
        this.context = {testId: -1};

        this.globalNavigation = new GlobalNavigation(playCardPageView);
        this.globalNavigation.onnext = this.nextCard.bind(this);
        this.globalNavigation.onprevious = this.previousCard.bind(this);

        playCardCard.onclick = this.turnCard.bind(this);

        this.cardChild = null;
    }

    /* when the page is loaded */
    onload() {
        setPageTitle(currentTest.title);
        playCardPageView.classList.remove('hide');
        if (this.context.testId !== currentTest.id) {
            this.initialiseContext();
        }
    }

    /* when a key is press */
    onkeydown(event) {
        switch (event.keyCode) {
            case KeyboardEvent.DOM_VK_SPACE:
                event.preventDefault();
                this.turnCard();
                break;

            case KeyboardEvent.DOM_VK_LEFT:
                this.previousCard();
                break;

            case KeyboardEvent.DOM_VK_RIGHT:
                this.nextCard();
                break;
        }
    }

    /* initialise the context of the current card */
    initialiseContext() {
        this.context = {
            testId: currentTest.id,
            shuffleData: true,
            index: 0,
            data: [],
            columnsShow: [],
            columnsAsk: [],
            columnsRandom: [],
            nbColumnsRandom: 0,
            columnsCache: [],
            randomSide: true,
            showColumnName: true,
            showOtherside: false
        };

        var c;
        for (var i = 0; i < currentTest.columns.length; i++) {
            c = currentTest.columns[i];
            if (c.getSettings(Column.SET_CAN_BE_SHOW)) {
                if (c.getSettings(Column.SET_CAN_BE_ASK)) {
                    this.context.columnsRandom.push(i);
                } else {
                    this.context.columnsShow.push(i);
                }
            } else if (c.getSettings(Column.SET_CAN_BE_ASK)) {
                this.context.columnsAsk.push(i);
            }
        }

        if (this.context.columnsShow.length <= 0) {
            this.context.nbColumnsRandom = 1;
        }

        if (this.context.columnsRandom.length === this.context.nbColumnsRandom) {
            this.context.columnsShow = this.context.columnsShow.concat(this.context.columnsRandom);
            this.context.nbColumnsRandom = [];
            this.context.nbColumnsRandom = 0;
        } else if (this.context.nbColumnsRandom === 0) {
            this.context.columnsAsk = this.context.columnsAsk.concat(this.context.columnsRandom);
            this.context.columnsRandom = [];
        } else {
            this.context.randomSide = false;
        }

        if ((this.context.columnsShow.length > 0 || this.context.nbColumnsRandom > 0) && 
            (this.context.columnsAsk.length > 0 || this.context.columnsRandom.length - this.context.nbColumnsRandom > 0)) {
            if (this.context.nbColumnsRandom === 0 && this.context.columnsShow.length === 1 && this.context.columnsAsk === 1) {
                this.context.showColumnName = false;
            }
        } else {
            backToMain(false);
        }

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

    /* get the selected columns to show / ask from cache or generate new */
    getSelectedColumns(index) {
        for (var i = this.context.columnsCache.length - 1; i >= 0; i--) {
            if (this.context.columnsCache[i][0] === index)
                return [this.context.columnsCache[i][1], this.context.columnsCache[i][2]]
        }

        // generate new
        var columnsRandomShow = [];
        var columnsShow = [];
        var columnsAsk = [];
        var columnsRemaining = this.context.nbColumnsRandom;
        var i;
        while (columnsRemaining > 0) {
            i = Math.floor(Math.random() * this.context.columnsRandom.length);
            if (columnsRandomShow.indexOf(i) === -1) {
                columnsRandomShow.push(i);
                columnsRemaining--;
            }
        }

        for (var i = 0; i < this.context.columnsRandom.length; i++) {
            if (columnsRandomShow.indexOf(i) === -1)
                columnsAsk.push(i);
        }

        if (this.context.randomSide && Math.random() >= .5) {
            columnsShow = columnsAsk.concat(this.context.columnsAsk);
            columnsAsk = columnsRandomShow.concat(this.context.columnsShow);
        } else {
            columnsShow = columnsRandomShow.concat(this.context.columnsShow);
            columnsAsk = columnsAsk.concat(this.context.columnsAsk);
        }

        if (this.context.columnsCache.push([index, columnsShow, columnsAsk]) > PlayCardPage.MAX_CACHE_SIZE)
            this.context.columnsCache.shift();

        return [columnsShow, columnsAsk];
    }

    /* update the card at the index i, and show a face */
    updateCard(i) {
        var max = currentTest.data.length;
        this.context.index = i;
        this.context.showOtherside = false;
        this.globalNavigation.updateStatus(i <= 0 ? 1 : i >= max - 1 ? 2 : 0);
        
        playCardProgressIndex.textContent = i + 1;
        playCardProgress.value = i / (max - 1);
        this.updateUI();
    }

    /* update the UI of the card */
    updateUI() {
        if (this.cardChild) {
            playCardCard.removeChild(this.cardChild);
        }

        this.cardChild = document.createElement('div');
        var columns = this.getSelectedColumns(this.context.index)[this.context.showOtherside ? 1 : 0];
        var column;
        var data;
        var showName = this.context.showColumnName;
        var div;
        var e;
        for (var i = 0; i < columns.length; i++) {
            column = currentTest.columns[columns[i]];
            data = currentTest.data[this.context.data[this.context.index]][columns[i]];
            if (showName) {
                div = document.createElement('div');
                div.classList.add('card-column-name-parent');

                e = document.createElement('h2');
                e.classList.add('card-column-name');
                e.classList.add('card-center');
                e.textContent = column.name + ' :';
                div.appendChild(e);

                div.appendChild(column.getCardView(data));                

                this.cardChild.appendChild(div);
            }  else {
                this.cardChild.appendChild(column.getCardView(data));                
            }
        }
        playCardCard.appendChild(this.cardChild);
    }

    /* turn the card to see the other side */
    turnCard() {
        this.context.showOtherside = !this.context.showOtherside;
        this.updateUI();
    }

    /* go to the next card */
    nextCard() {
        if (this.context.index < currentTest.data.length - 1) {
            this.updateCard(this.context.index + 1);
        }
    }

    /* go to the previous card */
    previousCard() {
        if (this.context.index > 0) {
            this.updateCard(this.context.index - 1);
        }
    }
}

PAGES.play_card = new PlayCardPage();