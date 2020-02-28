const timeout = 5000;

describe(
  'router.test.js',
  () => {
    let page;
    let globalHistory;
    let lugiaxHistory;
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage();
      try {
        await page.goto('http://localhost:3000/');
      } catch (error) {
        console.info('项目目录  yarn start 启动实时编译代码');
        console.info('项目目录/packages/lugiax-example  yarn start 启动待测试用例');
        throw error;
      }

      await page.evaluate(() => (globalHistory = window.globalHistory));
      await page.evaluate(() => (lugiaxHistory = window.lugiaxHistory));
    }, timeout);

    afterAll(async () => {
      await page.close();
    });

    function getId(id) {
      return `#${id.toLowerCase()}`;
    }

    function getPageId(id) {
      return `#${id}Res`;
    }

    it('click Sport link', async () => {
      await goPageAndCheck('Sport');
    });

    it('click Car link', async () => {
      await goPageAndCheck('Car');
    });

    it('click News link not power', async () => {
      const id = 'News';
      await goPage(id);
      const html = await getHtml('P403');
      expect(html).toEqual('没有权限');
      await expectPathname('/403');
    });

    it('click Games link not power', async () => {
      const id = 'Games';
      await goPage(id);
      const html = await getHtml('P403');
      await expectPathname('/403');
      expect(html).toEqual('没有权限');
    });

    it('page.goBack', async () => {
      await page.goBack();
      await expectPathname('/403');
      await page.goBack();
      await expectPathname('/car');
      await page.goBack();
      await expectPathname('/sport');
    });

    it('page.goForward', async () => {
      await page.goForward();
      await expectPathname('/car');
      await page.goForward();
      await expectPathname('/403');
      await page.goForward();
      await expectPathname('/403');
    });

    it('history.replace goBack goForward go push', async () => {
      await page.evaluate(() => globalHistory.replace('/sport'));
      await expectPathname('/sport');
      expect(await getHtml('Sport')).toBe('Sport');

      // await historyGoBack();
      await page.evaluate(() => globalHistory.goBack());

      await expectPathname('/403');

      await page.evaluate(() => globalHistory.goBack());
      await expectPathname('/car');

      await page.evaluate(() => globalHistory.goBack());
      await expectPathname('/sport');

      await page.evaluate(() => globalHistory.goForward());
      await expectPathname('/car');

      await page.evaluate(() => globalHistory.goForward());
      await expectPathname('/403');

      await page.evaluate(() => globalHistory.goForward());
      await expectPathname('/sport');

      await page.evaluate(() => globalHistory.go(-3));
      await expectPathname('/sport');

      await page.evaluate(() => globalHistory.go(3));
      await expectPathname('/sport');
    });

    it('lugiaxHistory', async () => {
      await page.evaluate(() => lugiaxHistory.go({ url: '/news', }));
      await expectPathname('/403');

      await page.evaluate(() => lugiaxHistory.go({ url: '/sport', }));
      await expectPathname('/sport');

      await page.evaluate(() => lugiaxHistory.goBack());
      await expectPathname('/403');

      await page.evaluate(() => lugiaxHistory.goForward());
      await expectPathname('/sport');

      await page.evaluate(() => lugiaxHistory.go({ url: '/car', }));
      await expectPathname('/car');

      await page.evaluate(() => lugiaxHistory.go({ count: -2, }));
      await expectPathname('/403');

      await page.evaluate(() => lugiaxHistory.go({ count: 2, }));
      await expectPathname('/car');
    });

    it('doNotOnBeforeGo', async () => {
      await page.evaluate(() => window.doNotOnBeforeGo());
      await expectPathname('/car');
      expect(await getHtml('Car')).toBe('Car');
    });
    async function expectPathname(pathname) {
      expect(await getPathname()).toEqual(pathname);
    }
    async function getPathname() {
      return await page.evaluate(() => window.location.pathname);
    }

    async function goPageAndCheck(id, expectStr) {
      await goPage(id);
      const html = await getHtml(id);
      expect(html).toBe(expectStr ? expectStr : id);
      await expectPathname('/' + id.toLowerCase());
    }
    async function goPage(id) {
      await page.click(getId(id));
    }
    async function getHtml(id) {
      return await evaluate(body => body.innerHTML, getPageId(id));
    }

    async function evaluate(cb, id) {
      return page.evaluate(cb, await page.$(id));
    }

    async function getBody() {
      const bodyHandle = await page.$('body');
      return bodyHandle;
    }
  },
  timeout
);
