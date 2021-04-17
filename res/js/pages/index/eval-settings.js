const evalSetPageView = document.getElementById('eval-settings-page');

const evalSetPageTestTitle = document.getElementById('eval-set-test-title');
const evalSetPageStartButton = document.getElementById('eval-set-start-button');

const evalSetPageNumberData = document.getElementById('eval-set-number-data');
const evalSetPageNumberColumns = document.getElementById('eval-set-number-column');
const evalSetPageNumberColumnsMax = document.getElementById('eval-set-number-column-max');

class EvalSettingsPage extends Page {

    constructor() {
        super(evalSetPageView, "eval-settings", true);
        this.currentTestId = -1;

        document.getElementById('eval-set-form').onsubmit = this.evalTest.bind(this);
    }

    onload() {
        if (!currentTest.isPlayable()) {
            backToMain(); // TODO dialog
            return;
        } 

        evalSetPageTestTitle.textContent = currentTest.title;

        this.setMinMaxColumns();

        var maxData = currentTest.data.length;
        var d;
        for (var i = 0; i < evalSetPageNumberData.options.length; i++) {
            d = Number(evalSetPageNumberData.options[i].value);
            if (d && d > maxData) {
                evalSetPageNumberData.options[i].disabled = true;
            }
        }

        evalSetPageView.classList.remove('hide');
        I18N.setPageTitle(currentTest.title);
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

        evalSetPageNumberColumns.min = min;
        evalSetPageNumberColumns.max = max;
        evalSetPageNumberColumnsMax.textContent = columnCount;
    }

    /* eval the test */
    evalTest(event) {
        event.preventDefault(); // prevent send of form
        
        currentURL.searchParams.set("page", "eval");
        currentURL.searchParams.set("data", evalSetPageNumberData.value);
        currentURL.searchParams.set("columns", evalSetPageNumberColumns.value);
        history.pushState({}, "Eval", currentURL);
        loadPage();
    }
}

PAGES.eval_settings = new EvalSettingsPage();