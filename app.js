// Data Controller
var dataController = (function() {
    var data = {
        items: [],
        total: 0,
        totalDone: 0
    }

    var ListItem = function(id, val) {
        this.id = id;
        this.val = val;
        this.isDone = false;
    }

    return {
        addItem: function(val) {
            var newItem, id;

            // create a new id 
            if (data.items.length > 0) {
                id = data.items[data.items.length - 1].id + 1;
            } else {
                id = 0;
            }

            // create a new item
            newItem = new ListItem(id, val);

            // push new item into data structure
            data.items.push(newItem);

            // return it
            if (val !== "") {
                return newItem;
            }

            var total = data.items.length;
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

        updateItemStatus: function(el) {
            data.items[el].isDone = true;
        },

        getTotalCount: function() {
            var total = data.items.length;
            data.total = total;

            return total;
        },

        getTotalDoneItem: function() {
            var doneArr = [];
            data.items.map(function(current, index){
                if (current.isDone === true) {
                    doneArr.push(data.items[index]);
                }
            });

            total = doneArr.length;
            data.totalDone = total;

            return total;
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
        listContainer: '.list',
        errorMess: '.error-message',
        counter: '.counter',
        countDone: '.counter-done',
        countTotal: '.counter-total',
        dragEl: '.draggable'
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

            if (obj.val !== undefined) {
                // get items wrapper to insert
                container = DOMstrings.listContainer;

                // create html with placeholders
                html = '<div id="item-%id%" class="row draggable" draggable="true"><div class="inner"><div class="list-item six columns">%val%</div><div class="list-actions six columns"><button type="button" class="button-primary btn-done">Done</button><button type="button" class="btn-delete">Delete</button></div></div></div>';
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%val%', obj.val);

                // insert new html into DOM container
                document.querySelector(container).insertAdjacentHTML('beforeend', newHtml);
            }
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

        updateTotalCount: function(totalVal) {
            document.querySelector(DOMstrings.countTotal).innerText = totalVal;
        },

        updateTotalDone: function(totalDone) {
            document.querySelector(DOMstrings.countDone).innerText = totalDone;
        },

        clearInput: function() {
            var field;

            field = document.querySelector(DOMstrings.txtInput);
            field.value = "";

            field.focus();
        }
    };
})();


var dndController = function() {
    var listItems = document.querySelectorAll('.draggable');
    var dragSrcEl_ = null;

    return {
        onDragStart: function(e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
            dragSrcEl_ = this;
            this.classList.add('moving');
        },
        onDragOver: function(e) {
            if (e.preventDefault) {
                 e.preventDefault();
             }
             e.dataTransfer.dropEffect = 'move';
             return false;
        },
        onDragEnter: function(e) {
            this.classList.add('over');
        },
        onDragLeave: function() {
            this.classList.remove('over');
        },
        onDrop: function(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            this.classList.remove('over');
            if (dragSrcEl_ != this) {
                dragSrcEl_.innerHTML = this.innerHTML;
                this.innerHTML = e.dataTransfer.getData('text/html');
            }
            return false;
        },
        onDragEnd: function(e) {
            [].forEach.call(listItems, function (item) {
                item.classList.remove('over');
                item.classList.remove('moving');
            });
        }
    }
}();


// Manager Controller
var managerController = (function(dataCtrl, uiCtrl, dndCtrl) {
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

    var updateCounter = function() {
        // update counter data
        totalCount = dataCtrl.getTotalCount();

        // display ui total count
        uiCtrl.updateTotalCount(totalCount);

        // update total done
        totalDone = dataCtrl.getTotalDoneItem();

        // display ui total done
        uiCtrl.updateTotalDone(totalDone);
    }


    var onAddItem = function() {
        var input, value, DOM;
        
        DOM = uiCtrl.getDOMstrings();

        // get input data
        input = uiCtrl.getInput();

        // add item to data controller
        if (input.value !== "") {
            newItem = dataCtrl.addItem(input.value);
            document.querySelector(DOM.errorMess).innerHTML = "";
        } else {
            newItem = document.querySelector(DOM.errorMess).innerHTML = "Come on... I need something to do ! :)";
        }

        // add item to the ui
        uiCtrl.displayItem(newItem);

        // clear input and focus back on
        uiCtrl.clearInput();

        // update total count
        updateCounter();

        // Sort items
        var items = document.querySelectorAll(DOM.dragEl);
        [].forEach.call(items, function (item) {
             item.addEventListener('dragstart', dndController.onDragStart, false);
             item.addEventListener('dragenter', dndController.onDragEnter, false);
             item.addEventListener('dragover', dndController.onDragOver, false);
             item.addEventListener('dragleave', dndController.onDragLeave, false);
             item.addEventListener('drop', dndController.onDrop, false);
             item.addEventListener('dragend', dndController.onDragEnd, false);
        });
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
                // update data
                dataCtrl.updateItemStatus(index);

                // apply done ui
                uiCtrl.updateItem(itemId);
            }
        }

        // update total count
        updateCounter();
    }

    return {
        init: function() {
            console.log('Application has started');
            setUpEvents();
            dndController.test();
        } 
    }
})(dataController, uiController, dndController);


managerController.init();