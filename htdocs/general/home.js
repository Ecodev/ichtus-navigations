﻿//options
import {createProgressBar} from '../cahier/top.js';
import {createAllPropositions} from '../infos/infos.js';
import {loadBottoms} from '../page/bottom.js';
import {loadMateriel} from '../equipment/categories.js';
import {popUser} from '../member/user.js';
import {loadTableTopBars} from '../cahier/cahier.js';
import {loadCahierEquipmentChoice} from '../equipment/choice.js';
import {currentTabElement, setCurrentTabElement, tabs} from './screen.js';
import {Requests, ServerInitialize} from './server-requests.js';
import {Cahier} from '../cahier/methods.js';

export const options = {
    bookablesComment: false,
    statsButtonTextActive: false,
    showRemarks: true,
    automaticConnexion: true,
    seeExtraInfos: false,
    //    reloadWhenFinished: false,
    bookingsTogetherWithDifferentEndates: true,
    modifyBookablesButton: true,
    editBookingButton: true,
    finishAllBookingsWithBookable: false, // si créer une sortie avec une embarcation déjà utilisée, ça termine seulement le booking avec l'embarcation utilisée de M. Uti.
    showAlertBookablesNotAvailable: false,
    showAlertNoWelcomeSession: true,
    minutesToEditBooking: 60, // after Fred's request
    lateHourWarning: 19, // starting from 19:00
    displayTerminatedEditedBookings: false, // don't show bookings that last 0 seconds
}; //showMetadatas: false,

// shortcut
export function $(id) {
    return document.getElementById(id);
}

// createElements
export function div(loc) {
    let x = document.createElement('div');
    loc.appendChild(x);
    return x;
}

export function input(loc, _placeholder = '') {
    let x = document.createElement('input');
    x.autocomplete = 'off';
    x.type = 'text';
    x.spellcheck = false;
    x.placeholder = _placeholder;
    loc.appendChild(x);
    return x;
}

function br(loc) {
    let x = document.createElement('br');
    loc.appendChild(x);
}

//Load
export function load() {
    setCurrentTabElement($('divTabCahier'));
    actualizeTime();
    setInterval(actualizeTime, 5000); //5 secondes
    createProgressBar();
    createAllPropositions();
    window.location = '#' + 'divTabCahier';
    loadReturnButtons();
    popUser(0, $('divTabCahierMemberContainer'));

    loadTableTopBars();
    loadCahierEquipmentChoice();
    loadEscListener();

    let version = '1.5';
    if (window.location.hostname === 'navigations.ichtus.club') {
        console.warn('Version de production ' + version);
        $('divTopBarText').innerHTML = tabs[0].title;
    } else {
        console.warn('Version de démo ' + version);
        tabs[0].title = 'Cahier de sortie (démo)';
        $('divTopBarText').innerHTML = tabs[0].title;
    }

    //SERVER
    ServerInitialize();
    Requests.checkLogin();

    //LOAD
    loadBottoms();
    loadMateriel();
}

// auto actualize if mouse doesn't move
let timeout;

function setTimeoutMove() {
    //console.log("start timeout");
    clearTimeout(timeout);
    timeout = setTimeout(
        function () {
            if (currentTabElement.id === 'divTabCahier') location.reload();
            else Requests.getActualBookingList();
        },
        1 * 60 * 1000,
    );
}

setTimeoutMove();

document.onmousemove = function () {
    setTimeoutMove();
};

// could be improved...
let Time = {
    getActualMinutes: function (m = date.getMinutes()) {
        let x;
        if (m < 10) {
            x = '0' + m;
        } else {
            x = m.toString();
        }
        return x;
    },
};

Date.prototype.getNiceTime = function (separator = ':', addZero = false) {
    if (addZero == true && this.getHours() < 10) {
        return Time.getActualMinutes(this.getHours()) + separator + Time.getActualMinutes(this.getMinutes());
    } else {
        return this.getHours() + separator + Time.getActualMinutes(this.getMinutes());
    }
};
Date.prototype.getNiceDate = function (substr = false, year = false) {
    let r = '';
    if (substr) {
        let month = Mois[this.getMonth()];
        if (month.length > 4) month = month.substring(0, 3);
        r = Jours[this.getDay()] + ' ' + this.getDate() + ' ' + month;
    } else {
        r = Jours[this.getDay()] + ' ' + this.getDate() + ' ' + Mois[this.getMonth()];
    }
    if (year) {
        r += ' ' + this.getFullYear();
    }
    return r;
};

Date.prototype.getPreviousDate = function () {
    let yesterday = new Date(this);
    yesterday.setDate(this.getDate() - 1);
    return yesterday;
};

export function deltaTime(d1, d2 = new Date(), bold = true) {
    let delta = Math.abs(d2.getTime() - d1.getTime()) / 1000 / 60; // in minutes
    let t = '';

    if (delta < 1) t = "à l'instant";
    // [0;1[
    else if (delta < 3) t = 'il y a 2min';
    // [1;3[
    else if (delta < 7) t = 'il y a 5min';
    // [3;7[
    else if (delta < 13) t = 'il y a 10min';
    // [7;13[
    else if (delta < 22.5) t = 'il y a 15min';
    // [13;22.5[
    else if (delta < 37.5) t = 'il y a 30min';
    // [22.5;37.5[
    else if (delta < 52.5) t = 'il y a 45min';
    // [37.5;52.5[
    else if (delta * 60 < 1.25) t = 'il y a 1h';
    // [52.5;1.25[
    else if (delta * 60 < 1.75) t = 'il y a 1.5h';
    // [1.25;1.75[
    else if (delta * 60 < 2.5) t = 'il y a 2h';
    // [1.75;2.5[
    else if (delta * 60 < 3) t = 'il y a 3h';
    // [2.5;3[
    else t = 'il y a plus de 3 h'; // [3;+inf[

    // console.log("bold:", bold, "delta<13:", delta, "t:", t);

    return bold && delta < 13 ? {text: '<b>' + t + '</b>', time: delta} : {text: t, time: delta};
}

export function deleteObjects() {
    for (let i = 0; i < arguments.length; i++) {
        if (
            typeof arguments[i] != 'undefined' &&
            typeof arguments[i].parentElement != 'undefined' &&
            arguments[i].parentElement != null
        ) {
            arguments[i].parentElement.removeChild(arguments[i]);
        } else {
            //console.log("tried to delete a non-existent object");
        }
    }
}

//Time
let date;
export const Jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const Mois = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
];

function actualizeTime() {
    date = new Date();
    $('divTopBarTime').innerHTML = date.getNiceTime() + '<br/>' + date.getNiceDate(true); //.substring(0, 3)
}

// NOt USED ANYMORE
// 1 -> checked //  0 --> not
//function check(checkParent) {
//    if (checkParent.getElementsByClassName('checkBox')[0].id == undefined || checkParent.getElementsByClassName('checkBox')[0].id == 1) {
//        checkParent.getElementsByClassName('checkBox')[0].id = 0;
//        checkParent.getElementsByClassName('checkBox')[0].style.backgroundImage = 'none';
//    }
//    else {
//        checkParent.getElementsByClassName('checkBox')[0].id = 1;
//        checkParent.getElementsByClassName('checkBox')[0].style.backgroundImage = 'url(img/icons/check-black.png)';
//    }
//}

function loadReturnButtons() {
    let allReturnButtons = document.getElementsByClassName('ReturnButtons');
    for (let i = 0; i < allReturnButtons.length; i++) {
        allReturnButtons[i].title = 'Retour';
    }
}

// Modals
let lastModals = 0;

export function openPopUp() {
    let modal = div(document.body);
    modal.onclick = function (event) {
        closePopUp(event);
    };
    lastModals++;
    modal.id = 'divModal' + lastModals;
    modal.classList.add('Modals');
    modal.style.display = 'block';
    setTimeout(function () {
        modal.style.opacity = 1;
    }, 10);

    $('divScreen').classList.add('Blur');
    $('divTopBar').classList.add('Blur');

    return modal;
}

export function closePopUp(e) {
    let t = false;
    if (e == 'last') {
        if (lastModals != 0) {
            t = true;
        }
    } else if (e.target.id.indexOf('divModal') != -1) {
        t = true;
    }
    if (t) {
        let modal = $('divModal' + lastModals);
        modal.style.opacity = 0;
        setTimeout(function () {
            modal.style.display = 'none';
            modal.innerHTML = '';
            modal.parentNode.removeChild(modal);
        }, 100);

        lastModals--;

        if (lastModals == 0) {
            $('divScreen').classList.remove('Blur');
            $('divTopBar').classList.remove('Blur');
        }
    }
}

function loadEscListener() {
    document.body.addEventListener('keydown', function (event) {
        if (event.keyCode == 27) {
            //console.log("ESC");
            closePopUp('last');
        }
    });
}

function waiting() {
    document.body.classList.add('waiting');
}

export function stopWaiting() {
    document.body.classList.remove('waiting');
}

String.prototype.pixelLength = function (_fontSize = 20) {
    let c = document.createElement('span');
    document.body.appendChild(c);
    c.innerHTML = this;
    c.style.fontSize = _fontSize + 'px';
    let length = c.offsetWidth;
    document.body.removeChild(c);
    return length;
};

String.prototype.shorten = function (maxLength, _fontSize = 20) {
    let txt = this;
    if (this == '' || txt.pixelLength(_fontSize) <= maxLength) {
        return this;
    }
    while ((txt + '...').pixelLength(_fontSize) > maxLength - '...'.pixelLength(_fontSize) && txt.length > 0) {
        txt = txt.substr(0, txt.length - 1);
    }
    return txt + '...';
};

export function grayBar(elem, marginTop = 10, marginBottom = 15) {
    let d = div(elem);
    d.style.backgroundColor = 'lightgray';
    d.style.height = '2px';
    d.style.marginBottom = marginBottom + 'px';
    d.style.marginTop = marginTop + 'px';
    d.borderRadius = '2px';
    return d;
}

String.prototype.replaceTxtByTxt = function (replace = '', by = '', caseSensitive = false) {
    let i = 0;
    let where = [];

    let txt = caseSensitive ? this : this.toUpperCase();
    let replaceTxt = caseSensitive ? replace : replace.toUpperCase();

    while (txt.indexOf(replaceTxt, i) !== -1) {
        where.push(txt.indexOf(replaceTxt, i));
        i = where[where.length - 1] + 1;
    }

    let r = '';
    for (let k = 0; k <= where.length; k++) {
        let start = k === 0 ? 0 : where[k - 1];
        let end = k === where.length ? this.length : where[k];
        let s = this.slice(start, end);
        let sTxt = caseSensitive ? s : s.toUpperCase();
        let x = sTxt.indexOf(replaceTxt);
        let t = x !== -1 ? s.slice(0, x) + by + s.slice(x + replace.length) : s;
        r += t;
    }
    return r;
};

// ARRAY PROTOTYPES
Array.prototype.switch = function (i1, i2) {
    let content_i1 = this[i1];
    this.splice(i1, 1, this[i2]);
    this.splice(i2, 1, content_i1);
    return this;
};

Array.prototype.inverse = function (i1, i2) {
    for (let i = i1; i < parseInt((i1 + i2) / 2 + 0.5); i++) {
        this.switch(i, i1 + i2 - i);
    }
    return this;
};
Array.prototype.findIndex = function (x) {
    let index = -1;
    for (let i = 0; i < this.length; i++) {
        if (this[i] == x) {
            index = i;
            break;
        }
    }
    return index;
};

Array.prototype.deleteMultiples = function () {
    let r = [];
    for (let i = 0; i < this.length; i++) {
        if (r.findIndex(this[i]) === -1) {
            r.push(this[i]);
        }
    }
    return r;
};

// sortBy
Array.prototype.sortBy = function (sortFields, order = 1) {
    if (order == 'ASC') {
        order = -1;
    } else if (order == 'DESC') {
        order = 1;
    }

    let switching = true;
    while (switching) {
        switching = false;
        for (let i = 0; i < this.length - 1; i++) {
            if (
                (sortFields[i] > sortFields[i + 1] && order == 1) ||
                (sortFields[i] < sortFields[i + 1] && order == -1)
            ) {
                //
                this.switch(i, i + 1);
                sortFields.switch(i, i + 1);
                switching = true;
            }
        }
    }
};

// fillArray
Array.prototype.fillArray = function (length, what = 0) {
    for (let i = 0; i < length; i++) {
        this[i] = what;
    }
};

// merge and only takes the elements which are in every array
Array.prototype.mergeAND = function () {
    let send = [];
    for (let b = 0; b < this[0].length; b++) {
        let item = this[0][b];
        let c = 0;
        for (let r2 = 1; r2 < this.length; r2++) {
            if (this[r2].findIndex(item) != -1) {
                c++;
            }
        }
        if (c == this.length - 1) {
            send.push(item);
        }
    }
    return send;
};

// clone
Object.prototype.clone = function () {
    return JSON.parse(JSON.stringify(this));
};

// check if booking is a terminated edited booking (i.e. lasting 0 seconds)
export function is0second(booking) {
    return booking.startDate == booking.endDate;
}

function displayBooking(booking) {
    if (options.seeExtraInfos || options.displayTerminatedEditedBookings) return true;
    return !is0second(booking);
}

export function mutable(bookings) {
    return JSON.parse(JSON.stringify(bookings));
}

export function mergeBookings(bookings) {
    bookings = bookings.clone(); // clone

    // assert the bookings have decreasing startDates, i.e. bookings[i-1].startDate (newer) >= bookings[i].startDate (older)
    for (let i = 1; i < bookings.length; i++) {
        if (!(new Date(bookings[i].startDate) - new Date(bookings[i - 1].startDate) <= 0)) {
            console.warn(
                '[mergeBookings]: startDates:',
                bookings[i - 1].startDate,
                'is not >=',
                bookings[i].startDate,
                "aren't increasing !",
            );
        }
    }

    function canBeMerged(b1, b2) {
        if (b1.startDate != b2.startDate) return false;
        if (b1.owner?.id != b2.owner?.id) return false;
        if (b1.endDate != b2.endDate && !options.bookingsTogetherWithDifferentEndates) return false;
        if ((is0second(b1) && !is0second(b2)) || (!is0second(b1) && is0second(b2))) return false; // XOR
        return true;
    }

    function mergeComments(c1, c2) {
        let meaninglessComments = ['', 'Terminée automatiquement'];
        if (!meaninglessComments.includes(c1)) return c1;
        if (!meaninglessComments.includes(c2)) return c2;
        if (c1 != '') return c1;
        return c2;
    }

    let resultingBookings = [];

    while (bookings.length > 0) {
        let booking = bookings.pop();

        // should not be kept
        if (!displayBooking(booking)) continue;

        // find potential booking to merge it with
        // --> can only be merged with the last bookings of resultingBookings since the startDates are decreasing
        let merged = false;
        for (let r = resultingBookings.length - 1; r >= 0; r--) {
            if (new Date(booking.startDate) - new Date(resultingBookings[r].startDate) > 0) break;

            if (canBeMerged(booking, resultingBookings[r])) {
                // can be merged --> merge
                resultingBookings[r].bookables.push(
                    booking.bookable == null ? Cahier.personalBookable : booking.bookable,
                );
                resultingBookings[r].ids.push(booking.id);
                resultingBookings[r].participantCount += booking.participantCount;
                resultingBookings[r].endComment = mergeComments(resultingBookings[r].endComment, booking.endComment);
                merged = true;
                break;
            }
        }

        // Couldn't merge --> append
        if (!merged) {
            resultingBookings.push(booking);
            resultingBookings[resultingBookings.length - 1].ids = [booking.id];
            resultingBookings[resultingBookings.length - 1].bookables = [
                booking.bookable == null ? Cahier.personalBookable : booking.bookable,
            ];
        }
    }
    return resultingBookings;
}

// transformBookingsOld
function transformBookingsOld(_bookings) {
    if (_bookings.length == 0) return [];

    if (!displayBooking(_bookings[0])) return transformBookingsOld(_bookings.slice(1));

    let final = [];

    final.push(_bookings[0].clone());
    final[0].ids = [_bookings[0].id];

    if (_bookings[0].bookable == null) final[0].bookables = [Cahier.personalBookable];
    else final[0].bookables = [_bookings[0].bookable];

    for (let i = 1; i < _bookings.length; i++) {
        if (!displayBooking(_bookings[i])) continue;

        let canBeMerged =
            (is0second(_bookings[i]) && is0second(_bookings[i - 1])) ||
            (!is0second(_bookings[i]) && !is0second(_bookings[i - 1]));

        if (_bookings[i - 1].owner == null) {
            console.warn('Booking without owner :', _bookings[i - 1]);
        } else if (_bookings[i].owner == null) {
            if (i == _bookings.length - 1) {
                console.warn('Booking without owner :', _bookings[i]);
            }
        }

        // add bookable (find corresponding booking)
        else if (
            _bookings[i].startDate == _bookings[i - 1].startDate &&
            (options.bookingsTogetherWithDifferentEndates ||
                deltaTime(new Date(_bookings[i].endDate), new Date(_bookings[i - 1].endDate)).time < 1) && // si pas terminé en même temps -> sortie a été split
            _bookings[i].owner.id == _bookings[i - 1].owner.id &&
            canBeMerged
        ) {
            if (_bookings[i].bookable == null) {
                final[final.length - 1].bookables.push(Cahier.personalBookable);
            } else {
                final[final.length - 1].bookables.push(_bookings[i].bookable);
            }
            final[final.length - 1].ids.push(_bookings[i].id);
            final[final.length - 1].participantCount += _bookings[i].participantCount;
        }

        // new booking
        else {
            final.push(_bookings[i].clone());
            final[final.length - 1].ids = [_bookings[i].id];

            if (_bookings[i].bookable == null) {
                final[final.length - 1].bookables = [Cahier.personalBookable];
            } else {
                final[final.length - 1].bookables = [_bookings[i].bookable];
            }
        }
    }
    return final;
}
