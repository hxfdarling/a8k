import { configure, addParameters, addDecorator } from 'storybook-react-tmp';
import '@storybook/addon-console';
import { withKnobs } from '@storybook/addon-knobs';
import { jsxDecorator } from 'storybook-addon-jsx';

addDecorator(withKnobs);
addDecorator(jsxDecorator);

addParameters({
  options: {
    name: 'storybook react 组件库',
    showPanel: true,
    panelPosition: 'right',
    enableShortcuts: true,
  },
  viewport: {
    defaultViewport: 'iphone6',
  },
});

// automatically import all files ending in *.stories.js
const req = require.context('../src/components', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
