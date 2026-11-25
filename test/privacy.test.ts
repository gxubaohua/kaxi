// Privacy page seam: the public Privacy Policy required for the caonysh
// Amazon Ads integration review. Like every other page, assertions read the
// built HTML under dist/ and pin what a reviewer or visitor can actually see:
// the route exists, carries its own title/description, and states the policy
// sections and contact details the document must contain.
import { describe, expect, test } from 'vitest';
import { readBuiltPage, pageTitle, metaDescription } from './helpers';

describe('Privacy page (built HTML seam)', () => {
  const html = readBuiltPage('privacy/index.html');

  test('has a page-specific title and description', () => {
    expect(pageTitle(html)).toMatch(/Privacy Policy/);
    expect(metaDescription(html)).toBeTruthy();
  });

  test('names the operating company and the caonysh brand', () => {
    expect(html).toContain("Shenzhen Kaxi'an Industry and Trade Co., Ltd.");
    expect(html).toContain('caonysh');
  });

  test('covers the Data Protection sections of the policy', () => {
    for (const section of [
      'Introduction',
      'Scope and Purpose of the Application',
      'Information We Collect',
      'How We Use Collected Information',
      'Data Storage, Security, and Retention',
      'Revoking Access and Data Deletion',
      'Updates to This Privacy Policy',
      'Contact Us',
    ]) {
      expect(html, `section "${section}"`).toContain(section);
    }
  });

  test('states that no retail-customer PII is collected and no data is sold', () => {
    expect(html).toMatch(/personally identifiable information/i);
    expect(html).toMatch(/do not<\/strong> sell/i);
  });

  test('publishes the contact email for privacy questions', () => {
    expect(html).toContain('271744473@qq.com');
    expect(html).toMatch(/<a[^>]+href="mailto:271744473@qq\.com"/);
  });
});
