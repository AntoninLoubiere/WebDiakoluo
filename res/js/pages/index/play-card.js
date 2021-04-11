const playCardPageView = document.getElementById('play-card-page');

const playCardProgress = document.getElementById('play-card-progress');

const playCardCard = document.getElementById('play-card-card');
const playCardRestartTemplate = document.getElementById('play-card-restart-template');

const playCardSettingsButton = document.getElementById('play-card-settings-button');
const playCardShuffleButton = document.getElementById('play-card-shuffle-button');
const playCardShuffleButtonImage = document.getElementById('play-card-shuffle-button-image');

const playCardSetShowColumns = document.getElementById('play-card-set-show-columns'); 
const playCardSetRandomColumns = document.getElementById('play-card-set-random-columns'); 
const playCardSetAskColumns = document.getElementById('play-card-set-ask-columns'); 
const playCardSetHideColumns = document.getElementById('play-card-set-hide-columns'); 

const playCardSetNbColRandom = document.getElementById('play-card-set-nb-rand-col');
const playCardSetRandomSide = document.getElementById('play-card-set-random-side');
const playCardSetColumnName = document.getElementById('play-card-set-column-name');

const playCardSetReset = document.getElementById('play-card-set-reset');

class PlayCardPage extends Page {

    static MAX_CACHE_SIZE = 10;
    static DB_GAME_ID = "card";

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
        // this.context;

        window.sortable = new Sortable(playCardSetShowColumns, {
            group: 'play-card-set-columns',
            animation: 200,
            ghostClass: 'sortable-ghost',
            onEnd: this.onSettingsColumnMove.bind(this)
        });

        new Sortable(playCardSetRandomColumns, {
            group: 'play-card-set-columns',
            animation: 200,
            ghostClass: 'sortable-ghost',
            onEnd: this.onSettingsColumnMove.bind(this)
        });

        new Sortable(playCardSetAskColumns, {
            group: 'play-card-set-columns',
            animation: 200,
            ghostClass: 'sortable-ghost',
            onEnd: this.onSettingsColumnMove.bind(this)
        });

        new Sortable(playCardSetHideColumns, {
            group: 'play-card-set-columns',
            animation: 200,
            ghostClass: 'sortable-ghost',
            onEnd: this.onSettingsColumnMove.bind(this)
        });

        this.globalNavigation = new GlobalNavigation(playCardPageView);
        this.globalNavigation.onnext = this.nextCard.bind(this);
        this.globalNavigation.onprevious = this.previousCard.bind(this);

        playCardCard.onclick = this.turnCard.bind(this);
        playCardShuffleButton.onclick = e => {
            playCardShuffleButton.blur(); // stop focus in order to prevent getting the click event again when pressing space
            this.setShuffle(!this.context.shuffleData);
        };

        playCardSettingsButton.onclick = e => {
            playCardSettingsButton.blur(); // stop focus in order to prevent getting the click event again when pressing space
            this.showSettings();
        }

        playCardSetNbColRandom.onchange = this.onNumberColumnRandomChange.bind(this);
        playCardSetRandomSide.onchange = this.onSettingsRandomSideChanged.bind(this);
        playCardSetColumnName.onchange = this.onSettingsColumnNameChanged.bind(this);
        playCardSetReset.onclick = () => {
            hideModal('play-card-settings');
            this.reset()
        };
    }

    /* when the page is loaded */
    onload() {
        setPageTitle(currentTest.title);
        playCardPageView.classList.remove('hide');

        const request = DATABASE_MANAGER.getPlayContext(currentTest.id, PlayCardPage);
        request.onsuccess = this.initialiseContextFromDB.bind(this);
        request.onerror = this.initialiseContext.bind(this);
    }

    onvisibilitychange() {
        if (document.hidden) {
            // save the context
            DATABASE_MANAGER.updatePlayContext(this.context);
        }
    }

    ondelete() {
        DATABASE_MANAGER.updatePlayContext(this.context);
        this.context = null; // save memory
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

            case KeyboardEvent.DOM_VK_ESCAPE:
                if (currentModal) {
                    hideModal(currentModal);
                } else {
                    backToMain(true);
                }
                event.preventDefault();
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
            columnsHide: [],
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
            } else {
                this.context.columnsHide.push(i);
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
        this.setShuffle(this.context.shuffleData);
        DATABASE_MANAGER.addPlayContext(this.context, PlayCardPage);
    }

    /* initialise the context from the db */
    initialiseContextFromDB(event) {
        var cursor = event.target.result;
        if (cursor) {
            this.context = cursor.value;
            this.initialise();
            this.updateCard(this.context.index, false);
        } else {
            this.initialiseContext();
        }
    }

    /* initialise the UI from the context */
    initialise() {
        if (this.context.index < currentTest.data.length)
            playCardProgress.setProgress(this.context.index / (currentTest.data.length - 1), true);
        else
            playCardProgress.setProgress(1, true);
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

            // keep selected columns of the current card
            var selected = this.getSelectedColumns(this.context.index);
            selected.unshift(0);
            this.context.columnsCache = [selected];
        } else {
            this.context.data = randomShuffledNumberList(currentTest.data.length);
        }
        if (this.context.index < this.context.data.length) this.updateCard(0);
    }

    /* initialise context.data so it is in order */
    notShuffledData() {
        var index = this.context.data[this.context.index];
        this.context.data = [];
        for (var i = 0; i < currentTest.data.length; i++) {
            this.context.data.push(i);
        }
        // keep selected columns of the current card
        var selected = this.getSelectedColumns(this.context.index);
        selected.unshift(index);
        this.context.columnsCache = [selected];
        if (this.context.index < this.context.data.length) {
            this.updateCard(index);
        }
    }

    /* set the shuffle of the data or not */
    setShuffle(shuffle) {
        this.context.shuffleData = shuffle;
        if (shuffle) {
            playCardShuffleButtonImage.src = '/WebDiakoluo/res/img/shuffle_on.svg';
            this.shuffleData(0 <= this.context.index && this.context.index < this.context.data.length);
        } else {
            playCardShuffleButtonImage.src = '/WebDiakoluo/res/img/shuffle.svg';
            this.notShuffledData();
        }
    }

    /* get the selected columns to show / ask from cache or generate new */
    getSelectedColumns(index) {
        for (var i = this.context.columnsCache.length - 1; i >= 0; i--) {
            if (this.context.columnsCache[i][0] === index)
                return [this.context.columnsCache[i][1], this.context.columnsCache[i][2]]
        }

        // generate new
        var columnsRandomShow = [];
        var columnsRandomShowSorted = [];
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
            else {
                columnsRandomShowSorted.push(i);
            }
        }

        if (this.context.randomSide && Math.random() >= .5) {
            columnsShow = this.context.columnsAsk.concat(columnsAsk);
            columnsAsk = this.context.columnsShow.concat(columnsRandomShowSorted);
        } else {
            columnsShow = this.context.columnsShow.concat(columnsRandomShowSorted);
            columnsAsk = this.context.columnsAsk.concat(columnsAsk);
        }

        if (this.context.columnsCache.push([index, columnsShow, columnsAsk]) > PlayCardPage.MAX_CACHE_SIZE)
            this.context.columnsCache.shift();

        return [columnsShow, columnsAsk];
    }

    /* update the card at the index i, and show a face. resetSide: if the function should reset the side shown (used when the whole UI should reset) */
    updateCard(i, resetSide = true) {
        this.context.index = i;
        if (resetSide) this.context.showOtherside = false;
        this.globalNavigation.updateStatus(i <= 0 && this.context.shuffleData ? 1 : 0);
        
        if (i < this.context.data.length) {
            playCardProgress.setText(i + 1 + '/' + currentTest.data.length);
            playCardProgress.setProgress(i / (currentTest.data.length - 1));
        } else {
            i = currentTest.data.length;
            playCardProgress.setText(i + '/' + i);
            playCardProgress.setProgress(1);
        }
        this.updateUI();
    }

    /* update the UI of the card */
    updateUI() {
        if (this.cardChild) {
            playCardCard.removeChild(this.cardChild);
            this.cardChild = null;
        }

        if (this.context.index < this.context.data.length) {
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
                    e.textContent = column.name + ' :';
                    div.appendChild(e);

                    div.appendChild(column.getCardView(data));                

                    this.cardChild.appendChild(div);
                }  else {
                    this.cardChild.appendChild(column.getCardView(data));                
                }
            }
        } else {
            // show the restart panel
            this.cardChild = playCardRestartTemplate.content.cloneNode(true).children[0];
            this.cardChild.querySelector('#play-card-home-button').onclick = () => backToMain(true);
            this.cardChild.querySelector('#play-card-view-button').onclick = () => viewTestPage(currentTest.id);
            this.cardChild.querySelector('#play-card-restart-button').onclick = this.nextCard.bind(this);
            this.cardChild.querySelector('#play-card-grade-button').onclick = PAGES.view.evalTest;
        }
        
        playCardCard.appendChild(this.cardChild);
    }

    /* turn the card to see the other side */
    turnCard() {
        this.context.showOtherside = !this.context?.showOtherside ?? false;
        this.updateUI();
    }

    /* go to the next card */
    nextCard() {
        if (this.context.index < this.context.data.length - 1) {
            this.updateCard(this.context.index + 1);
        } else if (this.context.index < this.context.data.length) {
            this.context.index = this.context.index + 1;
            this.updateUI();
        } else {
            this.reset();
        }
    }

    /* go to the previous card */
    previousCard() {
        if (this.context.index > 0) {
            this.updateCard(this.context.index - 1);
        } else if (!this.context.shuffleData) {
            this.updateCard(this.context.data.length - 1);
        }
    }

    /* reset and start a new context */
    reset() {
        if (this.context.shuffleData) {
            this.shuffleData(this.context.index < currentTest.data.length - 1);
            this.updateCard(0);
        } else {
            this.updateCard(0);
        }
    }

    /* show the settings modal */
    showSettings() {
        showModal(currentModal = 'play-card-settings');

        removeAllChildren(playCardSetShowColumns);
        removeAllChildren(playCardSetRandomColumns);
        removeAllChildren(playCardSetAskColumns);
        removeAllChildren(playCardSetHideColumns);

        var e;
        for (var i = 0; i < this.context.columnsShow.length; i++) {
            e = document.createElement('div');
            e.classList = 'play-card-set-col-child';
            e.textContent = currentTest.columns[this.context.columnsShow[i]].name;
            playCardSetShowColumns.appendChild(e);
        }

        for (var i = 0; i < this.context.columnsRandom.length; i++) {
            e = document.createElement('div');
            e.classList = 'play-card-set-col-child';
            e.textContent = currentTest.columns[this.context.columnsRandom[i]].name;
            playCardSetRandomColumns.appendChild(e);
        }

        for (var i = 0; i < this.context.columnsAsk.length; i++) {
            e = document.createElement('div');
            e.classList = 'play-card-set-col-child';
            e.textContent = currentTest.columns[this.context.columnsAsk[i]].name;
            playCardSetAskColumns.appendChild(e);
        }

        for (var i = 0; i < this.context.columnsHide.length; i++) {
            e = document.createElement('div');
            e.classList = 'play-card-set-col-child';
            e.textContent = currentTest.columns[this.context.columnsHide[i]].name;
            playCardSetHideColumns.appendChild(e);
        }

        this.updateBoundColumnsRandom();

        playCardSetRandomSide.checked = this.context.randomSide;
        playCardSetColumnName.checked = this.context.showColumnName;
    }

    /* update the bounds of the random columns input */
    updateBoundColumnsRandom() {
        playCardSetNbColRandom.min = 0;
        playCardSetNbColRandom.max = this.context.columnsRandom.length;
        this.context.nbColumnsRandom = clamp(this.context.nbColumnsRandom, 0, this.context.columnsRandom.length);
        playCardSetNbColRandom.value = this.context.nbColumnsRandom;
    }

    /* when the input of random columns is changed */
    onNumberColumnRandomChange() {
        if (0 <= playCardSetNbColRandom.value && playCardSetNbColRandom.value <= this.context.columnsRandom.length) {
            this.context.nbColumnsRandom = playCardSetNbColRandom.value;
            this.resetCache();
        }
    }

    /* when a column is moved */
    onSettingsColumnMove(event) {
        var fromList = this.context[event.from.getAttribute('column-list')];
        var toList = this.context[event.to.getAttribute('column-list')];
        var data = fromList[event.oldDraggableIndex];
        fromList.splice(event.oldDraggableIndex, 1);
        toList.splice(event.newDraggableIndex, 0, data);

        if (event.from === playCardSetRandomColumns || event.to === playCardSetRandomColumns) {
            this.updateBoundColumnsRandom();
        }

        this.resetCache();
    }

    /* when the settings random side is changed */
    onSettingsRandomSideChanged() {
        this.context.randomSide = playCardSetRandomSide.checked;
        this.resetCache();
    }


    /* when the settings random side is changed */
    onSettingsColumnNameChanged() {
        this.context.showColumnName = playCardSetColumnName.checked;
        this.updateCard(this.context.index);
    }

    /* reset the columns cache but preserver the current card */
    resetCache() {
        // preserve current columns selected cache
        if (this.context.index < this.context.data.length) {
            var data = this.getSelectedColumns(this.context.index);
            data.unshift(this.context.index);
            this.context.columnsCache = [data];
        } else {
            this.context.columnsCache = [];
        }
    }
}

PAGES.play_card = new PlayCardPage();