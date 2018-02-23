
class SelectionController {
    constructor() {
        this.createFromSearch = this.createFromSearch.bind(this);
        this.onKeyboardSelectionFailed = this.onKeyboardSelectionFailed.bind(this);
    }

    createFromSearch(options, search) {
        console.log('Add search as item');
        console.log(arguments);
        this.search = search;
        return null;
    }

    onKeyboardSelectionFailed() {
        console.log("Search: " + this.search);
    }

}

export default SelectionController;