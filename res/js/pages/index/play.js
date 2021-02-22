const playPageView = document.getElementById('play-page');

class PlayPage extends Page {
    constructor() {
        super(playPageView, "play", true);
    }

    onload() {
        playPageView.classList.remove('hide');
        setPageTitle(currentTest.title);

        var data = currentURL.searchParams.get("data")?.split('-') ?? [];
        var columns = Number(currentURL.searchParams.get("columns"));

        if (!Number.isInteger(columns)) {
            backToMain();
            return;
        }

        if (data.length == 1) {
            data = Number(data[0]);
            if (!data) {
                backToMain();
                return;
            }
        } else if (data.length >= 2) {
            data = [Number(data[0]), Number(data[1])]
            if (data[0] && data[1]) {
                data = clamp(
                    Math.round(data[0] * currentTest.data.length / data[1]),
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

        columns = clamp(columns, 1, currentTest.columns.length);
    }
}

PAGES.play = new PlayPage();