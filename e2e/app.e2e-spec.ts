import { AngularAutodrawPage } from './app.po';

describe('angular-autodraw App', () => {
  let page: AngularAutodrawPage;

  beforeEach(() => {
    page = new AngularAutodrawPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
