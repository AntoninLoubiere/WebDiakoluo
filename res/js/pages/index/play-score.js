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


const playScoreView = document.getElementById('play-score-page');
const playScoreProgress = document.getElementById('play-score-progress');
const playScoreMajor = document.getElementById('play-score-major');
const playScoreMinor = document.getElementById('play-score-minor');

class PlayScorePage extends Page {
    constructor() {
        super(playScoreView, 'play-score', true);
        document.getElementById('play-score-restart').onclick = loadPage;
        document.getElementById('play-score-menu').onclick = () => backToMain(false);
    }

    onload() {
        playScoreView.classList.remove('hide');
    }

    setScore(scoreContext) {
        playScoreProgress.value = scoreContext.score / scoreContext.max;

        playScoreMajor.textContent = this.format20(scoreContext.score, scoreContext.max);
        playScoreMinor.textContent = this.formatNormal(scoreContext.score, scoreContext.max);
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

const playScorePage = new PlayScorePage(); // internal page, not accesible via URL