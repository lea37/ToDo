// Data Controller
var dataController = (function() {
    var data = {
        items: []
    }

    var ListItem = function(id, val) {
        this.id = id;
        this.val = val;
        this.isDone = false;
    }

    return {
        addItem: function(val, bool) {
            var newItem, id;

            // create a new id 
            if (data.items.length > 0) {
                id = data.items[data.items.length - 1].id + 1;
            } else {
                id = 0;
            }

            // create a new item
            newItem = new ListItem(id, val, bool);

            // push new item into data structure
            data.items.push(newItem);

            // return it
            return newItem;
        },

        removeItem: function(id) {
            var ids, index;

            // get all ids
            ids = data.items.map(function(el){
                return el.id;
            });

            // get which index position he has in the array
            index = ids.indexOf(id);
            if(index !== -1) {
                // delete it from data
                data.items.splice(index, 1);
            }
        },

        testing: function() {
            console.log(data);
        }
    };
})();


// Ui Controller
var uiController = (function() {
    var DOMstrings = {
        txtInput: '.input-add',
        btnSubmit: '.btn-submit',
        btnDelete: '.btn-delete',
        btnDone: '.btn-done',
        listContainer: '.list'
    }

    return {
        getInput: function() {
            return {
                value: document.querySelector(DOMstrings.txtInput).value,
            };
        },

        getDOMstrings: function() {
            return DOMstrings;
        },

        displayItem: function(obj) {
            var html, newHtml, container;

            // get items wrapper to insert
            container = DOMstrings.listContainer;

            // create html with placeholders
            html = '<div id="item-%id%" class="row"><div class="list-item six columns">%val%</div><div class="list-actions six columns"><button type="button" class="button-primary btn-done">Done</button><button type="button" class="btn-delete">Delete</button></div></div>';
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%val%', obj.val);

            // insert new html into DOM container
            document.querySelector(container).insertAdjacentHTML('beforeend', newHtml);

        },

        removeListItem: function(id) {
            var parent, el;

            el = document.getElementById(id);
            parent = el.parentNode;
            parent.removeChild(el);
        },

        updateItem: function(id) {
            document.getElementById(id).classList.add('is-done');
        },

        clearInput: function() {
            var field;

            field = document.querySelector(DOMstrings.txtInput);
            field.value = "";

            field.focus();
        }
    };
})();


// Manager Controller
var managerController = (function(dataCtrl, uiCtrl) {
    var setUpEvents = function() {
        var DOM = uiCtrl.getDOMstrings();

        // Add item event 
        document.querySelector(DOM.btnSubmit).addEventListener('click', onAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                onAddItem();
            }
        });

        // Delete item event
        document.querySelector(DOM.listContainer).addEventListener('click', onUpdateItem);

    }

    var onAddItem = function() {
        var input;

        // get input data
        input = uiCtrl.getInput();

        // add item to data controller
        newItem = dataCtrl.addItem(input.value);

        // add item to the ui
        uiCtrl.displayItem(newItem);

        // clear input and focus back on
        uiCtrl.clearInput();
    }

    var onUpdateItem = function(event) {
        var itemId, splitId, index;

        itemId = event.target.closest('.row').id;

        if (itemId) {
            splitId = itemId.split('-');
            index = parseInt(splitId[1]);

            if (event.target.classList.contains('btn-delete')) {
                // remove item from data structure
                dataCtrl.removeItem(index);

                // remove item from ui
                uiCtrl.removeListItem(itemId);
            } else if (event.target.classList.contains('btn-done')) {
                // apply done ui
                uiCtrl.updateItem(itemId);
            }
        }
    }

    return {
        init: function() {
            console.log('Application has started');
            setUpEvents();
        } 
    }
})(dataController, uiController);


managerController.init();