class VIEW_UTILS {
    /* Get a boolean view, it is the view element of the check box */
    static booleanView(bool, name) {
        var span = document.createElement('span');
        span.classList = bool ? ['boolean-true'] : ['boolean-false'];
        span.textContent = name;
        return span;
    }

    static booleanEdit(bool, name, id) {
        if (!id) id = randomId();
        var div = document.createElement('div');
        var e = document.createElement('input');
        e.type = 'checkbox';
        e.checked = bool;
        e.id = id;
        div.appendChild(e);

        e = document.createElement('label');
        e.htmlFor = id;
        e.textContent = name;
        div.appendChild(e);
        return div;
    }

    /* create dynamically an image button (right) */
    static createImageButton(buttonName, buttonColored, buttonIcon, documentCreateOptions) {
        var but = document.createElement('button', documentCreateOptions);
        but.classList = 'btn image-button right';
        if (buttonColored) but.classList.add('colored');
        
        if (buttonIcon) {
           var e = document.createElement('img');
           e.src = buttonIcon;
           but.appendChild(e);

           e = document.createElement('span');
           e.textContent = I18N.getTranslation(buttonName).toUpperCase();
           but.appendChild(e);
        } else {
            but.textContent = I18N.getTranslation(buttonName).toUpperCase(); 
        }
        return but;
    }
}