xdescribe('angularjs homepage', function() {
  it('should greet the named user', function() {
    browser.get('http://www.angularjs.org');

    element(by.model('yourName')).sendKeys('Julie');

    var greeting = element(by.binding('yourName'));

    expect(greeting.getText()).toEqual('Hello Julie!');
  });
});

describe('basic homepage', function() {
  it('should greet the named user', function() {
    browser.get('http://localhost:9000');
    var about = browser.findElement(by.partialLinkText('About'));
    about.click();
    expect(browser.getLocationAbsUrl()).toBe('/about');
    expect($('div[ng-view] p').getText()).toBe('This is the about view');
  });
});
