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
        this.numberColumnsRandomReveal = null;
        this.currentIndex = null;
        this.dataIndexes = null;
        this.answerIsShow = false;
        this.columnsAsked = null;
        this.score = new ScoreContext();
        this.playInputs = [];
        this.randomInputs = 0;
    }

    onload() {
        this.dataNumberToDo = currentURL.searchParams.get("data")?.split('-') ?? [];
        this.numberColumnsRandomReveal = Number(currentURL.searchParams.get("columns"));

        if (!Number.isInteger(this.numberColumnsRandomReveal)) {
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

        this.numberColumnsRandomReveal = clamp(this.numberColumnsRandomReveal, 0, currentTest.columns.length - 1);

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
        this.playInputs = [];
        this.randomInputs = 0;

        var show_only = 0;
        var ask_only = 0;

        var e;
        var c;
        var p;
        var set_show;
        var set_ask;
        var is_random;
        for (var i = 0; i < currentTest.columns.length; i++) {
            c = currentTest.columns[i];

            set_show = c.getSettings(Column.SET_CAN_BE_SHOW);
            set_ask = c.getSettings(Column.SET_CAN_BE_ASK);

            if (set_show || set_ask) {
                is_random = set_show && set_ask;
                e = document.createElement('h3');
                e.classList = ['no-margin'];
                e.textContent = c.name;
                playPageInputs.appendChild(e);
                e = document.createElement('div');
                this.playInputs.push(new PlayInput(i, c, e, set_show, set_ask, is_random));
                playPageInputs.appendChild(e); // setup a dummy element

                if (is_random) this.randomInputs++;
                else if (set_show) {
                    show_only++;
                }
                else {
                    this.numberColumnsRandomReveal--;
                    ask_only++;
                }
            }
        }

        this.numberColumnsRandomReveal = clamp(
            this.numberColumnsRandomReveal, 
            show_only ? 0 : 1,
            ask_only ? this.randomInputs : this.randomInputs - 1
        );

        this.update();
    }

    /* update the UI */
    update(applyScore = false) {
        var row = currentTest.data[this.dataIndexes[this.currentIndex]];
        
        if (this.answerIsShow) {
            var j = 0;
            var score = applyScore ? this.score : null;
            for (var i = 0; i < this.playInputs.length; i++) {
                if (this.playInputs[i].set_ask) {
                    if (!this.playInputs[i].is_random || this.columnsAsked[j++]) {
                        this.playInputs[i].showAnswer(row, score);
                    }
                }
                // if (this.columnsAsked[i]) {
                //     playPageInputs.replaceChild(
                //         currentTest.columns[i].updateAnswerTestView(
                //             row[i],  
                //             playPageInputs.children[i * 2 + 1],
                //             score),
                //         playPageInputs.children[i * 2 + 1]
                //     );
                // }                
            }
            playPageContinueButtonText.setAttribute('key', 'continue');
            playProgressBar.value = (this.currentIndex + 1) / this.dataNumberToDo;
            playProgressIndex.textContent = this.currentIndex + 1; // humanify
        } else {
            this.columnsAsked = new Array(currentTest.columns.length).fill(true);
            var i = this.numberColumnsRandomReveal;
            var j;
            while (i > 0) {
                j = randint(this.randomInputs);
                if (this.columnsAsked[j]) {
                    i--;
                    this.columnsAsked[j] = false;
                }
            }
            j = 0;
            for (var i = 0; i < this.playInputs.length; i++) {
                if (this.playInputs[i].is_random) {
                    if (this.columnsAsked[j++]) {
                        this.playInputs[i].ask(row);
                    } else {
                        this.playInputs[i].show(row);
                    }
                } else if (this.playInputs[i].set_ask) {
                    this.playInputs[i].ask(row);
                } else if (this.playInputs[i].set_show) {
                    this.playInputs[i].show(row);
                }
                // if (this.columnsAsked[i]) {
                //     playPageInputs.replaceChild(currentTest.columns[i].getTestView(row[i]), playPageInputs.children[i * 2 + 1]);
                // } else {
                //     playPageInputs.replaceChild(currentTest.columns[i].getViewView(row[i]), playPageInputs.children[i * 2 + 1]);
                // }
            }
            playPageContinueButtonText.setAttribute('key', 'valid');
            var i = 0;
            console.log(this.playInputs)
            while ((
                    (this.playInputs[i].is_random && !this.columnsAsked[j++]) || 
                    this.playInputs[i].set_ask) && 
                ++i < this.playInputs.length - 1) {}
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

class PlayInput {
    constructor(index, column, view, set_show, set_ask, is_random) {
        this.index = index;
        this.column = column;
        this.view = view;
        this.set_show = set_show;
        this.set_ask = set_ask;
        this.is_random = is_random;
    }

    /* ask the input */
    ask(row) {
        var e = this.column.getTestView(row[this.index]);
        playPageInputs.replaceChild(
            e,
            this.view
        );
        this.view = e;
    }

    /* show the input */
    show(row) {
        var e = this.column.getViewView(row[this.index]);
        playPageInputs.replaceChild(
            e,
            this.view
        );
        this.view = e;
    }

    /* show the answer */
    showAnswer(row, score) {
        var e = this.column.updateAnswerTestView(row[this.index], this.view, score);
        playPageInputs.replaceChild(
            e,
            this.view
        );
        this.view = e;
    }
}

PAGES.play = new PlayPage();