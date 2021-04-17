const evalPageView = document.getElementById('eval-page');

const evalPageTestTitle = document.getElementById('eval-test-title');
const evalPageInputs = document.getElementById('eval-inputs');
const evalPageContinueButtonText = document.getElementById('eval-continue-button-text');

const evalProgressBar = document.getElementById('eval-progress');

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

class EvalPage extends Page {
    constructor() {
        super(evalPageView, "eval", true);

        // define test context
        this.dataNumberToDo = null;
        this.numberColumnsRandomReveal = null;
        this.currentIndex = null;
        this.dataIndexes = null;
        this.answerIsShow = false;
        this.columnsAsked = null;
        this.score = new ScoreContext();
        this.evalInputs = [];
        this.randomInputs = 0;

        document.getElementById('eval-form').onsubmit = this.submitCallback.bind(this);
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

        evalPageView.classList.remove('hide');
        I18N.setPageTitle(currentTest.title);
    }

    /* when a key is press */
    onkeydown(event) {
        if (event.keyCode === KeyboardEvent.DOM_VK_RETURN) {
            this.submitCallback(event);
        }
    }

    /* initialise the UI */
    initialise() {
        removeAllChildren(evalPageInputs);

        evalPageTestTitle.textContent = currentTest.title;
        this.evalInputs = [];
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
                evalPageInputs.appendChild(e);
                e = document.createElement('div');
                this.evalInputs.push(new EvalInput(i, c, e, set_show, set_ask, is_random));
                evalPageInputs.appendChild(e); // setup a dummy element

                if (is_random) this.randomInputs++;
                else if (set_show) {
                    this.numberColumnsRandomReveal--;
                    show_only++;
                }
                else {
                    ask_only++;
                }
            }
        }

        this.numberColumnsRandomReveal = clamp(
            this.numberColumnsRandomReveal, 
            show_only ? 0 : 1,
            ask_only ? this.randomInputs : this.randomInputs - 1
        );
        
        evalProgressBar.setProgress(0); // reset the progress bar
        this.update(this);
    }

    /* update the UI */
    update(applyScore = false) {
        var row = currentTest.data[this.dataIndexes[this.currentIndex]];
        
        if (this.answerIsShow) {
            var j = 0;
            var score = applyScore ? this.score : null;
            for (var i = 0; i < this.evalInputs.length; i++) {
                if (this.evalInputs[i].set_ask) {
                    if (!this.evalInputs[i].is_random || this.columnsAsked[j++]) {
                        this.evalInputs[i].showAnswer(row, score);
                    }
                }           
            }
            evalPageContinueButtonText.setAttribute('key', 'continue');
            evalProgressBar.setProgress((this.currentIndex + 1) / this.dataNumberToDo);
            evalProgressBar.setText(this.currentIndex + 1 + '/' + this.dataNumberToDo); // humanify
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
            for (var i = 0; i < this.evalInputs.length; i++) {
                if (this.evalInputs[i].is_random) {
                    if (this.columnsAsked[j++]) {
                        this.evalInputs[i].ask(row);
                    } else {
                        this.evalInputs[i].show(row);
                    }
                } else if (this.evalInputs[i].set_ask) {
                    this.evalInputs[i].ask(row);
                } else if (this.evalInputs[i].set_show) {
                    this.evalInputs[i].show(row);
                }
            }
            evalPageContinueButtonText.setAttribute('key', 'valid');

            var i = 0;
            var j = 0;
            while (true) {
                if (this.evalInputs[i].is_random) {
                    if (this.columnsAsked[j++]) {
                        break;
                    }
                } else if (this.evalInputs[i].set_ask) {
                    break;
                }
                if (++i >= this.evalInputs.length) {
                    i = 0;
                    break;
                }
            }

            this.evalInputs[i].view.focus();
 
            evalProgressBar.setProgress(this.currentIndex / this.dataNumberToDo);
            evalProgressBar.setText(this.currentIndex + 1 + '/' + this.dataNumberToDo); // humanify
        }
    }

    /* callback for the submit form */
    submitCallback(event) {
        event.preventDefault();

        if (this.answerIsShow) {
            this.answerIsShow = false;
            if (++this.currentIndex >= this.dataNumberToDo) {
                evalScorePage.setScore(this.score);
                setPage(evalScorePage);
            } else {
                this.update();
            }
        } else {
            this.answerIsShow = true;
            this.update(true);
        }
    }
}

class EvalInput {
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
        evalPageInputs.replaceChild(
            e,
            this.view
        );
        this.view = e;
    }

    /* show the input */
    show(row) {
        var e = this.column.getViewView(row[this.index]);
        evalPageInputs.replaceChild(
            e,
            this.view
        );
        this.view = e;
    }

    /* show the answer */
    showAnswer(row, score) {
        var e = this.column.updateAnswerTestView(row[this.index], this.view, score);
        evalPageInputs.replaceChild(
            e,
            this.view
        );
        this.view = e;
    }
}

PAGES.eval = new EvalPage();