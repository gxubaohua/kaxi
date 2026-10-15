import { describe, expect, test } from 'vitest';
import { readBuiltPage, readFixtureBuiltPage, withProductsFixture, removeFixtureOutDir } from './helpers';

// The ASIN is a maintenance-only join key (GLOSSARY: ASIN): it lives in
// Product Config for "find by ASIN and update" flows, and no page renders
// it. The committed config carries an asin on every product (ADR-0006
// catalog import), so the built HTML of the pages that display those
// products is the seam for the "never rendered" contract.
import rawProducts from '../src/content/products.json';

describe('ASIN (maintenance join key, never rendered)', () => {
  const asins = (rawProducts as { asin?: string }[])
    .map((product) => product.asin)
    .filter((asin): asin is string => typeof asin === 'string');

  test('the committed Product Config carries an ASIN on every product', () => {
    expect(asins.length).toBe((rawProducts as unknown[]).length);
  });

  test('no built page leaks any ASIN from the Product Config', () => {
    // the three page kinds that render product content: Home (featured),
    // category landing, product detail — plus the pages that carry no
    // product content at all, as the cheapest full-site proxy
    const pages = [
      'index.html',
      'products/index.html',
      'products/tablecloths/index.html',
      'products/gift-packaging/index.html',
      'products/garden-supplies/index.html',
      'products/p/foil-glitter-tablecloth-iridescent/index.html',
      'products/p/crinkle-paper-filler-white-gold/index.html',
      'products/p/plant-stake-arms-36-pcs/index.html',
      'about/index.html',
      'contact/index.html',
    ];
    for (const page of pages) {
      const html = readBuiltPage(page);
      for (const asin of asins) {
        expect(html).not.toContain(asin);
      }
    }
  });

  test('a valid ASIN in the Product Config does not fail the build', { timeout: 10 * 60 * 1000 }, () =>
    // covered implicitly by every other test file building against the
    // committed config, but asserted directly here: the fixture below is
    // the committed config with one bad asin, proving the build fails on
    // it — the companion assertion is that the committed one passes, which
    // this test pins by building the committed config (as global-setup
    // already did) and reading a detail page.
    Promise.resolve().then(() => {
      const html = readBuiltPage('products/p/foil-glitter-tablecloth-iridescent/index.html');
      expect(html).toContain('4 Pack Iridescent Plastic Tablecloths');
    }),
  );

  test('an ASIN in the wrong format fails the build naming the product', { timeout: 10 * 60 * 1000 }, () =>
    withProductsFixture('products-bad-asin.json', (result) => {
      expect(result.failed).toBe(true);
      expect(result.output).toContain('Invalid Product Config');
      expect(result.output).toContain(
        "Product '4 Pack Iridescent Plastic Tablecloths Disposable Table Cover 54 x 108 In' declares asin",
      );
      expect(result.output).toContain('b0fs11hhx1');
    }).then(removeFixtureOutDir),
  );
});
