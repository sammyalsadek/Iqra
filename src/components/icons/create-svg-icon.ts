/** Create an SVG icon string with standard feather-style attributes. */
export const createSvgIcon = (paths: string, viewBox = '0 0 24 24'): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
