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

        reorderDataOnDrag: function(oldIndex, newIndex) {
            var indexArray = data.items;

            if (newIndex >= indexArray.length) {
                var k = newIndex - indexArray.length + 1;
                while (k--) {
                    indexArray.push(undefined);
                }
            }

            indexArray.splice(newIndex, 0, indexArray.splice(oldIndex, 1)[0]);
            return indexArray; // for testing
        },

        getData: function() {
            var j = data;
            return j;
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
        dragEl: '.draggable',
        empty: '.empty-state'
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
                html = '<div id="item-%id%" class="row draggable fade" draggable="true"><div class="inner"><div class="list-item six columns">%val%</div><div class="list-actions six columns"><button type="button" class="button-primary btn-done">Done</button><button type="button" class="btn-delete">Delete</button></div></div></div>';
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%val%', obj.val);

                // insert new html into DOM container
                document.querySelector(container).insertAdjacentHTML('beforeend', newHtml);
            }
        },

        removeListItem: function(id) {
            var parent, el;

            el = document.getElementById(id);
            el.classList.remove('fade');
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


var dndController = function(dataCtrl) {
    var listItems = document.querySelectorAll('.draggable');
    var dragSrcEl_ = null;
    var dragTrgEl_ = null;
    var srcId = null;
    var targetId = null;

    return {
        onDragStart: function(e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
            dragSrcEl_ = this;
            this.classList.add('moving');

            // get src el id
            var fullId = e.target.id;
            splitId = fullId.split('-');
            srcId = parseInt(splitId[1]);
        },
        onDragOver: function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return false;
        },
        onDragEnter: function(e) {
            this.classList.add('over');
        },
        onDragLeave: function() {
            this.classList.remove('over');
        },
        onDrop: function(e, el) {
            e.stopPropagation();
            this.classList.remove('over');

            if (dragSrcEl_ != this) {
                dragSrcEl_.innerHTML = this.innerHTML;
                this.innerHTML = e.dataTransfer.getData('text/html');

                // get target el id
                dragTrgEl_ = e.target;
                var fullId = dragTrgEl_.id;
                splitId = fullId.split('-');
                targetId = parseInt(splitId[1]);

                // reorder data structure
                dataCtrl.reorderDataOnDrag(srcId, targetId);

                // garbage that i have to clean but keep the is-done class whether on src or target el
                if (dragSrcEl_.classList.contains('is-done') && !dragTrgEl_.classList.contains('is-done')) {
                    dragSrcEl_.classList.remove('is-done');
                    dragTrgEl_.classList.add('is-done');
                } else if(!dragSrcEl_.classList.contains('is-done') && dragTrgEl_.classList.contains('is-done')) {
                    dragSrcEl_.classList.add('is-done');
                    dragTrgEl_.classList.remove('is-done');
                }
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
}(dataController);


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

        // clear list container
        var container = document.querySelector(DOM.listContainer);
        var emptyStateEl = document.querySelector(DOM.empty);
        if (container.contains(emptyStateEl)) {
            document.querySelector(DOM.listContainer).removeChild(emptyStateEl);
        }

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
             item.addEventListener('dragstart', dndCtrl.onDragStart, false);
             item.addEventListener('dragenter', dndCtrl.onDragEnter, false);
             item.addEventListener('dragover', dndCtrl.onDragOver, false);
             item.addEventListener('dragleave', dndCtrl.onDragLeave, false);
             item.addEventListener('drop', dndCtrl.onDrop, false);
             item.addEventListener('dragend', dndCtrl.onDragEnd, false);
        });
    }

    var onUpdateItem = function(event) {
        var itemId, splitId, index;

        itemId = event.target.closest('.row').id;

        if (itemId) {
            splitId = itemId.split('-');
            index = parseInt(splitId[1]);

            if (event.target.classList.contains('btn-delete')) {
                var confirmaton = confirm('Are you sur you want to delete this item ?');

                if (confirmaton) {
                    // remove item from data structure
                    dataCtrl.removeItem(index);
                    
                    // remove item from ui
                    uiCtrl.removeListItem(itemId);
                }


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
        } 
    }
})(dataController, uiController, dndController);


managerController.init();