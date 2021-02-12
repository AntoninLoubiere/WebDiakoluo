testDBCallbacks.push(reloadTestList);

function reloadTestList() {
    var testList = document.getElementById('test-list');
    while (testList.children.length) {
        testList.removeChild(testList.children[0]);
    }
    forEachHeader().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var t = document.getElementById('test-child-template').content.cloneNode(true);
            var v = cursor.value;
            var id = cursor.value.id;
            t.querySelector('.test-title').textContent = v.title;
            t.querySelector('.test-description').textContent = v.description;
            t.children[0].onclick = function() {
                console.log("Callback, id = ", id); // TODO
            }
            testList.appendChild(t);
            cursor.continue();
        }
    };
}