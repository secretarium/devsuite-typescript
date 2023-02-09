import * as React from 'react';
import { render } from '@testing-library/react-native';

import { Index } from './index';

test('renders correctly', () => {
    const { getByTestId } = render(<Index />);
    expect(getByTestId('heading')).toHaveTextContent('Welcome');
});
