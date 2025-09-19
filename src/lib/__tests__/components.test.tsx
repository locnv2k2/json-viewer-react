import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JSONViewer from '../components/JSONViewer';
import TreeNode from '../components/TreeNode';
import Controls from '../components/Controls';
import InlineEditor from '../components/InlineEditor';

describe('Components', () => {
  describe('JSONViewer', () => {
    const sampleData = {
      name: 'Test',
      age: 25,
      hobbies: ['reading', 'coding']
    };

    it('should render JSON data', () => {
      render(<JSONViewer data={sampleData} />);
      
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('age')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should expand/collapse nodes', async () => {
      render(<JSONViewer data={sampleData} />);
      
      const expandButton = screen.getByRole('button', { name: /expand/i });
      await userEvent.click(expandButton);
      
      expect(screen.getByText('hobbies')).toBeInTheDocument();
    });

    it('should show controls when enabled', () => {
      render(<JSONViewer data={sampleData} config={{ showControls: true }} />);
      
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      expect(screen.getByText(/expand all/i)).toBeInTheDocument();
      expect(screen.getByText(/collapse all/i)).toBeInTheDocument();
    });

    it('should handle search', async () => {
      render(<JSONViewer data={sampleData} config={{ showControls: true }} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'Test');
      
      await waitFor(() => {
        expect(screen.getByText(/1 match/i)).toBeInTheDocument();
      });
    });

    it('should apply theme classes', () => {
      const { container } = render(<JSONViewer data={sampleData} config={{ theme: 'dark' }} />);
      
      expect(container.firstChild).toHaveClass('jv-theme-dark');
    });
  });

  describe('TreeNode', () => {
    const mockProps = {
      nodeKey: 'test',
      value: { nested: 'value' },
      path: 'root.test',
      depth: 1,
      expanded: true,
      maxNodes: 1000,
      onToggle: jest.fn(),
      config: {
        theme: 'light' as const,
        editable: false,
        showTypes: true,
        maxDepth: 10,
        showControls: false
      }
    };

    it('should render node key and value', () => {
      render(<TreeNode {...mockProps} />);
      
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('should show expand/collapse button for objects', () => {
      render(<TreeNode {...mockProps} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should call onToggle when expand button is clicked', async () => {
      render(<TreeNode {...mockProps} />);
      
      const expandButton = screen.getByRole('button');
      await userEvent.click(expandButton);
      
      expect(mockProps.onToggle).toHaveBeenCalledWith('root.test');
    });

    it('should show type badge when enabled', () => {
      render(<TreeNode {...mockProps} />);
      
      expect(screen.getByText('object')).toBeInTheDocument();
    });

    it('should render primitive values correctly', () => {
      const primitiveProps = {
        ...mockProps,
        value: 'string value',
        nodeKey: 'stringKey'
      };
      
      render(<TreeNode {...primitiveProps} />);
      
      expect(screen.getByText('string value')).toBeInTheDocument();
      expect(screen.getByText('string')).toBeInTheDocument();
    });
  });

  describe('Controls', () => {
    const mockProps = {
      searchQuery: '',
      onSearchChange: jest.fn(),
      onExpandAll: jest.fn(),
      onCollapseAll: jest.fn(),
      matchCount: 0
    };

    it('should render search input', () => {
      render(<Controls {...mockProps} />);
      
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should render expand/collapse buttons', () => {
      render(<Controls {...mockProps} />);
      
      expect(screen.getByText(/expand all/i)).toBeInTheDocument();
      expect(screen.getByText(/collapse all/i)).toBeInTheDocument();
    });

    it('should call onSearchChange when typing', async () => {
      render(<Controls {...mockProps} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await userEvent.type(searchInput, 'test');
      
      expect(mockProps.onSearchChange).toHaveBeenCalled();
    });

    it('should call onExpandAll when expand button is clicked', async () => {
      render(<Controls {...mockProps} />);
      
      const expandButton = screen.getByText(/expand all/i);
      await userEvent.click(expandButton);
      
      expect(mockProps.onExpandAll).toHaveBeenCalled();
    });

    it('should show match count', () => {
      render(<Controls {...mockProps} matchCount={5} />);
      
      expect(screen.getByText(/5 matches/i)).toBeInTheDocument();
    });
  });

  describe('InlineEditor', () => {
    const mockProps = {
      value: 'test value',
      path: 'root.test',
      onSave: jest.fn(),
      onCancel: jest.fn()
    };

    it('should render input with initial value', () => {
      render(<InlineEditor {...mockProps} />);
      
      const input = screen.getByDisplayValue('test value');
      expect(input).toBeInTheDocument();
    });

    it('should call onSave when save button is clicked', async () => {
      render(<InlineEditor {...mockProps} />);
      
      const saveButton = screen.getByTitle(/save/i);
      await userEvent.click(saveButton);
      
      expect(mockProps.onSave).toHaveBeenCalledWith('test value');
    });

    it('should call onCancel when cancel button is clicked', async () => {
      render(<InlineEditor {...mockProps} />);
      
      const cancelButton = screen.getByTitle(/cancel/i);
      await userEvent.click(cancelButton);
      
      expect(mockProps.onCancel).toHaveBeenCalled();
    });

    it('should save on Enter key', async () => {
      render(<InlineEditor {...mockProps} />);
      
      const input = screen.getByDisplayValue('test value');
      await userEvent.type(input, '{enter}');
      
      expect(mockProps.onSave).toHaveBeenCalled();
    });

    it('should cancel on Escape key', async () => {
      render(<InlineEditor {...mockProps} />);
      
      const input = screen.getByDisplayValue('test value');
      await userEvent.type(input, '{escape}');
      
      expect(mockProps.onCancel).toHaveBeenCalled();
    });

    it('should show error for invalid JSON', async () => {
      render(<InlineEditor {...mockProps} value='{"invalid": json}' />);
      
      const saveButton = screen.getByTitle(/save/i);
      await userEvent.click(saveButton);
      
      expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
    });

    it('should update input value when typing', async () => {
      render(<InlineEditor {...mockProps} />);
      
      const input = screen.getByDisplayValue('test value');
      await userEvent.clear(input);
      await userEvent.type(input, 'new value');
      
      expect(input).toHaveValue('new value');
    });
  });
});