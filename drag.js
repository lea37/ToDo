var listItems = document.querySelectorAll('.draggable');

var dragSrcEl = null;

function handleDragStart(e) {
  this.className += " dragStartClass";
  dragSrcEl = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  e.dataTransfer.setDragClass("dataTransferClass");

}

function handleDragOver(e) {
  // if (e.preventDefault) { not needed according to my question and anwers on : http://stackoverflow.com/questions/36920665/why-if-statement-with-e-preventdefault-drag-and-drop-javascript
  e.preventDefault();
  // }
  e.dataTransfer.dropEffect = 'move'; // sets cursor
  return false;

}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
  this.classList.add('over');
}

function handleDragLeave(e) {
  this.classList.remove('over'); // this / e.target is previous target element.
}

function handleDrop(e) {

  var listItems = document.querySelectorAll('.draggable');
  e.stopPropagation(); // stops the browser from redirecting.
  dragSrcOrderId = parseInt(dragSrcEl.getAttribute("order-id"));
  dragTargetOrderId = parseInt(this.getAttribute("order-id"));
  var tempThis = this;


  // Don't do anything if dropping the same column we're dragging.
  // and
  // check if only one difference and then do not execute
  // && ((Math.abs(dragSrcOrderId - dragTargetOrderId)) != 1)
  if (dragSrcEl != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    var tempThis = this;

    function makeNewOrderIds(tempThis) {
      // check if up or down movement

      dragSrcEl.setAttribute("order-id", dragTargetOrderId);
      tempThis.setAttribute("order-id", dragTargetOrderId);

      //  find divs between old and new location and set new ids - different in up or down movement (if else)
      if (dragSrcOrderId < dragTargetOrderId) {
        for (i = dragSrcOrderId + 1; i < dragTargetOrderId; i++) {
          listItems[i].setAttribute("order-id", i - 1);
          // set new id src
          dragSrcEl.setAttribute("order-id", dragTargetOrderId - 1);
        }
      } else {
        for (i = dragTargetOrderId; i < dragSrcOrderId; i++) {
          listItems[i].setAttribute("order-id", i + 1);
          // set new id src
          dragSrcEl.setAttribute("order-id", dragTargetOrderId);

        }
      }

    };
    makeNewOrderIds(tempThis);


    dragSrcEl.classList.remove("dragStartClass");

    reOrder(listItems);




  } else {

    dragSrcEl.classList.remove("dragStartClass");
    return false;

  }

};

function handleDragEnd(e) {

  for (i = 0; i < listItems.length; i++) {
    listItem = listItems[i];
    listItem.classList.remove('over');
  }
  dragSrcEl.classList.remove("dragStartClass");


}



for (i = 0; i < listItems.length; i++) {
  listItem = listItems[i];


  listItem.setAttribute("order-id", i);



  listItem.addEventListener('dragstart', handleDragStart, false)
  listItem.addEventListener('dragenter', handleDragEnter, false)
  listItem.addEventListener('dragover', handleDragOver, false)
  listItem.addEventListener('dragleave', handleDragLeave, false)
  listItem.addEventListener('drop', handleDrop, false)
  listItem.addEventListener('dragend', handleDragEnd, false)
}

function reOrder(listItems) {


  var tempListItems = listItems;
  tempListItems = Array.prototype.slice.call(tempListItems, 0);

  tempListItems.sort(function(a, b) {
    return a.getAttribute("order-id") - b.getAttribute("order-id");
  });



  var parent = document.querySelector('.list');
  parent.innerHTML = "";

  for (var i = 0, l = tempListItems.length; i < l; i++) {
    parent.appendChild(tempListItems[i]);
  }
};