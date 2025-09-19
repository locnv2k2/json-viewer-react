import {
  safeParse,
  getValueType,
  isExpandable,
  getChildrenCount,
  buildPath,
  getValueByPath,
  // setValueByPath,
  searchInValue,
  searchInKey,
  validateMaxDepth,
  getThemeClass,
} from '../utils';

describe('Utils', () => {
  describe('safeParse', () => {
    it('should parse valid JSON', () => {
      const result = safeParse('{"key": "value"}');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    it('should handle invalid JSON', () => {
      const result = safeParse('invalid json');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty string', () => {
      const result = safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('getValueType', () => {
    it('should detect string type', () => {
      expect(getValueType('hello')).toBe('string');
    });

    it('should detect number type', () => {
      expect(getValueType(42)).toBe('number');
    });

    it('should detect boolean type', () => {
      expect(getValueType(true)).toBe('boolean');
      expect(getValueType(false)).toBe('boolean');
    });

    it('should detect null type', () => {
      expect(getValueType(null)).toBe('null');
    });

    it('should detect array type', () => {
      expect(getValueType([1, 2, 3])).toBe('array');
    });

    it('should detect object type', () => {
      expect(getValueType({ key: 'value' })).toBe('object');
    });
  });

  describe('isExpandable', () => {
    it('should return true for objects', () => {
      expect(isExpandable({ key: 'value' })).toBe(true);
    });

    it('should return true for arrays', () => {
      expect(isExpandable([1, 2, 3])).toBe(true);
    });

    it('should return false for primitives', () => {
      expect(isExpandable('string')).toBe(false);
      expect(isExpandable(42)).toBe(false);
      expect(isExpandable(true)).toBe(false);
      expect(isExpandable(null)).toBe(false);
    });
  });

  describe('getChildrenCount', () => {
    it('should count object properties', () => {
      expect(getChildrenCount({ a: 1, b: 2, c: 3 })).toBe(3);
    });

    it('should count array items', () => {
      expect(getChildrenCount([1, 2, 3, 4])).toBe(4);
    });

    it('should return 0 for primitives', () => {
      expect(getChildrenCount('string')).toBe(0);
      expect(getChildrenCount(42)).toBe(0);
      expect(getChildrenCount(null)).toBe(0);
    });
  });

  describe('buildPath', () => {
    it('should build path for object keys', () => {
      expect(buildPath('root', 'key')).toBe('root.key');
    });

    it('should build path for array indices', () => {
      expect(buildPath('root', 0)).toBe('root[0]');
    });

    it('should handle nested paths', () => {
      expect(buildPath('root.nested', 'key')).toBe('root.nested.key');
      expect(buildPath('root.array[0]', 'prop')).toBe('root.array[0].prop');
    });
  });

  describe('getValueByPath', () => {
    const testData = {
      name: 'test',
      nested: {
        value: 42,
        array: [1, 2, { deep: 'value' }]
      }
    };

    it('should get root value', () => {
      expect(getValueByPath(testData, 'root')).toBe(testData);
    });

    it('should get nested object property', () => {
      expect(getValueByPath(testData, 'root.name')).toBe('test');
      expect(getValueByPath(testData, 'root.nested.value')).toBe(42);
    });

    it('should get array item', () => {
      expect(getValueByPath(testData, 'root.nested.array[0]')).toBe(1);
      expect(getValueByPath(testData, 'root.nested.array[2].deep')).toBe('value');
    });

    it('should return undefined for invalid paths', () => {
      expect(getValueByPath(testData, 'root.invalid')).toBeUndefined();
      expect(getValueByPath(testData, 'root.nested.array[10]')).toBeUndefined();
    });
  });

  describe('searchInValue', () => {
    it('should find matches in strings', () => {
      expect(searchInValue('hello world', 'world')).toBe(true);
      expect(searchInValue('hello world', 'WORLD')).toBe(true); // case insensitive
    });

    it('should find matches in numbers', () => {
      expect(searchInValue(42, '42')).toBe(true);
      expect(searchInValue(42.5, '42.5')).toBe(true);
    });

    it('should not match non-matching values', () => {
      expect(searchInValue('hello', 'world')).toBe(false);
      expect(searchInValue(42, '43')).toBe(false);
    });
  });

  describe('searchInKey', () => {
    it('should find matches in keys', () => {
      expect(searchInKey('testKey', 'test')).toBe(true);
      expect(searchInKey('testKey', 'TEST')).toBe(true); // case insensitive
    });

    it('should not match non-matching keys', () => {
      expect(searchInKey('testKey', 'other')).toBe(false);
    });
  });

  describe('validateMaxDepth', () => {
    it('should return true for valid depths', () => {
      expect(validateMaxDepth(5, 10)).toBe(true);
      expect(validateMaxDepth(0, 5)).toBe(true);
    });

    it('should return false for exceeded depths', () => {
      expect(validateMaxDepth(10, 5)).toBe(false);
      expect(validateMaxDepth(6, 5)).toBe(false);
    });
  });

  describe('getThemeClass', () => {
    it('should return light theme class', () => {
      expect(getThemeClass('light')).toBe('jv-theme-light');
    });

    it('should return dark theme class', () => {
      expect(getThemeClass('dark')).toBe('jv-theme-dark');
    });

    it('should return custom theme class', () => {
      expect(getThemeClass('custom')).toBe('jv-theme-custom');
    });
  });
});