import { template } from '../template';
import { setAttribute } from './index';
import { createContext } from '../core';

describe('attributes', () => {
  const makeDiv = template('<div/>');
  describe('spreadAttributes', () => {
    //
  });

  describe('setAttribute', () => {
    it('should just set attribute', () => {
      const context = createContext(false);
      const div = makeDiv();
      setAttribute(context, div, 'tabIndex', 42);
      expect(div.getAttribute('tabIndex')).toBe('42');
      setAttribute(context, div, 'anyAttribute', 'any value');
      expect(div.getAttribute('anyAttribute')).toBe('any value');
    });

    it('should remove attribute if value is null or undefined', () => {
      const context = createContext(false);
      const div = makeDiv();
      setAttribute(context, div, 'attribute1', 'value');
      setAttribute(context, div, 'attribute2', 'value');
      expect(div.getAttribute('attribute1')).toBe('value');
      expect(div.getAttribute('attribute2')).toBe('value');
      setAttribute(context, div, 'attribute1', null);
      setAttribute(context, div, 'attribute2', undefined);
      expect(div.getAttribute('attribute1')).toBe(null);
      expect(div.getAttribute('attribute2')).toBe(null);
    });

    it('should toggle attribute if value is boolean', () => {
      const context = createContext(false);
      const div = makeDiv();
      setAttribute(context, div, 'attribute', true);
      expect(div.getAttribute('attribute')).toBe('');
      setAttribute(context, div, 'attribute', true);
      expect(div.getAttribute('attribute')).toBe('');

      setAttribute(context, div, 'attribute', false);
      expect(div.getAttribute('attribute1')).toBe(null);
      setAttribute(context, div, 'attribute', false);
      expect(div.getAttribute('attribute2')).toBe(null);
    });

    // it('should bind properties', () => {
    //   const context = createContext(false);
    //   const atom = Atom.new<any>('value');
    //   const div = makeDiv();

    //   setAttribute(context, div, 'attribute', atom),
    //     expect(div.getAttribute('attribute')).toBe('value');

    //   atom.set(42);
    //   expect(div.getAttribute('attribute')).toBe('42');

    //   atom.set(null);
    //   expect(div.getAttribute('attribute')).toBe(null);

    //   atom.set(true);
    //   expect(div.getAttribute('attribute')).toBe('');

    //   atom.set(false);
    //   expect(div.getAttribute('attribute')).toBe(null);
    // });
  });

  describe('setStyle', () => {
    //
  });

  describe('setClass', () => {
    //
  });

  describe('setValue', () => {
    //
  });

  describe('setEventListener', () => {
    //
  });
});
