import * as React from 'react';
import { render } from '@testing-library/react-native';
import '@testing-library/jest-dom/extend-expect';

import Accounts from './components/Accounts';

test('renders correctly', () => {
    const { toJSON } = render(<Accounts />);
    const json = toJSON();
    expect(json.children).toHaveLength(1);
});
