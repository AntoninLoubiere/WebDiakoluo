const MARK_20_FORMATER = new Intl.NumberFormat(navigator.language, {
    minimumIntegerDigits: 1,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
});

const MARK_100_FORMATER = new Intl.NumberFormat(navigator.language, {
    style: "percent",
    minimumIntegerDigits: 1,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});


const evalScoreView = document.getElementById('eval-score-page');
const evalScoreProgress = document.getElementById('eval-score-progress');
const evalScoreMajor = document.getElementById('eval-score-major');
const evalScoreMinor = document.getElementById('eval-score-minor');

class EvalScorePage extends Page {
    constructor() {
        super(evalScoreView, 'eval-score', true);
        document.getElementById('eval-score-restart').onclick = loadPage;
        document.getElementById('eval-score-menu').onclick = () => backToMain(false);
    }

    onload() {
        evalScoreView.classList.remove('hide');
        evalScoreProgress.setProgress(0, true);
    }

    setScore(scoreContext) {
        setTimeout(() => evalScoreProgress.setProgress(scoreContext.score / scoreContext.max), 500);

        evalScoreMajor.textContent = this.format20(scoreContext.score, scoreContext.max);
        evalScoreMinor.textContent = this.formatNormal(scoreContext.score, scoreContext.max);
    }

    format20(score, max) {
        return MARK_20_FORMATER.format(score / max * 20) + ' / 20'; 
    }

    format100(score, max) {
        return MARK_100_FORMATER.format(score / max); 
    }

    formatNormal(score, max) {
        return score + ' / ' + max;
    }
}

const evalScorePage = new EvalScorePage(); // internal page, not accesible via URL