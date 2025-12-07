/**
 * MapFilters Component Tests
 *
 * Tests for map search and filter component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MapFilters } from '@/components/map/MapFilters';

describe('MapFilters Component', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    selectedCategories: [],
    onCategoryChange: vi.fn(),
    sortBy: 'distance' as const,
    onSortChange: vi.fn(),
    totalCount: 100,
    filteredCount: 100,
  };

  it('should render search input', () => {
    render(<MapFilters {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/브랜드, 장소 검색/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render filter toggle button', () => {
    render(<MapFilters {...defaultProps} />);
    const filterButton = screen.getByRole('button', { name: /필터/i });
    expect(filterButton).toBeInTheDocument();
  });

  it('should display search query value', () => {
    render(<MapFilters {...defaultProps} searchQuery="테스트 검색" />);
    const searchInput = screen.getByDisplayValue('테스트 검색');
    expect(searchInput).toBeInTheDocument();
  });

  it('should call onSearchChange when typing', () => {
    render(<MapFilters {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/브랜드, 장소 검색/i);

    fireEvent.change(searchInput, { target: { value: '패션' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('패션');
  });

  it('should show clear button when search query exists', () => {
    render(<MapFilters {...defaultProps} searchQuery="test" />);
    const clearButtons = screen.getAllByRole('button');
    // Should have clear button (X icon)
    expect(clearButtons.length).toBeGreaterThan(1);
  });

  it('should clear search when clear button clicked', () => {
    const onSearchChange = vi.fn();
    render(<MapFilters {...defaultProps} searchQuery="test" onSearchChange={onSearchChange} />);

    // Find the X button (clear button)
    const buttons = screen.getAllByRole('button');
    const clearButton = buttons.find((btn) => btn.querySelector('svg'));

    if (clearButton) {
      fireEvent.click(clearButton);
      expect(onSearchChange).toHaveBeenCalledWith('');
    }
  });

  it('should show selected categories count badge', () => {
    render(<MapFilters {...defaultProps} selectedCategories={['fashion', 'beauty']} />);
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  it('should not show badge when no categories selected', () => {
    render(<MapFilters {...defaultProps} selectedCategories={[]} />);
    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });

  it('should toggle filter panel when filter button clicked', async () => {
    render(<MapFilters {...defaultProps} />);
    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1]; // Last button is filter toggle

    // Click to open
    fireEvent.click(filterToggle);

    await waitFor(() => {
      // Should show category filter text
      expect(screen.getByText('카테고리')).toBeInTheDocument();
    });
  });

  it('should display all category options when filter is open', async () => {
    render(<MapFilters {...defaultProps} />);
    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1];

    fireEvent.click(filterToggle);

    await waitFor(() => {
      expect(screen.getByText('패션')).toBeInTheDocument();
      expect(screen.getByText('뷰티')).toBeInTheDocument();
      expect(screen.getByText('K-pop')).toBeInTheDocument();
      expect(screen.getByText('푸드')).toBeInTheDocument();
      expect(screen.getByText('카페')).toBeInTheDocument();
    });
  });

  it('should call onCategoryChange when category clicked', async () => {
    const onCategoryChange = vi.fn();
    render(<MapFilters {...defaultProps} onCategoryChange={onCategoryChange} />);

    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1];
    fireEvent.click(filterToggle);

    await waitFor(() => {
      const fashionButton = screen.getByText('패션');
      fireEvent.click(fashionButton);
    });

    expect(onCategoryChange).toHaveBeenCalledWith(['fashion']);
  });

  it('should remove category when clicking already selected category', async () => {
    const onCategoryChange = vi.fn();
    render(
      <MapFilters
        {...defaultProps}
        selectedCategories={['fashion']}
        onCategoryChange={onCategoryChange}
      />
    );

    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1];
    fireEvent.click(filterToggle);

    await waitFor(() => {
      const fashionButton = screen.getByText('패션');
      fireEvent.click(fashionButton);
    });

    expect(onCategoryChange).toHaveBeenCalledWith([]);
  });

  it('should show sort dropdown when opened', async () => {
    render(<MapFilters {...defaultProps} />);

    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1];
    fireEvent.click(filterToggle);

    await waitFor(() => {
      const sortButton = screen.getByText('거리순');
      expect(sortButton).toBeInTheDocument();
    });
  });

  it('should call onSortChange when sort option selected', async () => {
    const onSortChange = vi.fn();
    render(<MapFilters {...defaultProps} onSortChange={onSortChange} />);

    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1];
    fireEvent.click(filterToggle);

    await waitFor(() => {
      const sortButton = screen.getByText('거리순');
      fireEvent.click(sortButton);
    });

    await waitFor(() => {
      const popularityOption = screen.getByText('인기순');
      fireEvent.click(popularityOption);
    });

    expect(onSortChange).toHaveBeenCalledWith('popularity');
  });

  it('should display current sort option', () => {
    render(<MapFilters {...defaultProps} sortBy="popularity" />);

    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1];
    fireEvent.click(filterToggle);

    waitFor(() => {
      expect(screen.getByText('인기순')).toBeInTheDocument();
    });
  });

  it('should show results count when filters are active', () => {
    render(
      <MapFilters
        {...defaultProps}
        selectedCategories={['fashion']}
        totalCount={100}
        filteredCount={25}
      />
    );

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('should show clear filters button when filters are active', async () => {
    render(<MapFilters {...defaultProps} selectedCategories={['fashion']} searchQuery="test" />);

    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1];
    fireEvent.click(filterToggle);

    await waitFor(() => {
      expect(screen.getByText('필터 초기화')).toBeInTheDocument();
    });
  });

  it('should clear all filters when clear button clicked', async () => {
    const onCategoryChange = vi.fn();
    const onSearchChange = vi.fn();

    render(
      <MapFilters
        {...defaultProps}
        selectedCategories={['fashion', 'beauty']}
        searchQuery="test"
        onCategoryChange={onCategoryChange}
        onSearchChange={onSearchChange}
      />
    );

    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1];
    fireEvent.click(filterToggle);

    await waitFor(() => {
      const clearButton = screen.getByText('필터 초기화');
      fireEvent.click(clearButton);
    });

    expect(onCategoryChange).toHaveBeenCalledWith([]);
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('should apply correct styles to selected categories', async () => {
    render(<MapFilters {...defaultProps} selectedCategories={['fashion']} />);

    const filterButtons = screen.getAllByRole('button');
    const filterToggle = filterButtons[filterButtons.length - 1];
    fireEvent.click(filterToggle);

    await waitFor(() => {
      const fashionButton = screen.getByText('패션').closest('button');
      expect(fashionButton).toHaveStyle({
        border: expect.stringContaining('1px solid'),
      });
    });
  });
});
