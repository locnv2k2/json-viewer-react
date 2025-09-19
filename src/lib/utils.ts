// Path utilities
export function buildPath(parentPath: string, key: string | number): string {
  if (parentPath === '') return String(key);
  if (typeof key === 'number') {
    return `${parentPath}[${key}]`;
  }
  // Handle keys with special characters
  if (typeof key === 'string' && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return `${parentPath}.${key}`;
  }
  return `${parentPath}["${key}"]`;
}

export function getValueByPath(data: any, path: string): any {
  if (path === '' || path === 'root') return data;
  
  const keys = parsePath(path);
  let current = data;
  
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  
  return current;
}

export function setValueByPath(data: any, path: string, value: any): any {
  if (path === '' || path === 'root') return value;
  
  const keys = parsePath(path);
  const result = JSON.parse(JSON.stringify(data)); // Deep clone
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] == null) {
      current[key] = typeof keys[i + 1] === 'number' ? [] : {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
}

export function parsePath(path: string): Array<string | number> {
  if (path === '' || path === 'root') return [];
  
  const keys: Array<string | number> = [];
  let current = '';
  let inBrackets = false;
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < path.length; i++) {
    const char = path[i];
    
    if (!inBrackets && !inQuotes) {
      if (char === '.') {
        if (current) {
          keys.push(current);
          current = '';
        }
      } else if (char === '[') {
        if (current) {
          keys.push(current);
          current = '';
        }
        inBrackets = true;
      } else {
        current += char;
      }
    } else if (inBrackets && !inQuotes) {
      if (char === '"' || char === "'") {
        inQuotes = true;
        quoteChar = char;
      } else if (char === ']') {
        if (current) {
          const num = Number(current);
          keys.push(isNaN(num) ? current : num);
          current = '';
        }
        inBrackets = false;
      } else {
        current += char;
      }
    } else if (inQuotes) {
      if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else {
        current += char;
      }
    }
  }
  
  if (current) {
    keys.push(current);
  }
  
  return keys;
}

// Safe parsing utilities
export interface ParseResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function safeParse(value: string): ParseResult {
  if (value.trim() === '') {
    return { success: true, data: '' };
  }
  
  // Try JSON.parse first
  try {
    const parsed = JSON.parse(value);
    return { success: true, data: parsed };
  } catch {
    // Fallback to primitive parsing
    const trimmed = value.trim();
    
    // Boolean
    if (trimmed === 'true') return { success: true, data: true };
    if (trimmed === 'false') return { success: true, data: false };
    
    // Null
    if (trimmed === 'null') return { success: true, data: null };
    
    // Number
    const num = Number(trimmed);
    if (!isNaN(num) && isFinite(num)) {
      return { success: true, data: num };
    }
    
    // String (fallback)
    return { success: true, data: value };
  }
}

// Type detection utilities
export function getValueType(value: any): 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return typeof value as 'string' | 'number' | 'boolean';
}

export function isExpandable(value: any): boolean {
  return value !== null && (typeof value === 'object' || Array.isArray(value));
}

export function getChildrenCount(value: any): number {
  if (Array.isArray(value)) return value.length;
  if (value !== null && typeof value === 'object') return Object.keys(value).length;
  return 0;
}

// Search utilities
export function searchInValue(value: any, query: string): boolean {
  if (!query) return false;
  const lowerQuery = query.toLowerCase();
  
  if (typeof value === 'string') {
    return value.toLowerCase().includes(lowerQuery);
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).toLowerCase().includes(lowerQuery);
  }
  
  return false;
}

export function searchInKey(key: string | number, query: string): boolean {
  if (!query) return false;
  return String(key).toLowerCase().includes(query.toLowerCase());
}

// Copy utilities
export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject(new Error('Copy failed'));
      }
      document.body.removeChild(textArea);
    });
  }
}

// Validation utilities
export function validateMaxDepth(depth: number, maxDepth: number): boolean {
  return depth <= maxDepth;
}

export function validateMaxNodes(nodeCount: number, maxNodes: number): boolean {
  return nodeCount <= maxNodes;
}

// Theme utilities
export function getThemeClass(theme: string): string {
  if (theme === 'light' || theme === 'dark') {
    return `jv-theme-${theme}`;
  }
  return theme; // Custom theme class
}

// Accessibility utilities
export function getAriaLabel(key: string | number, type: string, expanded?: boolean): string {
  const expandedState = expanded !== undefined ? (expanded ? 'expanded' : 'collapsed') : '';
  return `${type} ${key} ${expandedState}`.trim();
}

// Export cn function for className utility
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Remove unused functions to fix TypeScript errors
// getChildrenCount and path are already defined above
