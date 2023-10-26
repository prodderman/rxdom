import { Atom } from '@frp-dom/data';
import { template } from '../template';
import { setAttribute } from './index';
import { newContext, runInContext } from '../context';

describe('attributes', () => {
  const makeDiv = template('<div/>');
  describe('spreadAttributes', () => {
    //
  });

  describe('setAttribute', () => {
    it('should just set attribute', () => {
      const div = makeDiv();
      setAttribute(div, 'tabIndex', 42);
      expect(div.getAttribute('tabIndex')).toBe('42');
      setAttribute(div, 'anyAttribute', 'any value');
      expect(div.getAttribute('anyAttribute')).toBe('any value');
    });

    it('should remove attribute if value is null or undefined', () => {
      const div = makeDiv();
      setAttribute(div, 'attribute1', 'value');
      setAttribute(div, 'attribute2', 'value');
      expect(div.getAttribute('attribute1')).toBe('value');
      expect(div.getAttribute('attribute2')).toBe('value');
      setAttribute(div, 'attribute1', null);
      setAttribute(div, 'attribute2', undefined);
      expect(div.getAttribute('attribute1')).toBe(null);
      expect(div.getAttribute('attribute2')).toBe(null);
    });

    it('should toggle attribute if value is boolean', () => {
      const div = makeDiv();
      setAttribute(div, 'attribute', true);
      expect(div.getAttribute('attribute')).toBe('');
      setAttribute(div, 'attribute', true);
      expect(div.getAttribute('attribute')).toBe('');

      setAttribute(div, 'attribute', false);
      expect(div.getAttribute('attribute1')).toBe(null);
      setAttribute(div, 'attribute', false);
      expect(div.getAttribute('attribute2')).toBe(null);
    });

    it('should bind properties', () => {
      const context = newContext();
      const atom = Atom.new<any>('value');
      const div = makeDiv();

      runInContext(
        context,
        () => setAttribute(div, 'attribute', atom),
        context
      );
      expect(div.getAttribute('attribute')).toBe('value');
      expect(atom.observers).toBe(1);

      atom.set(42);
      expect(div.getAttribute('attribute')).toBe('42');

      atom.set(null);
      expect(div.getAttribute('attribute')).toBe(null);

      atom.set(true);
      expect(div.getAttribute('attribute')).toBe('');

      atom.set(false);
      expect(div.getAttribute('attribute')).toBe(null);
    });
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
