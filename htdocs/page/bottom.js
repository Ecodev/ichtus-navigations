function loadBottoms() {
    let allDivTabs = document.getElementsByClassName('divTab');

    while (document.getElementsByClassName('divSpacers').length !== 0) {
        DeleteObjects(document.getElementsByClassName('divSpacers')[0]);
    }
    while (document.getElementsByClassName('divBottoms').length !== 0) {
        DeleteObjects(document.getElementsByClassName('divBottoms')[0]);
    }

    // new bars
    for (let i = 0; i < allDivTabs.length; i++) {
        let s = div(allDivTabs[i]);
        s.className = 'divSpacers';

        let b = div(allDivTabs[i]);
        b.className = 'divBottoms';

        let divMonth = div(b);
        divMonth.onclick = function () {
            popStats();
        };
    }

    if (options.statsButtonTextActive) {
        let end = new Date(Date.now());
        let start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 1);

        Requests.getMonthlyBookingsNbr(start, end);
    } else {
        let all = document.getElementsByClassName('divBottoms');
        for (let j = 0; j < all.length; j++) {
            all[j].children[0].innerHTML = 'Voir les statistiques du mois';
        }
    }
}
