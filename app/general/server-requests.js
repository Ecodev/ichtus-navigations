var Server;
function ServerInitialize() {
    // Get the API
    Server = window.ichtusApi;
    //console.log('Server(API) = ', Server);
}


var Requests = {

    // login
    login: function (pwd) {

        //console.log("LOGIN");

        Server.userService.login({
            login: 'bookingonly',
            password: pwd

        }).subscribe(result => {

            closePopUp("last");

            //console.log("result of login :", result);

            if (result != null) {
                if (result.login == "bookingonly") {
                    Requests.isConnected();
                }
                else {
                    console.error("Mauvais utilisateur connecté... (" + user.name + ")");
                }
            }
            else {
                console.error("Problème d'authentification...");
            }
        });
    },


    // have to log in
    haveToLogin: function () {
        if (window.location.hostname === 'navigations.ichtus.club') {
            popLogin();
        }
        else {
            setTimeout(function () {
                Requests.login('bookingonly');
            }, 2000); // auto mdp, timeout to avoid overloading the server
        }
    },


    // is connected
    isConnected: function () {
        console.warn("Connecté à " + new Date().getNiceTime());
        Requests.getActualBookingList();
    },


    // actualizeLoginButton
    checkLogin: function () {
        Server.userService.getViewer().subscribe(function (user) {
            //console.log("user:", user);

            // pas connecté
            if (!user) {
                console.error("Pas connecté");
                Requests.haveToLogin();
            }
            // connecté
            else {
                if (user.login == "bookingonly") {
                    Requests.isConnected();
                }
                else {
                    console.error("Mauvais utilisateur connecté... (" + user.name + ")");
                    Requests.haveToLogin();
                }
            }
        });
    },


    // getUsersList FOR user.js
    getUsersList: function (text = "") {

        var filter;
        var texts = [];

        for (var i = 0; i < text.split(" ").length; i++) {
            if (text.split(" ")[i] != "") {
                texts.push(text.split(" ")[i]);
            }
        }

        var nbr = texts.length;
        if (nbr == 1) {

            filter = {
                filter: {
                    groups: [
                        {
                            conditionsLogic: "OR",
                            conditions: [
                                {
                                    firstName: {
                                        like: {
                                            value: '' + texts[0] + '%'
                                        }
                                    }
                                },
                                {
                                    lastName: {
                                        like: {
                                            value: '' + texts[0] + '%'
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            groupLogic: "AND",
                            conditions: [
                                {
                                    id: {
                                        equal: {
                                            value: "7083",
                                            not: true
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            groupLogic: "AND",
                            conditions: [
                                {
                                    status: { // status
                                        equal: {
                                            value: 'active'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        }
        else if (nbr == 2) {
            filter = {
                filter: {
                    groups: [
                        {
                            conditions: [
                                {
                                    firstName: {
                                        like: {
                                            value: '' + texts[0] + '%'
                                        }
                                    }
                                },
                                {
                                    lastName: {
                                        like: {
                                            value: '' + texts[1] + '%'
                                        }
                                    }
                                },
                                {
                                    id: {
                                        equal: {
                                            value: "7083",
                                            not: true
                                        }
                                    }
                                },
                                {
                                    status: { // status
                                        equal: {
                                            value: 'active'
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            groupLogic: "OR",
                            conditions: [
                                {
                                    firstName: {
                                        like: {
                                            value: '' + texts[1] + '%'
                                        }
                                    }
                                },
                                {
                                    lastName: {
                                        like: {
                                            value: '' + texts[0] + '%'
                                        }
                                    }
                                },
                                {
                                    id: {
                                        equal: {
                                            value: "7083",
                                            not: true
                                        }
                                    }
                                },
                                {
                                    status: { // status
                                        equal: {
                                            value: 'active'
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        }
        else {
            filter = {
                filter: {
                    groups: [{
                        conditions: [
                            {
                                custom: {
                                    search: {
                                        value: text
                                    }
                                }
                            },
                            {
                                id: {
                                    equal: {
                                        value: "7083",
                                        not: true
                                    }
                                }
                            },
                            {
                                status: { // status
                                    equal: {
                                        value: 'active'
                                    }
                                }
                            }
                        ]
                    }]
                }
            };
        }

        filter.pagination = {
            pageSize: 5,
            pageIndex: 0
        };
        filter.sorting = [{
            field: 'firstName',
            order: 'ASC'
        },
        {
            field: 'lastName',
            order: 'ASC'
        }];

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.userService.getAll(variables).subscribe(result => {
        //    console.log("getUsersList(): ", result);
            createSearchEntries(result.items);
        });
    },

    // getBookablesList
    getBookablesList: function (elem = $('inputTabCahierEquipmentElementsInputSearch')) {

        var order;
        if ($('divTabCahierEquipmentElementsSelectIconSort').style.backgroundImage == 'url("img/icons/sort-desc.png")') {
            order = "DESC";
        }
        else {
            order = "ASC";
        }

        var lastUse = false;
        var nbrBookings = false;
        var whichField = $('divTabCahierEquipmentElementsSelectSort').getElementsByTagName("select")[0].value;
        if (whichField == "lastUse") { whichField = "id"; lastUse = true; }
        if (whichField == "nbrBookings") { whichField = "id"; nbrBookings = true; }

        var txt = elem.value;

        var categorie = $('divTabCahierEquipmentElementsSelectCategorie').getElementsByTagName("select")[0].value;
        if (categorie == "all") { categorie = ""; }
        if (categorie == "Canoe_Kayak") { categorie = "Kayak"; }
        if (categorie == "Voile") { categorie = "Voile lestée"; }

        var f = {
            filter: {
                groups: [
                    {
                        groupLogic: 'AND',
                        conditionsLogic: 'OR',
                        conditions: [
                            {
                                custom: { // marche pour description
                                    search: {
                                        value: "%" + txt + "%"
                                    }
                                }
                            },
                            {
                                code: { // marche pour description
                                    like: {
                                        value: "%" + txt + "%"
                                    }
                                }
                            }
                        ]
                    },
                    {   //CATEGORIES...
                        groupLogic: 'AND',
                        conditionsLogic:'OR',
                        joins: {
                            bookableTags: {
                                type:"leftJoin",
                                conditions: [
                                    {
                                        name: {
                                            like: {
                                                value: "%" + categorie + "%"
                                            }
                                        }
                                    }
                                ]
                            }
                        }

                    },
                    {
                        groupLogic: 'AND',
                        conditionsLogic: 'AND',
                        conditions: [
                            {
                                bookingType: {
                                    like: {
                                        value: "self_approved"
                                    }
                                },
                                isActive: { // embarcation active
                                    equal: {
                                        value: true
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            sorting: [
                { field: whichField, order: order }
            ],
            pagination: {
                pageSize: parseInt($('divTabCahierEquipmentElementsSelectPageSize').getElementsByTagName('select')[0].value),
                pageIndex: 0
            }
        };

        if (categorie == "Kayak") {
            f.filter.groups[1].joins.bookableTags.conditions.push({
                name: {
                    like: {
                        value: "%" + "Canoë" + "%"
                    }
                }
            });
        }
        else if (categorie == "Voile lestée") {
            f.filter.groups[1].joins.bookableTags.conditions.push({
                name: {
                    like: {
                        value: "%" + "voile légère" + "%"
                    }
                }
            });
        }

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', f);

        Server.bookableService.getAll(variables).subscribe(result => {
            //console.log("getBookablesList(): ", result);

            if (result.items.length === 0) {
                console.log("NOTHING");
                loadElements([]);
            }
            else {

                var ids = [];
                for (let i = 0; i < result.items.length; i++) {
                    result.items[i].used = false;
                    ids.push(result.items[i].id);
                }

                var filter = {

                    filter: {
                        groups: [{
                            conditions: [
                                {
                                    endDate: {
                                        null: {
                                            not: false
                                        }
                                    }
                                }
                            ],
                            joins: {
                                    bookable: {
                                            type: "leftJoin",
                                            conditions: [
                                                {
                                                    id: {
                                                        in: {
                                                            values: ids
                                                        }

                                                    }
                                                }
                                            ]
                                    }
                            }

                        }]
                    }
                };
                var variables = new Server.QueryVariablesManager();
                variables.set('variables', filter);

                Server.bookingService.getAll(variables).subscribe(r => {

                    var bookables = result.items;
                    var bookings = r.items;

                    for (let i = 0; i < bookings.length; i++) {

                        for (let k = 0; k < bookables.length; k++) {
                            if (bookables[k].id === bookings[i].bookable.id) {
                                bookables[k].used = true;
                                bookables[k].lastBooking = bookings[i];
                            }
                        }

                        //console.log(r.items[i].bookable.id,r.items[i].bookable.name);
                    }
                    loadElements(bookables);
                });

            }


            //if (!lastUse && !nbrBookings || result.items.length == 0) {
            //    loadElements(result.items);
            //}
            //else if (lastUse) {

            //    var bookings = [];
            //    bookings.fillArray(result.items.length,"1111-01-02T13:32:51+01:00");

            //    for (var i = 0; i < result.items.length; i++) {

            //        var filter = {
            //            filter: {
            //                groups: [
            //                    { conditions: [{ bookable: { have: { values: [result.items[i].id] } } }] }
            //                ]
            //            },
            //            pagination: {
            //                pageSize: 1,
            //                pageIndex: 0
            //            },
            //            sorting: [
            //                {
            //                    field: "startDate",
            //                    order: "DESC" //get the latest booking
            //                }
            //            ]
            //        };

            //        var counter = 0;

            //        var variables = new Server.QueryVariablesManager();
            //        variables.set('variables', filter);

            //        Server.bookingService.getAll(variables).subscribe(r => {

            //            if (r.items.length != 0) {         // else : already a zero ? maybe change to start of the universe lol
            //                var bookableId = r.items[0].bookable.id;

            //                var c = -1;
            //                var firstArray = result.items;
            //                for (var i = 0; i < firstArray.length; i++) {
            //                    if (firstArray[i].id == bookableId) {
            //                        c = i;
            //                        break;
            //                    }
            //                }

            //                bookings[c] = r.items[0].startDate;
            //            }

            //            counter++;

            //            if (counter == result.items.length) {
            //                result.items.sortBy(bookings, order);
            //                loadElements(result.items);
            //            }
            //        });
            //    }
            //}
            //else if (nbrBookings) {

            //    var bookings = [];
            //    bookings.fillArray(result.items.length,0);

            //    for (var i = 0; i < result.items.length; i++) {

            //        var filter = {
            //            filter: {
            //                groups: [
            //                    { conditions: [{ bookable: { have: { values: [result.items[i].id] } } }] }
            //                ]
            //            },
            //            pagination: {
            //                pageSize: 1,
            //                pageIndex:0 // just for identifying the id
            //            }
            //        };

            //        var counter = 0;

            //        var variables = new Server.QueryVariablesManager();
            //        variables.set('variables', filter);

            //        Server.bookingService.getAll(variables).subscribe(r => {

            //            if (r.items.length == 0) {
            //                // no booking
            //            }
            //            else {
            //                var bookableId = r.items[0].bookable.id;        // r.length != r.items.length      !! not the same
            //                var c = -1;
            //                var firstArray = result.items;
            //                for (var i = 0; i < firstArray.length; i++) {
            //                    if (firstArray[i].id == bookableId) {
            //                        c = i;
            //                        break;
            //                    }
            //                }
            //                bookings[c] = r.length; // not items.length !
            //            }
            //            counter++;

            //            if (counter == result.items.length) {
            //                result.items.sortBy(bookings, order);
            //                loadElements(result.items);
            //            }
            //        });
            //    }
            //}
            //else {
            //    // should not happen
            //}

        });
    },


    // getBookableNbrForBookableTag()
    getBookableNbrForBookableTag: function (bookableTag, elem, before = "", after = "") {

        if (bookableTag == "Canoe_Kayak") { bookableTag = "Kayak"; }
        if (bookableTag == "Voile") { bookableTag = "Voile lestée"; }

        var filter = {
            filter: {
                groups: [{

                    conditionsLogic: 'OR',
                    joins: {

                        bookableTags: {
                            type:"leftJoin",
                            conditions: [
                                {
                                    name: {
                                        like: {
                                            value: "%" + bookableTag + "%"
                                        }
                                    }

                                }
                            ]
                        }
                    }
                },
                {

                    conditions: [{
                        isActive: { equal: { value: true } }
                    }]
                }
                ]
            },
            pagination: {
                pageSize: 0,
                pageIndex: 0
            }
        };

        if (bookableTag == "Kayak") {
            filter.filter.groups[0].joins.bookableTags.conditions.push({
                name: {
                    like: {
                        value: "%" + "Canoë" + "%"
                    }
                }
            });
        }
        else if (bookableTag == "Voile lestée") {
             filter.filter.groups[0].joins.bookableTags.conditions.push({
                 name: {
                     like: {
                         value: "%" + "voile légère" + "%"
                     }
                 }
             });
        }

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookableService.getAll(variables).subscribe(result => {
            var txt = before + result.length + after;
            elem.innerHTML = txt;
        });
    },


    // getBookableByCode
    getBookableByCode: function (elem,nbr = 0) {
        var t = true;

        var code = elem.value.toUpperCase();

        for (var i = 0; i < Cahier.bookings[0].bookables.length; i++) {
            if (Cahier.bookings[0].bookables[i].code.toUpperCase() == code) {
                t = false;
            }
        }

        // accept NE538 although the real code is NE 538
        if (code.indexOf("NE") == 0 && code.indexOf("NE ") == -1) {
            code = "NE " + code.slice(2);
          //  console.log(code);
        }
        else {
        //    console.log(code.indexOf("NE"), code.indexOf("NE "));
        }

        if (!t) {
            popAlert("Vous avez déjà choisi cette embarcation");
        }
        else {
            var filter = {
                filter: {
                    groups: [
                        {
                            conditions: [
                                { isActive: { equal: { value: true} } },
                                { code: { like: { value: code} } },
                                {
                                    bookingType: {
                                        like: {
                                            value: "self_approved"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                pagination: {
                    pageSize: 1,
                    pageIndex: 0
                }
            };

            var variables = new Server.QueryVariablesManager();
            variables.set('variables', filter);

            Server.bookableService.getAll(variables).subscribe(result => {
                //console.log("getBookableByCode(): ", result);
                if (result.items.length == 1) {
                    popBookable(result.items[0].id, false, nbr, $('divTabCahierEquipmentBookableContainer'));

                    elem.classList.remove("animationShake");
                    elem.nextElementSibling.classList.remove("animationShake");
                }
                else {
                    // retrigger animation
                    elem.classList.remove("animationShake");
                    elem.nextElementSibling.classList.remove("animationShake");

                    elem.classList.add("resetAnimation");
                    elem.nextElementSibling.classList.add("resetAnimation");

                    setTimeout(function () {
                        elem.classList.remove("resetAnimation");
                        elem.nextElementSibling.classList.remove("resetAnimation");

                        elem.classList.add("animationShake");
                        elem.nextElementSibling.classList.add("animationShake");
                    }, 5);

                }
            });
        }
    },

    // getBookableInfos
    getBookableInfos: function (nbr, bookableId, elem) {

        var filter = {
            filter: {
                groups: [
                    { conditions: [{ id: { like: { value: bookableId } } }] }
                ]
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookableService.getAll(variables).subscribe(result => {
            //console.log("getBookableInfos(): ", result);
            var filter = {
                filter: {
                    groups: [
                        {
                            joins: {
                                bookable: {
                                    conditions: [{
                                        id: {
                                            like: {
                                                value: bookableId
                                            }
                                        }
                                    }]
                                }
                            }
                        }
                    ]
                },
                pagination: {
                    pageSize: 1,
                    pageIndex: 0
                },
                sorting: [{
                    field: "startDate",
                    order: "DESC" // important
                }]
            };

            var variables = new Server.QueryVariablesManager();
            variables.set('variables', filter);

            Server.bookingService.getAll(variables).subscribe(bookings => {
                //console.log("getBookableInfos()_getLastBooking: ", bookings);
                actualizePopBookable(nbr, result.items[0], bookings, elem, []);
            });
        });
    },


    getBookableLastBooking: function (bookableId) {

        var filter = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookable: {
                                conditions: [{
                                    id: {
                                        like: {
                                            value: bookableId
                                        }
                                    }
                                }]
                            }
                        }
                    }
                ]
            },
            pagination: {
                pageSize: 1,
                pageIndex: 0
            },
            sorting: [{
                field: "startDate",
                order: "DESC" // important
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(bookings => {
          //  console.log("getBookableLastBooking(): ", bookings);
            Cahier.actualizeAvailability(bookableId, bookings.items);
        });

    },

    // 1.3
    checksBookablesAvailabilityBeforeConfirming: function (_bookables) {

        var d = new Date(Cahier.bookingStartDate.getTime() - 10 * 60 * 1000); // subtract 1 minute $$

        var f = {
            filter: {
                groups: [                    
                    {
                        groupLogic: 'AND',
                        conditionsLogic: 'OR',
                        joins: {
                            bookable: {
                                conditions: [  ]
                            }
                        }
                    }
                    ,
                    {
                        conditionsLogic: 'OR',
                        conditions: [
                            {
                                endDate: {
                                    greater: {
                                        value: d.toISOString()
                                    }
                                }
                            },
                            {
                                endDate: {
                                    null: {
                                        not: false
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            pagination: {
                pageSize: 20,
                pageIndex: 0
            }
        };


        for (var bookable of _bookables) {
            if (bookable.id != 0) { // Matériel personnel
                var condition = {
                    id: {
                        equal: {
                            value: bookable.id
                        }
                    }
                }
                f.filter.groups[0].joins.bookable.conditions.push(condition);
            }
        }

        if (f.filter.groups[0].joins.bookable.conditions.length == 0) { // means only "Matériel personnel"
            Cahier.actualizeConfirmKnowingBookablesAvailability([]);
            return;
        }

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', f);

        Server.bookingService.getAll(variables).subscribe(result => {
            //console.log("checksBookablesAvailabilityBeforeConfirming(): ", result);
            Cahier.actualizeConfirmKnowingBookablesAvailability(result.items);
        });
 

    },


    //// Add an item NO MORE USED
    //addBookable: function (_name, _description) {

    //    const item = { name: "1", description: "kj", bookingType: "self_approved", type: 6004 };

    //    Server.bookableService.create(item).subscribe(result => {
    //        //console.log('Bookable created', result);
    //    });

    //},

    // getActualBookingList()
    getActualBookingList: function () {

        //console.log("GET ACTUAL BOOKING LIST");

        var filter = {
            filter: {
                groups: [
                    {
                        groupLogic:"AND",

                        conditions: [{
                                status: {
                                    equal: {
                                        value: "booked"
                                    }
                                },
                                endDate: {
                                    null: {
                                        not: false
                                    }
                                },
                                bookable: {
                                    empty: {
                                        not: true
                                    }
                                }

                            }
                        ],
                        joins: {
                            bookable: {
                                type:"leftJoin",
                                conditions: [{
                                    bookingType: {
                                        equal: {
                                            value: "self_approved"
                                        }
                                    }
                                }]
                            }
                        }

                    },
                    {
                        groupLogic: "OR",

                        conditions: [{
                            status: {
                                equal: {
                                    value: "booked"
                                }
                            },
                            endDate: {
                                null: {
                                    not: false
                                }
                            },
                            bookable: {
                                empty: {
                                    not:false
                                }
                            }
                        }
                        ]
                    }


                ]
            },
            pagination: {
                pageSize: 500,
                pageIndex: 0
            },
            sorting: [
                {
                    field: "id",
                    order: "ASC"
                }
            ]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables, true).subscribe(result => { // force = true
            loadBottoms();
            loadActualBookings(transformBookings(result.items));
        });

    },

    // getFinishedBookingListForDay()
    getFinishedBookingListForDay: function (d = new Date(),table = "?", title) {

        var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        var end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);

        var filter = {
            filter: {
                groups: [
                    {
                        groupLogic: "AND",

                        conditions: [{
                            status: {
                                equal: {
                                    value: "booked"
                                }
                            },
                            endDate: {
                                null: {
                                    not: true
                                }
                            },
                            startDate: {
                                between: {
                                    from: start.toISOString(),
                                    to: end.toISOString()
                                }
                            },
                            bookable: {
                                empty: {
                                    not: true
                                }
                            }

                        }
                        ],
                        joins: {
                            bookable: {
                                type: "leftJoin",
                                conditions: [{
                                    bookingType: {
                                        equal: {
                                            value: "self_approved"
                                        }
                                    }
                                }]
                            }
                        }

                    },
                    {
                        groupLogic: "OR",

                        conditions: [{
                            status: {
                                equal: {
                                    value: "booked"
                                }
                            },
                            endDate: {
                                null: {
                                    not: true
                                }
                            },
                            startDate: {
                                between: {
                                    from: start.toISOString(),
                                    to: end.toISOString()
                                }
                            },
                            bookable: {
                                empty: {
                                    not: false
                                }
                            }
                        }]
                    }
                    ]
            },
            pagination: {
                pageSize: 500,
                pageIndex: 0
            },
            sorting: [
                {
                    field: "startDate",
                    order: "DESC"
                },
                {
                    field: "endDate",
                    order: "DESC" // important, last booking always has the end comment
                }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables, true).subscribe(result => {// force = true);
            //console.log("getFinishedBookingListForDay(): ", result);
            var transformedBoookings = transformBookings(result.items);
            if (result.length == 0) {
                createNoBookingMessage(d);
            }
            else {
                table = createBookingsTable(d, title + " (" + transformedBoookings.length + ")");
                Cahier.finishedBookings.push(transformedBoookings); //important
                actualizeFinishedBookingListForDay(transformedBoookings, table);
            }
        });
    },



    // getBookableHistory()
    getBookableHistory: function (bookableId, elem, lastDate, Size = 10) {

        //console.log("getbookableHistory", bookableId, "lastDate:", lastDate, "Size",Size);

        var filter = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookable: {
                                conditions: [{
                                    id: {
                                        like: {
                                            value: bookableId
                                        }
                                    }
                                }]
                            }
                        }
                    },
                    {
                        conditions: [{
                            startDate: {
                                less: {
                                    value: lastDate.toISOString()
                                }
                            }
                        }]
                    }
                ]
            },
            pagination: {
                pageSize: Size,
                pageIndex: 0
            },
            sorting: [{
                field: "startDate",
                order: "DESC"
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(first => {
            //console.log("getBookableHistory(): ", first);

            var bookings = first.items;

            if (first.items.length == 0) {
                if (elem.getElementsByClassName("Buttons").length == 1) {
                    elem.getElementsByClassName("Buttons")[0].parentElement.removeChild(elem.getElementsByClassName("Buttons")[0]);
                    elem.getElementsByTagName("br")[0].parentElement.removeChild(elem.getElementsByTagName("br")[0]);
                    var t = div(elem.getElementsByClassName("PopUpBookableHistoryContainerScroll")[0]);
                    t.innerHTML = 'Toutes les sorties ont été chargées ! <br/>';
                    t.style.textAlign = 'center';
                 }
            }
            else {
                var end = new Date(bookings[bookings.length - 1].startDate);
                var start = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0, 1);
                end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), end.getHours(), end.getMinutes(), end.getSeconds() - 1, 0);

                var filter = {
                    filter: {
                        groups: [
                            {
                                joins: {
                                    bookable: {
                                        conditions: [{
                                            id: {
                                                equal: {
                                                    value: bookableId
                                                }
                                            }
                                        }]
                                    }
                                }
                            },
                            {
                                conditions: [{
                                    startDate: {
                                        between: {
                                            from: start.toISOString(),
                                            to: end.toISOString()
                                        }
                                    }
                                }]
                            }
                        ]
                    },
                    pagination: {
                        pageSize: 100,
                        pageIndex: 0
                    },
                    sorting: [{
                        field: "startDate",
                        order: "DESC"
                    }]
                };

                var variables = new Server.QueryVariablesManager();
                variables.set('variables', filter);

                Server.bookingService.getAll(variables).subscribe(addition => {
                    //console.log("getBookableHistory()_Addition: ", addition);
                    var total = bookings.concat(addition.items);
                    actualizePopBookableHistory(total, elem);
                });

            }
        });
    },

    // getBookingsNbrBetween
    getBookingsNbrBetween: function (start,end,bookableId = "%",elem=document.body,writeIfOne = true) {
        var filter = {
            filter: {
                groups: [
                    {
                        joins: {
                            bookable: {
                                conditions: [{
                                    id: {
                                        equal: {
                                            value: bookableId
                                        }
                                    }
                                }]
                            }
                        }
                    },
                    {
                    conditions: [{
                        startDate: {
                            between: {
                                from: start,
                                to:end
                            }
                        }
                    }]
                    }
                ]
            },
            pagination: {
                pageSize: 0,
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            //console.log("getBookingsNbrBetween(): ", result.length + " sorties", result);
            if (result.length != 1 || writeIfOne == true) {
                elem.innerHTML += result.length;
                elem.parentElement.style.opacity = 1;
            }
        });
    },

    // getMonthlyBookingsNbr for divBottoms
    getMonthlyBookingsNbr: function (start, end) {

        end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 99);

        var filter = {
            filter: {
                groups: [
                    {
                        groupLogic:"AND",
                        conditions: [
                            {
                                startDate: {
                                    between: {
                                        from: start,
                                        to: end
                                    },
                                    group: {}
                                }
                            },
                            {
                                status: {
                                    equal: {
                                        value: "booked"
                                    }
                                },
                                bookable: {
                                    empty: {}
                                }
                            }
                        ]
                    },
                    {
                        groupLogic: "OR",
                        conditions: [
                            {
                                startDate: {
                                    between: {
                                        from: start,
                                        to: end
                                    },
                                    group: {}
                                }
                            }
                        ],
                        joins: {
                            bookable: {
                                type: "leftJoin",
                                conditions: [
                                    {
                                        bookingType: {
                                            equal: {
                                                value: "self_approved"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            },
            pagination: {
                pageSize: 0,
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
           // console.log("getMonthlyBookingsNbr(): ", result.length + " sorties", result);

            var all = document.getElementsByClassName("divBottoms");
            for (var i = 0; i < all.length; i++) {
                if (result.length == 0) {
                    all[i].children[0].innerHTML = "Aucune sortie ce mois";
                }
                else {
                    all[i].children[0].innerHTML = Cahier.getSingularOrPlural(result.length, " sortie") + " ce mois";
                }
            }

        });
    },


    // getStats
    getStats: function (start, end, elem) {

        var f = {
            filter: {
                groups: [
                    {
                        conditions: [{
                            startDate: {
                                between: {
                                    from: start,
                                    to: end
                                }
                            }
                        },
                        {
                            bookable: {
                                empty: {
                                    not: false
                                }
                            }
                        }
                        ]
                    },
                    {
                        groupLogic:"OR",
                        conditions: [{
                            startDate: {
                                between: {
                                    from: start,
                                    to: end
                                }
                            }
                        }],
                        joins: {
                            bookable: {
                                type: "leftJoin",
                                conditions: [
                                    {
                                        bookingType: {
                                            equal: {
                                                value: "self_approved"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            },
            pagination: {
                pageSize: 10000,
                pageIndex: 0
            },
            sorting: [{
                field: "startDate",
                order:"ASC"
            }]
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', f);

        Server.bookingService.getAll(variables).subscribe(result => {
            //console.log("getStats(): ", result);
            var send = transformBookings(result.items);
            actualizeStats(start, end, elem, send);
        });
    },

    // getBookingWithBookablesInfos
    getBookingWithBookablesInfos: function (_booking,which,elem) {

        var filter = {
            filter: {
                groups: [
                    {
                        conditions: [
                            { owner: { equal: { value: _booking.owner.id } } },
                            { startDate: { equal: { value: _booking.startDate } } }
                        ]
                    }
                ]
            },
            pagination: {
                pageSize: 100,
                pageIndex: 0
            }
        };

        var variables = new Server.QueryVariablesManager();
        variables.set('variables', filter);

        Server.bookingService.getAll(variables).subscribe(result => {
            var send = transformBookings(result.items);
            actualizePopBooking(send[0], which, elem); // should only give one booking
        });

    },


    // finishBooking
    terminateBooking: function (bookingIds = [], comments = [], realTerminate = true) {
        var c = 0;

        for (var i = 0; i < bookingIds.length; i++) {
            //console.log("terminateBooking", bookingIds[i], comments[i]);
            Server.bookingService.terminateBooking(bookingIds[i], comments[i]).subscribe(result => {
                
                c++;
                if (c === bookingIds.length) {
                    if (realTerminate) {
                        Requests.getActualBookingList();
                    }
                    else {
                        Requests.createBooking();
                    }
                    //console.log("this.terminateBooking done !");
                }
            });
        }
    },

    // deleteBookings
    deleteBookings: function (ids = ["3102"]) {

      //  Server.bookingService.deleteBookings(ids).subscribe(result => { console.log(result); });

    },

    // createBooking
    counter: 0,
    createBooking: function () {

        Requests.counter = 0;

        for (let i = 0; i < Cahier.bookings[0].bookables.length; i++) {
            var input = {
                owner: Cahier.bookings[0].owner.id,
                participantCount: i == 0 ? Cahier.bookings[0].participantCount - Cahier.bookings[0].bookables.length + 1 : 1,
                destination: Cahier.bookings[0].destination,
                startComment: Cahier.bookings[0].startComment,
                bookable: Cahier.bookings[0].bookables[i] != Cahier.personalBookable ? Cahier.bookings[0].bookables[i].id : null
            };

           // console.log(i, input.participantCount);

            Server.bookingService.create(input).subscribe(booking => {
                Requests.counter++;
                if (Requests.counter == Cahier.bookings[0].bookables.length) {
                    if (options.reloadWhenFinished) {
                        // wait til the animation finishes
                        //console.warn("La page va être rafraîchie");
                        //setTimeout(function () { location.reload(); }, 500);
                    }
                    else {
                        newTab("divTabCahier"); ableToSkipAnimation();
                        stopWaiting();
                    }
                }
            });

        }


    }

    //// personalQuery
    //personalQuery: function () {
    //    var TheQuery = Server.gql`
    //    {
    //          bookables(
    //            filter:{
    //              groups:[{
    //                conditionsLogic:OR
    //                conditions:[
    //                  {
    //                    id:{
    //                      like:{
    //                        value:"%3001%"
    //                      }
    //                    }
    //                    name:{
    //                      like:{
    //                        value:"%R15%"
    //                      }
    //                    }
    //                  }
    //                ]}
    //              ]
    //            },
    //            sorting: [{
    //	            field:id
    //              order:DESC
    //            }]
    //          )
    //          {
    //              items {
    //                id
    //                name
    //                description
    //                tags {
    //                  id
    //                }
    //              }
    //            }
    //        }
    //        `;
    //    Server.apollo.query({ query: TheQuery }).subscribe(result => {
    //        //console.log("Result of Requests.createQuery(): ", result);
    //    });
    //}


};
