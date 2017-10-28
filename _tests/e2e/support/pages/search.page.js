const mixin = require('xmultiple');
const BasePage = require('./base.page');
const NavigationBar = require('../sections/navigationBar.section');
let FooterSection = require('../sections/footer');

class SearchPage extends mixin(BasePage, NavigationBar, FooterSection) {
    constructor() {
        super();

        browser.on('search-start', function(e) {
            browser.emit('log',"SEARCH STARTED");
        });

        browser.on('search-complete', function(e) {
            browser.emit('log',"SEARCH COMPLETE");
        });
    }

    open(searchTerm = '') {
        super.open(`search/${searchTerm ? `?t=${searchTerm}`: ''}`);
        browser.waitForVisible('.search')
    }

    isOnSearchPage() {
        return browser.getTitle().includes('Search Results | Red Hat Developers')
    }

    get loadingSpinner() {
        return $('.loading');
    }

    get searchField() {
        return $('.user-search');
    }

    get searchButton() {
        return $('#search-btn');
    }

    get clearFilter() {
        return $('.clearItem');
    }

    get oneBox() {
        return $('rhdp-search-onebox div h4');
    }

    get oneBoxDownLoadBtn() {
        return $('rhdp-search-onebox .button');
    }

    get resultSort() {
        return $('rhdp-search-sort-page > p > select');
    }

    get emptySearch() {
        return $('rhdp-search-results > .invalidMsg')
    }

    resultCount() {
        return $('//rhdp-search-result-count').getText();
    }

    resultCount() {
        return $('//rhdp-search-result-count').getText();
    }

    loadMoreButton() {
        return $('.moreBtn');
    }

    endOfResults() {
        return $('.end-of-results');
    }

    searchResults() {
        return $$('.result');
    }

    searchResult(i) {
        return $(`//rhdp-search-result[${i}]/div`);
    }

    searchResultTitle(i) {
        return $(`//rhdp-search-results/rhdp-search-result[${i}]/div/h4/a`);
    }

    resultInfo(i) {
        return $(`//rhdp-search-result[${i}]/div/p[1]`);
    }

    searchResultDate(i) {
        return $(`//rhdp-search-results/rhdp-search-result[${i}]/div/p[1]/rh-datetime`).datetime;
    }

    activeFilters() {
        return $('.activeFilters')
    }

    waitForSearchStart() {
        browser.on('search-start', function(e) {
            return true;
        });
    }

    waitForResultsLoaded() {
        // wait for result count value to be > 0
        //browser.waitUntil(function () {
            browser.on('search-complete', function (e) {
                let resultCount = browser.execute(function() {
                    if (e.detail && e.detail.results && e.detail.results.hits) {
                        return e.detail.results.hits.hits ? e.detail.results.hits.hits.length : 0;
                    } else {
                        return 0;
                    }
                });
                return resultCount.value !== 0;
            });
            // let resultCount = browser.execute(function () {
            //     return document.querySelector('rhdp-search-result-count').count;
            // });
            // return resultCount.value !== '0';
        //}, 30000, 'No results were found after 30 seconds');
        // this.loadingSpinner.waitForVisible(6000, true);
    }

    waitForUpdatedResults(result) {
        let getResultCount = this.resultCount;
        browser.waitUntil(function () {
            let updatedCount = getResultCount();
            return updatedCount !== result;
        }, 60000, "Results were not updated after 60 seconds");
        browser.pause(1000);
        this.loadingSpinner.waitForVisible(6000, true);
    }

    enterSearch(searchTerm) {
        this.searchField.setValue(searchTerm);
    }

    searchFor(searchTerm) {
        this.searchField.setValue(searchTerm);
        this.searchButton.click();
        this.waitForSearchStart();
        this.waitForResultsLoaded()
    }

    resultSortSelect(sortBy) {
        this.resultSort.selectByValue(sortBy.replace(/\s+/g, '-').toLowerCase());
        let selectedFilter = this.resultSort.getValue();
        if (selectedFilter !== sortBy.replace(/\s+/g, '-').toLowerCase()) {
            throw Error(`${sortBy} was not selected`)
        }
        this.waitForResultsLoaded()
    }

    chooseFilter(filterType, filterOption) {
        const isMobile = this._clickOpenMobileFilter();
        let selectedFilter;
        this._clickShowMore(isMobile);
        if (filterType === 'Content Type') {
            selectedFilter = this._selectFilter(isMobile, 1, filterOption);
        } else if (filterType === 'Product') {
            selectedFilter = this._selectFilter(isMobile, 2, filterOption);
        } else {
            selectedFilter = this._selectFilter(isMobile, 3, filterOption);
        }
        this._clickApplyMobileFilter(isMobile);
        return selectedFilter
    }

    clickOneBoxLink(link) {
        browser.click(`*=${link}`);
    }

    _selectFilter(isMobile, groupIndex, filterOption) {
        let filter;
        if (isMobile) {
            filter = browser.element(`//*[@id="cover"]/div[2]/rhdp-search-filter-group[${groupIndex}]/div/div[*]/rhdp-search-filter-item[*]/div/label[contains(text(), '${filterOption}')]`);
        } else {
            filter = browser.element(`//*[@id="control"]/div[2]/rhdp-search-filter-group[${groupIndex}]/div/div[*]/rhdp-search-filter-item/div//label[contains(text(), '${filterOption}')]`);
        }
        filter.click();
        if (filter.isSelected) {
            return filter
        } else
            throw Error(`${filter} was not selected`);
    }

    _clickOpenMobileFilter() {
        let isMobile = browser.isVisible('.showBtn');
        if (isMobile) {
            browser.click('.showBtn');
            browser.waitForVisible('.cover');
            // pause to allow cover to completely open.
            browser.pause(1000);
            return true
        } else {
            return false
        }
    }

    _clickShowMore(isMobile) {
        for (let index = 1; index < 3; index++) {
            if (isMobile) {
                browser.click(`//*[@id="cover"]/div[2]/rhdp-search-filter-group[${index}]/div/a`);
            } else {
                browser.click(`//*[@id="control"]/*/rhdp-search-filter-group[${index}]/div/a`);
            }
        }
    }

    _clickApplyMobileFilter() {
        let isMobile = browser.isVisible('.applyFilters');
        if (isMobile) {
            browser.click('.applyFilters');
            browser.pause(1000)
        }
    }

}

module.exports = new SearchPage();