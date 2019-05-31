import React from 'react';

import { storiesOf } from 'storybook-react-tmp';
import { action } from '@storybook/addon-actions';
import { boolean, number, text } from '@storybook/addon-knobs';

import Comp from './Comp';
import README from './README.md';

storiesOf('Tooltips', module).add(
  'default',
  () => {
    return (
      <Comp isShow={boolean('是否显示', true)}>
        <button type="button" onClick={action('click')}>
          {text('按钮文案', 'click')}
        </button>
        <span>
          {' '}
          {number('数值', 1)}
          {' '}
        </span>
      </Comp>
    );
  },
  {
    notes: {
      markdown: README,
    },
  }
);
