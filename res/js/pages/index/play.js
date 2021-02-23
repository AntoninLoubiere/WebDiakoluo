const playPageView = document.getElementById('play-page');

const playPageTestTitle = document.getElementById('play-test-title');
const playPageInputs = document.getElementById('play-inputs');
const playPageContinueButtonText = document.getElementById('play-continue-button-text');

const playProgressBar = document.getElementById('play-progress');
const playProgressIndex = document.getElementById('play-progress-index');
const playProgressMax = document.getElementById('play-progress-max');

/* A score context that hold the score of the session */
class ScoreContext {
    /* initialise */
    constructor() {
        this.score = 0;
        this.max = 0;
    }

    /* start a new session */
    reset() {
        this.score = 0;
        this.max = 0;
    }

    /* add a score */
    pushScore(score, max) {
        this.score += score;
        this.max += max;
    }
}

class PlayPage extends Page {
    constructor() {
        super(playPageView, "play", true);

        // define test context
        this.dataNumberToDo = null;
        this.currentIndex = null;
        this.dataIndexes = null;
        this.answerIsShow = false;
        this.numberColumns = null;
        this.columnsAsked = null;
        this.score = new ScoreContext();
    }

    onload() {
        this.dataNumberToDo = currentURL.searchParams.get("data")?.split('-') ?? [];
        this.numberColumns = Number(currentURL.searchParams.get("columns"));

        if (!Number.isInteger(this.numberColumns)) {
            backToMain();
            return;
        }

        if (this.dataNumberToDo.length == 1) {
            this.dataNumberToDo = clamp(Number(this.dataNumberToDo[0]), 1, currentTest.data.length);
            if (!this.dataNumberToDo) {
                backToMain();
                return;
            }
        } else if (this.dataNumberToDo.length >= 2) {
            this.dataNumberToDo = [Number(this.dataNumberToDo[0]), Number(this.dataNumberToDo[1])]
            if (this.dataNumberToDo[0] && this.dataNumberToDo[1]) {
                this.dataNumberToDo = clamp(
                    Math.round(this.dataNumberToDo[0] * currentTest.data.length / this.dataNumberToDo[1]),
                    1, currentTest.data.length
                );
            } else {
                backToMain();
                return;
            }
        } else {
            backToMain();
            return;
        }

        this.numberColumns = clamp(this.numberColumns, 1, currentTest.columns.length);

        this.currentIndex = 0;
        this.answerIsShow = false;
        this.dataIndexes = randomUniqueNumberList(this.dataNumberToDo, currentTest.data.length);

        this.score.reset();

        this.initialise();

        playPageView.classList.remove('hide');
        setPageTitle(currentTest.title);
    }

    /* when a key is press */
    onkeydown(event) {
        if (event.keyCode === KeyboardEvent.DOM_VK_RETURN) {
            this.submitCallback(event);
        }
    }

    /* initialise the UI */
    initialise() {
        removeAllChildren(playPageInputs);

        playPageTestTitle.textContent = currentTest.title;
        playProgressMax.textContent = this.dataNumberToDo;

        var e;
        for (var i = 0; i < currentTest.columns.length; i++) {
            e = document.createElement('h3');
            e.classList = ['no-margin'];
            e.textContent = currentTest.columns[i].name;
            playPageInputs.appendChild(e);
            playPageInputs.appendChild(document.createElement('div')); // setup a dummy element
        }
        this.update();
    }

    /* update the UI */
    update(applyScore = false) {
        var row = currentTest.data[this.dataIndexes[this.currentIndex]];
        
        if (this.answerIsShow) {
            var score = applyScore ? this.score : null;
            for (var i = 0; i < currentTest.columns.length; i++) {
                if (this.columnsAsked[i]) {
                    playPageInputs.replaceChild(
                        currentTest.columns[i].updateAnswerTestView(
                            row[i],  
                            playPageInputs.children[i * 2 + 1],
                            score),
                        playPageInputs.children[i * 2 + 1]
                    );
                }                
            }
            playPageContinueButtonText.setAttribute('key', 'continue');
            playProgressBar.value = (this.currentIndex + 1) / this.dataNumberToDo;
            playProgressIndex.textContent = this.currentIndex + 1; // humanify
        } else {
            this.columnsAsked = new Array(currentTest.columns.length).fill(true);
            var i = this.numberColumns;
            var j;
            while (i > 0) {
                j = randint(currentTest.columns.length);
                if (this.columnsAsked[j]) {
                    i--;
                    this.columnsAsked[j] = false;
                }
            }

            for (var i = 0; i < currentTest.columns.length; i++) {
                if (this.columnsAsked[i]) {
                    playPageInputs.replaceChild(currentTest.columns[i].getTestView(row[i]), playPageInputs.children[i * 2 + 1]);
                } else {
                    playPageInputs.replaceChild(currentTest.columns[i].getViewView(row[i]), playPageInputs.children[i * 2 + 1]);
                }
            }
            playPageContinueButtonText.setAttribute('key', 'valid');
            var i = 0;
            while (!this.columnsAsked[i] && ++i < currentTest.columns.length - 1) {}
            playPageInputs.children[i * 2 + 1].focus();
 
            playProgressBar.value = this.currentIndex / this.dataNumberToDo;
            playProgressIndex.textContent = this.currentIndex + 1; // humanify
        }
    }

    /* callback for the submit form */
    submitCallback(event) {
        event.preventDefault();

        if (this.answerIsShow) {
            this.answerIsShow = false;
            if (++this.currentIndex >= this.dataNumberToDo) {
                playScorePage.setScore(this.score);
                setPage(playScorePage);
            } else {
                this.update();
            }
        } else {
            this.answerIsShow = true;
            this.update(true);
        }
    }
}

PAGES.play = new PlayPage();