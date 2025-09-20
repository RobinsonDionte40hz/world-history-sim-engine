// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock D3 to avoid ES module issues in tests
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      data: jest.fn(() => ({
        enter: jest.fn(() => ({
          append: jest.fn(() => ({
            attr: jest.fn(() => ({
              style: jest.fn(() => ({
                text: jest.fn(() => ({
                  on: jest.fn()
                }))
              }))
            }))
          }))
        }))
      }))
    })),
    append: jest.fn(() => ({
      attr: jest.fn(() => ({
        style: jest.fn(() => ({
          text: jest.fn()
        }))
      }))
    }))
  })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn(() => ({
      range: jest.fn()
    }))
  })),
  axisBottom: jest.fn(() => ({
    scale: jest.fn()
  })),
  axisLeft: jest.fn(() => ({
    scale: jest.fn()
  }))
}));