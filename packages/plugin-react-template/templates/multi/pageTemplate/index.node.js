import ProviderContainer from './ProviderContainer';
import store from './store';
import { init } from './Container';

const App = () => ProviderContainer;
App.bootstrap = async (params, req, res) => {
  console.log('TCL: App.bootstrap -> params,req,res', params, req, res);
  init();
  const state = store.getState();
  return {
    state, // 状态树数据
    extraData: { test: 1 }, // 其他额外数据
    title: 'hello word', // 网页标题
    keywords: 'a,b,c', // keywords
    description: 'info', // 描述信息
    style: '<style>body{color:black;}</style>', // 动态插入的样式
  };
};
export default App;
